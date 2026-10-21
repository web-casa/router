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
await mustExist(path.join(dist, 'en/getting-started/luci-first-login/index.html'), '/en/getting-started/luci-first-login/');
await mustExist(path.join(dist, 'zh/getting-started/luci-first-login/index.html'), '/zh/getting-started/luci-first-login/');
await mustExist(path.join(dist, 'en/getting-started/which-openwrt/index.html'), '/en/getting-started/which-openwrt/');
await mustExist(path.join(dist, 'zh/getting-started/which-openwrt/index.html'), '/zh/getting-started/which-openwrt/');
await mustExist(path.join(dist, 'en/getting-started/firmware-download/index.html'), '/en/getting-started/firmware-download/');
await mustExist(path.join(dist, 'zh/getting-started/firmware-download/index.html'), '/zh/getting-started/firmware-download/');
await mustExist(path.join(dist, 'en/getting-started/x86-image/index.html'), '/en/getting-started/x86-image/');
await mustExist(path.join(dist, 'zh/getting-started/x86-image/index.html'), '/zh/getting-started/x86-image/');
await mustExist(path.join(dist, 'en/network/dns/index.html'), '/en/network/dns/');
await mustExist(path.join(dist, 'zh/network/dns/index.html'), '/zh/network/dns/');
await mustExist(path.join(dist, 'en/network/ipv6/index.html'), '/en/network/ipv6/');
await mustExist(path.join(dist, 'zh/network/ipv6/index.html'), '/zh/network/ipv6/');
await mustExist(path.join(dist, 'en/network/lan-address/index.html'), '/en/network/lan-address/');
await mustExist(path.join(dist, 'zh/network/lan-address/index.html'), '/zh/network/lan-address/');
await mustExist(path.join(dist, 'en/network/wan-connectivity/index.html'), '/en/network/wan-connectivity/');
await mustExist(path.join(dist, 'zh/network/wan-connectivity/index.html'), '/zh/network/wan-connectivity/');
await mustExist(path.join(dist, 'en/network/bypass-gateway/index.html'), '/en/network/bypass-gateway/');
await mustExist(path.join(dist, 'zh/network/bypass-gateway/index.html'), '/zh/network/bypass-gateway/');
await mustExist(path.join(dist, 'en/network/ap-mode/index.html'), '/en/network/ap-mode/');
await mustExist(path.join(dist, 'zh/network/ap-mode/index.html'), '/zh/network/ap-mode/');
await mustExist(path.join(dist, 'en/remote-access/wireguard-server/index.html'), '/en/remote-access/wireguard-server/');
await mustExist(path.join(dist, 'zh/remote-access/wireguard-server/index.html'), '/zh/remote-access/wireguard-server/');
await mustExist(path.join(dist, 'en/remote-access/wireguard-client/index.html'), '/en/remote-access/wireguard-client/');
await mustExist(path.join(dist, 'zh/remote-access/wireguard-client/index.html'), '/zh/remote-access/wireguard-client/');
await mustExist(path.join(dist, 'en/installation/proxmox/index.html'), '/en/installation/proxmox/');
await mustExist(path.join(dist, 'zh/installation/proxmox/index.html'), '/zh/installation/proxmox/');
await mustExist(path.join(dist, 'en/software/adguard-home/index.html'), '/en/software/adguard-home/');
await mustExist(path.join(dist, 'zh/software/adguard-home/index.html'), '/zh/software/adguard-home/');
await mustExist(path.join(dist, 'en/software/sqm/index.html'), '/en/software/sqm/');
await mustExist(path.join(dist, 'zh/software/sqm/index.html'), '/zh/software/sqm/');
await mustExist(path.join(dist, 'en/software/openclash/index.html'), '/en/software/openclash/');
await mustExist(path.join(dist, 'zh/software/openclash/index.html'), '/zh/software/openclash/');
await mustExist(path.join(dist, 'en/software/package-sources/index.html'), '/en/software/package-sources/');
await mustExist(path.join(dist, 'zh/software/package-sources/index.html'), '/zh/software/package-sources/');
await mustExist(path.join(dist, 'en/software/apk-vs-opkg/index.html'), '/en/software/apk-vs-opkg/');
await mustExist(path.join(dist, 'zh/software/apk-vs-opkg/index.html'), '/zh/software/apk-vs-opkg/');
await mustExist(path.join(dist, 'en/recovery/backup-restore/index.html'), '/en/recovery/backup-restore/');
await mustExist(path.join(dist, 'zh/recovery/backup-restore/index.html'), '/zh/recovery/backup-restore/');
await mustExist(path.join(dist, 'en/recovery/firmware-upgrade/index.html'), '/en/recovery/firmware-upgrade/');
await mustExist(path.join(dist, 'zh/recovery/firmware-upgrade/index.html'), '/zh/recovery/firmware-upgrade/');
await mustExist(path.join(dist, 'en/troubleshooting/no-web-ui/index.html'), '/en/troubleshooting/no-web-ui/');
await mustExist(path.join(dist, 'zh/troubleshooting/no-web-ui/index.html'), '/zh/troubleshooting/no-web-ui/');
await mustExist(path.join(dist, 'en/troubleshooting/plugin-install/index.html'), '/en/troubleshooting/plugin-install/');
await mustExist(path.join(dist, 'zh/troubleshooting/plugin-install/index.html'), '/zh/troubleshooting/plugin-install/');
await mustExist(path.join(dist, 'en/troubleshooting/no-internet/index.html'), '/en/troubleshooting/no-internet/');
await mustExist(path.join(dist, 'zh/troubleshooting/no-internet/index.html'), '/zh/troubleshooting/no-internet/');
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
