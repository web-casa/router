// Translation workflow helper. See DEVELOPMENT_PLAN.md ADR-019 and docs/writing-guide.md.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LOCALE_CATALOG, getLocaleInfo } from '@fleet/docs-kit';
import {
  docsDir, inspectLocale, loadSite, missingSidebarTranslations, siteDir, sourceHash, stampSourceHash, translationsDir,
} from './lib/i18n.ts';
import { buildGlossary } from './i18n/glossary.ts';

const [command, locale, ...rest] = process.argv.slice(2);
const site = await loadSite();

function requireLocale(): string {
  if (!locale || !LOCALE_CATALOG[locale] || locale === site.defaultLocale) {
    console.error(`usage: pnpm i18n ${command} <locale>  (one of: ${Object.keys(LOCALE_CATALOG).filter((l) => l !== site.defaultLocale).join(', ')})`);
    process.exit(2);
  }
  return locale;
}

function rootFor(target: string) {
  return site.locales.includes(target) ? path.join(docsDir, target) : path.join(translationsDir, target);
}

switch (command) {
  case 'status': {
    const targets = locale ? [requireLocale()] : [...site.locales.filter((l) => l !== site.defaultLocale), ...site.i18n.planned];
    for (const target of targets) {
      const entries = await inspectLocale(site, target);
      const count = (state: string) => entries.filter((entry) => entry.state === state).length;
      console.log(`${target.padEnd(8)} fresh ${count('fresh')}  stale ${count('stale')}  unstamped ${count('unstamped')}  missing ${count('missing')}  / ${entries.length}${site.locales.includes(target) ? '  [published]' : ''}`);
      if (locale) for (const entry of entries.filter((e) => e.state !== 'fresh')) console.log(`  ${entry.state.padEnd(9)} ${entry.file}`);
    }
    break;
  }
  case 'stamp': {
    const target = requireLocale();
    const sourceRoot = path.join(docsDir, site.defaultLocale);
    const entries = (await inspectLocale(site, target)).filter((entry) => entry.path && (!rest.length || rest.includes(entry.file)));
    for (const entry of entries) {
      const hash = sourceHash(await readFile(path.join(sourceRoot, entry.file), 'utf8'));
      await writeFile(entry.path!, stampSourceHash(await readFile(entry.path!, 'utf8'), hash));
    }
    console.log(`✓ stamped ${entries.length} file(s) in ${target}`);
    break;
  }
  case 'glossary': {
    const targets = locale ? [requireLocale()] : site.i18n.planned;
    for (const target of targets) await buildGlossary(target);
    break;
  }
  case 'promote': {
    const target = requireLocale();
    if (site.locales.includes(target)) { console.error(`${target} is already published`); process.exit(1); }
    const problems: string[] = [];
    const entries = await inspectLocale(site, target);
    for (const entry of entries.filter((e) => e.state !== 'fresh')) problems.push(`${entry.file}: ${entry.state}`);
    const { default: meta } = await import(path.resolve(siteDir, 'site.meta.ts'));
    const sidebar = missingSidebarTranslations(meta.sidebar, getLocaleInfo(target).lang);
    if (sidebar.length) problems.push(`sidebar translations missing for: ${sidebar.join(', ')}`);
    if (problems.length) {
      console.error(`✗ cannot promote ${target}; a locale opens only when every page is translated and fresh:`);
      for (const problem of problems) console.error(`  - ${problem}`);
      process.exit(1);
    }
    for (const entry of entries) {
      const dest = path.join(docsDir, target, entry.file);
      await mkdir(path.dirname(dest), { recursive: true });
      await rename(entry.path!, dest);
    }
    const config = JSON.parse(await readFile('fleet.config.json', 'utf8'));
    const cfg = config.sites.find((item: { id: string }) => item.id === site.id);
    cfg.locales = [...cfg.locales, target];
    cfg.i18n.planned = cfg.i18n.planned.filter((item: string) => item !== target);
    // Keep short string arrays and the deploy object on one line, matching the hand-written file.
    const json = JSON.stringify(config, null, 2)
      .replace(/\[\s*((?:"[^"\n]*",?\s*)+)\]/g, (_m, body: string) => `[${body.trim().replace(/,\s*/g, ', ')}]`)
      .replace(/\{\s*("enabled"[^{}]*?)\s*\}/, (_m, body: string) => `{ ${body.replace(/\s*\n\s*/g, ' ')} }`)
      .replace(/\{\s*("planned"[^{}]*?)\s*\}/, (_m, body: string) => `{ ${body.replace(/\s*\n\s*/g, ' ')} }`);
    await writeFile('fleet.config.json', `${json}\n`);
    console.log(`✓ promoted ${target}: ${entries.length} page(s) moved, locale added to fleet.config.json`);
    console.log('  Still to do by hand: UI component strings, queries.<locale>.json, _redirects review, then `pnpm check`.');
    break;
  }
  default:
    console.error('usage: pnpm i18n <status|stamp|glossary|promote> [locale] [files...]');
    process.exit(2);
}
