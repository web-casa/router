import type { SiteMeta } from '@fleet/docs-kit';
import fleet from '../../fleet.config.json';

const base = fleet.sites.find((site) => site.id === 'router-homes');
if (!base) throw new Error('router-homes missing from fleet.config.json');

const meta = {
  ...base,
  customCss: ['./src/styles/theme.css'],
  components: { Search: './src/components/Search.astro' },
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
        {
          label: 'Firmware download',
          translations: { 'zh-CN': '固件下载核对' },
          slug: 'getting-started/firmware-download',
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
        {
          label: 'LAN address',
          translations: { 'zh-CN': '修改 LAN 地址' },
          slug: 'network/lan-address',
        },
        {
          label: 'WAN connectivity',
          translations: { 'zh-CN': '主路由联网' },
          slug: 'network/wan-connectivity',
        },
        {
          label: 'Bypass gateway',
          translations: { 'zh-CN': '旁路网关' },
          slug: 'network/bypass-gateway',
        },
        {
          label: 'Wired/wireless AP',
          translations: { 'zh-CN': '有线/无线 AP' },
          slug: 'network/ap-mode',
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
        {
          label: 'OpenClash',
          translations: { 'zh-CN': 'OpenClash' },
          slug: 'software/openclash',
        },
        {
          label: 'Package sources',
          translations: { 'zh-CN': '软件源' },
          slug: 'software/package-sources',
        },
      ],
    },
    {
      label: 'Upgrade & recovery',
      translations: { 'zh-CN': '升级恢复' },
      items: [
        {
          label: 'Backup and restore',
          translations: { 'zh-CN': '备份与恢复' },
          slug: 'recovery/backup-restore',
        },
      ],
    },
    {
      label: 'Troubleshooting',
      translations: { 'zh-CN': '故障排查' },
      items: [
        {
          label: "Can't reach LuCI",
          translations: { 'zh-CN': '进不去后台' },
          slug: 'troubleshooting/no-web-ui',
        },
        {
          label: 'Plugin install',
          translations: { 'zh-CN': '插件装不上' },
          slug: 'troubleshooting/plugin-install',
        },
        {
          label: 'No internet',
          translations: { 'zh-CN': '无法上网' },
          slug: 'troubleshooting/no-internet',
        },
      ],
    },
  ],
} as SiteMeta;

export default meta;
