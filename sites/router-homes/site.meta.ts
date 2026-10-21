import type { SiteMeta } from '@fleet/docs-kit';
import fleet from '../../fleet.config.json';

const base = fleet.sites.find((site) => site.id === 'router-homes');
if (!base) throw new Error('router-homes missing from fleet.config.json');

const meta = {
  ...base,
  customCss: ['@fontsource-variable/geist', '@fontsource-variable/geist-mono', './src/styles/theme.css'],
  components: {
    Search: './src/components/Search.astro',
    Hero: './src/components/Hero.astro',
    SiteTitle: './src/components/SiteTitle.astro',
    Footer: './src/components/Footer.astro',
    SocialIcons: './src/components/HeaderLinks.astro',
  },
  starlight: {
    expressiveCode: {
      themes: ['vitesse-dark', 'vitesse-light'],
      styleOverrides: {
        borderRadius: '0.75rem',
        borderColor: 'var(--rh-line)',
        codeFontFamily: 'var(--__sl-font-mono)',
        codeFontSize: '0.85rem',
        codeLineHeight: '1.7',
        uiFontFamily: 'var(--__sl-font)',
        codeBackground: 'var(--rh-code-bg)',
        frames: {
          editorBackground: 'var(--rh-code-bg)',
          terminalBackground: 'var(--rh-code-bg)',
          editorTabBarBackground: 'var(--rh-code-bar)',
          editorActiveTabBackground: 'var(--rh-code-bg)',
          editorActiveTabIndicatorTopColor: 'var(--sl-color-accent)',
          terminalTitlebarBackground: 'var(--rh-code-bar)',
          terminalTitlebarBorderBottomColor: 'var(--rh-line)',
          terminalTitlebarDotsForeground: 'var(--rh-line-strong)',
          terminalTitlebarDotsOpacity: '1',
          frameBoxShadowCssValue: 'none',
          inlineButtonBorder: 'var(--rh-line-strong)',
        },
      },
    },
  },
  // Starlight resolves sidebar translations by BCP-47 lang (zh-CN), not the locale key (zh).
  sidebar: [
    {
      label: 'Getting Started',
      translations: { 'zh-CN': '开始' },
      items: [
        {
          label: 'Download OpenWrt',
          translations: { 'zh-CN': '下载 OpenWrt' },
          slug: 'download',
        },
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
        {
          label: 'x86 image',
          translations: { 'zh-CN': 'x86 镜像选择' },
          slug: 'getting-started/x86-image',
        },
      ],
    },
    {
      label: 'OpenWrt features',
      translations: { 'zh-CN': 'OpenWrt 特性' },
      items: [
        { label: 'OpenWrt 25.12', translations: { 'zh-CN': 'OpenWrt 25.12' }, slug: 'features/openwrt-25-12' },
        { label: 'apk package manager', translations: { 'zh-CN': 'apk 包管理器' }, slug: 'features/apk' },
        { label: 'Kernel & toolchain', translations: { 'zh-CN': '内核与工具链' }, slug: 'features/kernel-toolchain' },
        { label: 'UCI configuration', translations: { 'zh-CN': 'UCI 统一配置' }, slug: 'features/uci' },
        { label: 'firewall4 / nftables', translations: { 'zh-CN': 'firewall4 防火墙' }, slug: 'features/firewall4' },
        { label: 'DSA switch ports', translations: { 'zh-CN': 'DSA 交换机端口' }, slug: 'features/dsa' },
        { label: 'WireGuard', translations: { 'zh-CN': 'WireGuard' }, slug: 'features/wireguard' },
        { label: 'SQM / CAKE', translations: { 'zh-CN': 'SQM / CAKE' }, slug: 'features/sqm' },
        { label: 'Failsafe & sysupgrade', translations: { 'zh-CN': 'Failsafe 与升级' }, slug: 'features/failsafe' },
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
          label: 'IPv6',
          translations: { 'zh-CN': 'IPv6' },
          slug: 'network/ipv6',
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
      label: 'Wireless & VLAN',
      translations: { 'zh-CN': '无线与 VLAN' },
      items: [
        {
          label: 'DSA VLAN',
          translations: { 'zh-CN': 'DSA VLAN' },
          slug: 'wireless-vlan/dsa-vlan',
        },
        {
          label: 'Guest Wi-Fi',
          translations: { 'zh-CN': '访客 Wi-Fi' },
          slug: 'wireless-vlan/guest-wifi',
        },
      ],
    },
    {
      label: 'Remote access',
      translations: { 'zh-CN': '远程访问' },
      items: [
        {
          label: 'WireGuard server',
          translations: { 'zh-CN': 'WireGuard 服务端' },
          slug: 'remote-access/wireguard-server',
        },
        {
          label: 'WireGuard client',
          translations: { 'zh-CN': 'WireGuard 客户端' },
          slug: 'remote-access/wireguard-client',
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
        {
          label: 'apk vs opkg',
          translations: { 'zh-CN': 'apk / opkg 对照' },
          slug: 'software/apk-vs-opkg',
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
        {
          label: 'Firmware upgrade',
          translations: { 'zh-CN': '固件升级' },
          slug: 'recovery/firmware-upgrade',
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
