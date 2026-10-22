import { getLocaleInfo } from '@fleet/docs-kit';
import {
  collectMarkdown, docsDir, inspectLocale, loadSite, missingSidebarTranslations, siteDir,
} from '../lib/i18n.ts';
import path from 'node:path';

const site = await loadSite();
const errors: string[] = [];
const notes: string[] = [];

// Planned locales must not leak into the built content tree (ADR-019).
for (const locale of site.i18n.planned) {
  if (site.locales.includes(locale)) errors.push(`${locale} is both published and planned`);
  if ((await collectMarkdown(path.join(docsDir, locale))).length) {
    errors.push(`${locale} is planned but has files in src/content/docs; keep them in content/translations/${locale}/`);
  }
}

// Published, hash-tracked locales must be fully fresh.
for (const locale of site.locales) {
  if (locale === site.defaultLocale || site.i18n.hashExempt.includes(locale)) continue;
  const entries = await inspectLocale(site, locale);
  const bad = entries.filter((entry) => entry.state !== 'fresh');
  for (const entry of bad) errors.push(`${locale}/${entry.file}: ${entry.state} (re-translate from ${site.defaultLocale}, then \`pnpm i18n stamp ${locale} ${entry.file}\`)`);
  if (!bad.length) notes.push(`✓ ${locale}: ${entries.length} page(s) match the source hash`);
}

// In-progress locales only warn: staleness is expected until they are promoted.
for (const locale of site.i18n.planned) {
  const entries = await inspectLocale(site, locale);
  const done = entries.filter((entry) => entry.state === 'fresh').length;
  const stale = entries.filter((entry) => entry.state === 'stale' || entry.state === 'unstamped').length;
  notes.push(`· ${locale} (planned): ${done}/${entries.length} fresh${stale ? `, ${stale} stale` : ''}`);
}

// Sidebar labels need a translation for every published non-default locale.
const { default: meta } = await import(path.resolve(siteDir, 'site.meta.ts'));
for (const locale of site.locales) {
  if (locale === site.defaultLocale) continue;
  const lang = getLocaleInfo(locale).lang;
  const missing = missingSidebarTranslations(meta.sidebar, lang);
  if (missing.length) errors.push(`sidebar has no ${lang} translation for: ${missing.join(', ')}`);
  else notes.push(`✓ sidebar translated for ${lang}`);
}

for (const note of notes) console.log(note);
if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}
console.log('✓ translations passed');
