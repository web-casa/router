import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { parseFleetConfig } from '@fleet/docs-kit';

async function collectMarkdown(dir: string, base = dir): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectMarkdown(full, base)));
    else if (/\.(md|mdx)$/.test(entry.name)) out.push(path.relative(base, full));
  }
  return out;
}

const config = parseFleetConfig(JSON.parse(await readFile('fleet.config.json', 'utf8')));
const errors: string[] = [];
const seenIds = new Set<string>();
const seenDomains = new Set<string>();
const seenProjects = new Set<string>();

for (const site of config.sites) {
  if (seenIds.has(site.id)) errors.push(`duplicate site id: ${site.id}`);
  if (seenDomains.has(site.domain)) errors.push(`duplicate domain: ${site.domain}`);
  if (seenProjects.has(site.deploy.project)) errors.push(`duplicate deploy project: ${site.deploy.project}`);
  seenIds.add(site.id);
  seenDomains.add(site.domain);
  seenProjects.add(site.deploy.project);

  const siteDir = path.join('sites', site.id);
  try {
    await access(path.join(siteDir, 'package.json'));
    await access(path.join(siteDir, 'astro.config.ts'));
    await access(path.join(siteDir, 'src/content.config.ts'));
  } catch {
    errors.push(`missing scaffold for ${site.id}`);
  }
  if (site.deploy.enabled && site.deploy.domainStatus === 'unbound') {
    errors.push(`${site.id}: deploy.enabled=true while domainStatus=unbound`);
  }

  // v1 rule: only paired pages may enter src/content/docs.
  // Starlight generates a fallback page for an unpaired entry, so unpaired
  // pages must stay in content/drafts/ instead of the built content tree.
  const docsDir = path.join(siteDir, 'src/content/docs');
  const [primary, secondary] = site.locales;
  try {
    const primaryFiles = new Set(await collectMarkdown(path.join(docsDir, primary)));
    const secondaryFiles = new Set(await collectMarkdown(path.join(docsDir, secondary)));
    for (const file of primaryFiles) {
      if (!secondaryFiles.has(file)) errors.push(`${site.id}: missing ${secondary} pair for ${primary}/${file}`);
    }
    for (const file of secondaryFiles) {
      if (!primaryFiles.has(file)) errors.push(`${site.id}: missing ${primary} pair for ${secondary}/${file}`);
    }
  } catch {
    errors.push(`${site.id}: missing locale content directories ${primary}/ and ${secondary}/`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}
console.log(`✓ fleet config valid: ${config.sites.length} site(s)`);
for (const site of config.sites) {
  console.log(`  - ${site.id} → https://${site.domain} (${site.deploy.domainStatus})`);
}
