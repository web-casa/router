import { createHash } from 'node:crypto';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { parseFleetConfig, type SiteConfig } from '@fleet/docs-kit';

export const SITE_ID = 'router-homes';
export const siteDir = path.join('sites', SITE_ID);
export const docsDir = path.join(siteDir, 'src/content/docs');
export const translationsDir = 'content/translations';

export async function exists(file: string) {
  try { await access(file); return true; } catch { return false; }
}

export async function loadSite(): Promise<SiteConfig> {
  const config = parseFleetConfig(JSON.parse(await readFile('fleet.config.json', 'utf8')));
  const site = config.sites.find((item) => item.id === SITE_ID);
  if (!site) throw new Error(`${SITE_ID} missing from fleet.config.json`);
  return site;
}

/** Relative paths of every .md/.mdx file below `dir` (empty when the directory does not exist). */
export async function collectMarkdown(dir: string, base = dir): Promise<string[]> {
  if (!(await exists(dir))) return [];
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectMarkdown(full, base)));
    else if (/\.(md|mdx)$/.test(entry.name)) out.push(path.relative(base, full));
  }
  return out.sort();
}

/** Stable fingerprint of a source page: line endings and trailing whitespace do not count. */
export function sourceHash(content: string): string {
  const normalized = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export function readSourceHash(content: string): string | undefined {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1];
  return frontmatter?.match(/^sourceHash:\s*['"]?([0-9a-f]+)['"]?\s*$/m)?.[1];
}

/** Insert or replace `sourceHash` as the last frontmatter key. */
export function stampSourceHash(content: string, hash: string): string {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('translation has no frontmatter');
  const line = `sourceHash: '${hash}'`;
  const body = /^sourceHash:.*$/m.test(match[1])
    ? match[1].replace(/^sourceHash:.*$/m, line)
    : `${match[1]}\n${line}`;
  return content.replace(match[0], `---\n${body}\n---`);
}

export type TranslationState = 'fresh' | 'stale' | 'unstamped' | 'missing';

export interface TranslationEntry {
  file: string;
  state: TranslationState;
  /** Where the translation lives, when it exists. */
  path?: string;
}

/** Compare one locale against the default-locale source pages. */
export async function inspectLocale(site: SiteConfig, locale: string): Promise<TranslationEntry[]> {
  const sourceRoot = path.join(docsDir, site.defaultLocale);
  const published = site.locales.includes(locale);
  const root = published ? path.join(docsDir, locale) : path.join(translationsDir, locale);
  const entries: TranslationEntry[] = [];
  for (const file of await collectMarkdown(sourceRoot)) {
    const target = path.join(root, file);
    if (!(await exists(target))) {
      entries.push({ file, state: 'missing' });
      continue;
    }
    const expected = sourceHash(await readFile(path.join(sourceRoot, file), 'utf8'));
    const actual = readSourceHash(await readFile(target, 'utf8'));
    entries.push({ file, path: target, state: actual === undefined ? 'unstamped' : actual === expected ? 'fresh' : 'stale' });
  }
  return entries;
}

/** Sidebar labels (recursively) that have no translation for `lang`. */
export function missingSidebarTranslations(
  items: { label?: string; translations?: Record<string, string>; items?: unknown[] }[],
  lang: string,
): string[] {
  const missing: string[] = [];
  for (const item of items) {
    if (item.label && !item.translations?.[lang]) missing.push(item.label);
    if (item.items) missing.push(...missingSidebarTranslations(item.items as typeof items, lang));
  }
  return missing;
}
