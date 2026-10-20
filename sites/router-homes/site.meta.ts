import type { SiteMeta } from '@fleet/docs-kit';
import fleet from '../../fleet.config.json';

const base = fleet.sites.find((site) => site.id === 'router-homes');
if (!base) throw new Error('router-homes missing from fleet.config.json');

const meta = {
  ...base,
  customCss: ['./src/styles/theme.css'],
  // Starlight resolves sidebar translations by BCP-47 lang (zh-CN), not the locale key (zh).
  sidebar: [
    {
      label: 'Getting Started',
      translations: { 'zh-CN': '开始' },
      items: [
        {
          label: 'Overview',
          translations: { 'zh-CN': '概览' },
          slug: 'getting-started/overview',
        },
        {
          label: 'First LuCI login',
          translations: { 'zh-CN': '首次登录 LuCI' },
          slug: 'getting-started/luci-first-login',
        },
        {
          label: 'Which OpenWrt?',
          translations: { 'zh-CN': '固件辨识' },
          slug: 'getting-started/which-openwrt',
        },
      ],
    },
    {
      label: 'Network',
      translations: { 'zh-CN': '网络' },
      items: [
        {
          label: 'DNS',
          translations: { 'zh-CN': 'DNS 设置' },
          slug: 'network/dns',
        },
      ],
    },
    {
      label: 'Installation',
      translations: { 'zh-CN': '安装' },
      items: [
        {
          label: 'Proxmox',
          translations: { 'zh-CN': 'PVE' },
          slug: 'installation/proxmox',
        },
      ],
    },
    {
      label: 'Software',
      translations: { 'zh-CN': '软件' },
      items: [
        {
          label: 'AdGuard Home',
          translations: { 'zh-CN': 'AdGuard Home' },
          slug: 'software/adguard-home',
        },
        {
          label: 'SQM / CAKE',
          translations: { 'zh-CN': 'SQM / CAKE' },
          slug: 'software/sqm',
        },
      ],
    },
  ],
} as SiteMeta;

export default meta;
