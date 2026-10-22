// Build docs/i18n/glossary/<locale>.json from LuCI's own .po files so the docs say
// what a user sees after switching LuCI to that language.
import { readFile, writeFile } from 'node:fs/promises';
import { getLocaleInfo } from '@fleet/docs-kit';

const RAW = 'https://raw.githubusercontent.com/openwrt/luci/master';
// [directory, domain] pairs; later files only fill terms earlier files lack.
const PO_FILES: [string, string][] = [
  ['modules/luci-base', 'base'],
  ['modules/luci-mod-network', 'network'],
  ['modules/luci-mod-system', 'system'],
  ['applications/luci-app-firewall', 'firewall'],
  ['applications/luci-app-sqm', 'sqm'],
  ['protocols/luci-proto-wireguard', 'wireguard'],
];

function unquote(raw: string): string {
  return raw
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/** Minimal .po reader: msgid -> msgstr for blocks without msgctxt that carry a translation. */
export function parsePo(text: string, obsolete = false): Map<string, string> {
  const out = new Map<string, string>();
  for (const block of text.split(/\n\s*\n/)) {
    if (block.split('\n').some((line) => line.startsWith('#~')) !== obsolete) continue;
    let id = '';
    let str = '';
    let field: 'id' | 'str' | undefined;
    let hasCtx = false;
    for (const raw of block.split('\n')) {
      const line = raw.replace(/^#~\s?/, '');
      if (line.startsWith('msgctxt')) hasCtx = true;
      else if (line.startsWith('msgid ')) { id = unquote(line.slice(6)); field = 'id'; }
      else if (line.startsWith('msgstr ')) { str = unquote(line.slice(7)); field = 'str'; }
      else if (line.startsWith('"')) {
        if (field === 'id') id += unquote(line);
        else if (field === 'str') str += unquote(line);
      }
    }
    if (!hasCtx && id && str) out.set(id, str);
  }
  return out;
}

export async function buildGlossary(locale: string) {
  const code = getLocaleInfo(locale).luciPo;
  if (!code) throw new Error(`${locale} has no LuCI po code`);
  const terms: string[] = JSON.parse(await readFile('docs/i18n/luci-terms.json', 'utf8'));
  const tables: [string, Map<string, string>][] = [];
  const obsolete: [string, Map<string, string>][] = [];
  for (const [dir, domain] of PO_FILES) {
    const url = `${RAW}/${dir}/po/${code}/${domain}.po`;
    const res = await fetch(url);
    if (!res.ok) { console.warn(`  skip ${url} (${res.status})`); continue; }
    const text = await res.text();
    tables.push([`${domain}.po`, parsePo(text)]);
    obsolete.push([`${domain}.po`, parsePo(text, true)]);
  }
  const entries = terms.map((en) => {
    for (const [source, table] of tables) {
      const tr = table.get(en);
      if (tr) return { en, tr, official: true, source };
    }
    // Strings LuCI moved between packages stay in .po as obsolete entries; usable, but check them against a live LuCI.
    for (const [source, table] of obsolete) {
      const tr = table.get(en);
      if (tr) return { en, tr, official: true, verify: true, source: `${source} (obsolete entry)` };
    }
    return { en, tr: en, official: false };
  });
  const file = `docs/i18n/glossary/${locale}.json`;
  await writeFile(file, `${JSON.stringify({ locale, luciPo: code, entries }, null, 2)}\n`);
  const missing = entries.filter((entry) => !entry.official).length;
  const verify = entries.filter((entry) => 'verify' in entry).length;
  console.log(`✓ ${file}: ${entries.length - missing}/${entries.length} official (${verify} to verify), ${missing} kept in English`);
}
