import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

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

await mustNotExist(path.join(dist, 'index.html'), 'root index.html');
await mustExist(path.join(dist, '_redirects'), '_redirects');
await mustExist(path.join(dist, 'en/index.html'), '/en/ home');
await mustExist(path.join(dist, 'zh/index.html'), '/zh/ home');
await mustExist(path.join(dist, 'en/network/dns/index.html'), '/en/network/dns/');
await mustExist(path.join(dist, 'zh/network/dns/index.html'), '/zh/network/dns/');
await mustExist(path.join(dist, 'en/installation/proxmox/index.html'), '/en/installation/proxmox/');
await mustExist(path.join(dist, 'zh/installation/proxmox/index.html'), '/zh/installation/proxmox/');
await mustNotExist(path.join(dist, 'en/only-en/index.html'), '/en/only-en/ unpaired fixture');
await mustNotExist(path.join(dist, 'zh/only-en/index.html'), '/zh/only-en/ fallback');
await mustExist(path.join(dist, '404.html'), '404 page');
await mustExist(path.join(dist, 'pagefind'), 'Pagefind directory');

if (await exists(path.join(dist, '_redirects'))) {
  const redirects = await readFile(path.join(dist, '_redirects'), 'utf8');
  if (!/^\/\s+\/en\/\s+301$/m.test(redirects)) errors.push('_redirects must contain: / /en/ 301');
  else notes.push('✓ root redirect rule');
}

const html = await readFile(path.join(dist, 'en/network/dns/index.html'), 'utf8');
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (canonical !== 'https://router.homes/en/network/dns/') errors.push(`bad EN canonical: ${canonical}`);
else notes.push('✓ EN canonical');
const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({ lang: m[1], href: m[2] }));
if (!hreflangs.some((item) => item.lang === 'en' && item.href.endsWith('/en/network/dns/'))) errors.push('missing EN hreflang');
if (!hreflangs.some((item) => (item.lang === 'zh' || item.lang === 'zh-CN') && item.href.endsWith('/zh/network/dns/'))) errors.push('missing ZH hreflang');
if (hreflangs.length) notes.push(`✓ hreflang (${hreflangs.length})`);

const zhHtml = await readFile(path.join(dist, 'zh/network/dns/index.html'), 'utf8');
const zhCanonical = zhHtml.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (zhCanonical !== 'https://router.homes/zh/network/dns/') errors.push(`bad ZH canonical: ${zhCanonical}`);
else notes.push('✓ ZH canonical');

const sitemapFiles = (await readdir(dist)).filter((file) => file.startsWith('sitemap') && file.endsWith('.xml'));
if (!sitemapFiles.length) errors.push('no sitemap XML found');
else {
  const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(path.join(dist, file), 'utf8')))).join('\n');
  if (!sitemap.includes('/en/network/dns/')) errors.push('sitemap missing EN DNS');
  if (!sitemap.includes('/zh/network/dns/')) errors.push('sitemap missing ZH DNS');
  if (sitemap.includes('/en/only-en/')) errors.push('sitemap contains unpaired /en/only-en/');
  if (sitemap.includes('/zh/only-en/')) errors.push('sitemap contains missing translation /zh/only-en/');
  notes.push(`✓ sitemap (${sitemapFiles.join(', ')})`);
}

for (const note of notes) console.log(note);
if (errors.length) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}
console.log('✓ i18n vertical slice passed');
