import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { getLocaleInfo } from '@fleet/docs-kit';
import { collectMarkdown, docsDir, loadSite } from '../lib/i18n.ts';

const dist = path.resolve('sites/router-homes/dist');
const errors: string[] = [];
const notes: string[] = [];

async function exists(file: string) {
  try { await access(file); return true; } catch { return false; }
}
async function mustExist(file: string, label: string) {
  if (await exists(file)) notes.push(`✓ ${label}`);
  else errors.push(`missing ${label}: ${file}`);
}
async function mustNotExist(file: string, label: string) {
  if (await exists(file)) errors.push(`unexpected ${label}: ${file}`);
  else notes.push(`✓ ${label} absent`);
}

const site = await loadSite();
const sourcePages = (await collectMarkdown(path.join(docsDir, site.defaultLocale)))
  .map((file) => file.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, ''));
const sample = 'network/dns';

await mustNotExist(path.join(dist, 'index.html'), 'root index.html');
await mustExist(path.join(dist, '_redirects'), '_redirects');
// Every published locale must build every source page (ADR-019: no partial locales).
for (const locale of site.locales) {
  for (const slug of sourcePages) {
    const file = path.join(dist, locale, slug, 'index.html');
    if (await exists(file)) continue;
    errors.push(`missing /${locale}/${slug ? `${slug}/` : ''}: ${file}`);
  }
  notes.push(`✓ /${locale}/ builds ${sourcePages.length} page(s)`);
}
for (const locale of site.i18n.planned) {
  await mustNotExist(path.join(dist, locale, 'index.html'), `/${locale}/ (planned, not published)`);
}
await mustNotExist(path.join(dist, 'en/only-en/index.html'), '/en/only-en/ unpaired fixture');
await mustNotExist(path.join(dist, 'zh/only-en/index.html'), '/zh/only-en/ fallback');
await mustExist(path.join(dist, '404.html'), '404 page');
await mustExist(path.join(dist, 'pagefind'), 'Pagefind directory');

if (await exists(path.join(dist, '_redirects'))) {
  const redirects = await readFile(path.join(dist, '_redirects'), 'utf8');
  if (!/^\/\s+\/en\/\s+301$/m.test(redirects)) errors.push('_redirects must contain: / /en/ 301');
  else notes.push('✓ root redirect rule');
  if (!/^\/zh-hans\/\*\s+\/zh\/:splat\s+301$/m.test(redirects)) errors.push('_redirects must contain: /zh-hans/* /zh/:splat 301');
  else notes.push('✓ /zh-hans/* redirect rule');
}

const sitemapFiles = (await readdir(dist)).filter((file) => file.startsWith('sitemap') && file.endsWith('.xml'));
const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(path.join(dist, file), 'utf8')))).join('\n');
if (!sitemapFiles.length) errors.push('no sitemap XML found');

const samplePages = await Promise.all(site.locales.map(async (locale) => ({
  locale,
  html: await readFile(path.join(dist, locale, sample, 'index.html'), 'utf8'),
})));
for (const { locale, html } of samplePages) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== `https://${site.domain}/${locale}/${sample}/`) errors.push(`bad ${locale} canonical: ${canonical}`);
  else notes.push(`✓ ${locale} canonical`);

  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({ lang: m[1], href: m[2] }));
  for (const other of site.locales) {
    const { lang } = getLocaleInfo(other);
    if (!alternates.some((item) => item.lang === lang && item.href.endsWith(`/${other}/${sample}/`))) errors.push(`${locale}: missing hreflang ${lang} -> /${other}/${sample}/`);
  }
  for (const planned of site.i18n.planned) {
    if (html.includes(`/${planned}/`)) errors.push(`${locale}: page links to unpublished locale /${planned}/`);
  }
  if (sitemapFiles.length && !sitemap.includes(`/${locale}/${sample}/`)) errors.push(`sitemap missing ${locale} ${sample}`);
}
if (sitemapFiles.length) {
  if (sitemap.includes('/en/only-en/')) errors.push('sitemap contains unpaired /en/only-en/');
  if (sitemap.includes('/zh/only-en/')) errors.push('sitemap contains missing translation /zh/only-en/');
  for (const planned of site.i18n.planned) {
    if (sitemap.includes(`/${planned}/`)) errors.push(`sitemap contains unpublished locale /${planned}/`);
  }
  notes.push(`✓ sitemap (${sitemapFiles.join(', ')})`);
}

for (const note of notes) console.log(note);
if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}
console.log('✓ i18n checks passed');
