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
      translations: { ja: 'はじめに', 'zh-CN': '开始', 'zh-Hant': '開始', es: 'Primeros pasos', de: 'Erste Schritte', fr: 'Premiers pas' },
      items: [
        {
          label: 'Download OpenWrt',
          translations: { ja: 'OpenWrt のダウンロード', 'zh-CN': '下载 OpenWrt', 'zh-Hant': '下載 OpenWrt', es: 'Descargar OpenWrt', de: 'OpenWrt herunterladen', fr: 'Télécharger OpenWrt' },
          slug: 'download',
        },
        {
          label: 'Overview',
          translations: { ja: '概要', 'zh-CN': '概览', 'zh-Hant': '概覽', es: 'Vista general', de: 'Übersicht', fr: 'Vue d’ensemble' },
          slug: 'getting-started/overview',
        },
        {
          label: 'First LuCI login',
          translations: { ja: 'LuCI への初回ログイン', 'zh-CN': '首次登录 LuCI', 'zh-Hant': '首次登入 LuCI', es: 'Primer acceso a LuCI', de: 'Erste Anmeldung bei LuCI', fr: 'Première connexion à LuCI' },
          slug: 'getting-started/luci-first-login',
        },
        {
          label: 'Which OpenWrt?',
          translations: { ja: 'OpenWrt の見分け方', 'zh-CN': '固件辨识', 'zh-Hant': '韌體辨識', es: '¿Qué OpenWrt?', de: 'Welches OpenWrt?', fr: 'Quel OpenWrt ?' },
          slug: 'getting-started/which-openwrt',
        },
        {
          label: 'Firmware download',
          translations: { ja: 'ファームウェアのダウンロード', 'zh-CN': '固件下载核对', 'zh-Hant': '韌體下載核對', es: 'Descarga del firmware', de: 'Firmware-Download', fr: 'Téléchargement du firmware' },
          slug: 'getting-started/firmware-download',
        },
        {
          label: 'x86 image',
          translations: { ja: 'x86 イメージ', 'zh-CN': 'x86 镜像选择', 'zh-Hant': 'x86 映像檔選擇', es: 'Imagen x86', de: 'x86-Image', fr: 'Image x86' },
          slug: 'getting-started/x86-image',
        },
      ],
    },
    {
      label: 'OpenWrt features',
      translations: { ja: 'OpenWrt の機能', 'zh-CN': 'OpenWrt 特性', 'zh-Hant': 'OpenWrt 特性', es: 'Funciones de OpenWrt', de: 'OpenWrt-Funktionen', fr: 'Fonctionnalités d’OpenWrt' },
      items: [
        { label: 'OpenWrt 25.12', translations: { ja: 'OpenWrt 25.12', 'zh-CN': 'OpenWrt 25.12', 'zh-Hant': 'OpenWrt 25.12', es: 'OpenWrt 25.12', de: 'OpenWrt 25.12', fr: 'OpenWrt 25.12' }, slug: 'features/openwrt-25-12' },
        { label: 'apk package manager', translations: { ja: 'パッケージマネージャー apk', 'zh-CN': 'apk 包管理器', 'zh-Hant': 'apk 套件管理員', es: 'Gestor de paquetes apk', de: 'Paketmanager apk', fr: 'Gestionnaire de paquets apk' }, slug: 'features/apk' },
        { label: 'Kernel & toolchain', translations: { ja: 'カーネルとツールチェーン', 'zh-CN': '内核与工具链', 'zh-Hant': '核心與工具鏈', es: 'Kernel y toolchain', de: 'Kernel & Toolchain', fr: 'Noyau et chaîne d’outils' }, slug: 'features/kernel-toolchain' },
        { label: 'UCI configuration', translations: { ja: 'UCI の設定', 'zh-CN': 'UCI 统一配置', 'zh-Hant': 'UCI 統一設定', es: 'Configuración UCI', de: 'UCI-Konfiguration', fr: 'Configuration UCI' }, slug: 'features/uci' },
        { label: 'firewall4 / nftables', translations: { ja: 'firewall4 / nftables', 'zh-CN': 'firewall4 防火墙', 'zh-Hant': 'firewall4 防火牆', es: 'firewall4 / nftables', de: 'firewall4 / nftables', fr: 'firewall4 / nftables' }, slug: 'features/firewall4' },
        { label: 'DSA switch ports', translations: { ja: 'DSA スイッチポート', 'zh-CN': 'DSA 交换机端口', 'zh-Hant': 'DSA 交換器連接埠', es: 'Puertos de switch DSA', de: 'DSA-Switch-Ports', fr: 'Ports de switch DSA' }, slug: 'features/dsa' },
        { label: 'WireGuard', translations: { ja: 'WireGuard', 'zh-CN': 'WireGuard', 'zh-Hant': 'WireGuard', es: 'WireGuard', de: 'WireGuard', fr: 'WireGuard' }, slug: 'features/wireguard' },
        { label: 'SQM / CAKE', translations: { ja: 'SQM / CAKE', 'zh-CN': 'SQM / CAKE', 'zh-Hant': 'SQM / CAKE', es: 'SQM / CAKE', de: 'SQM / CAKE', fr: 'SQM / CAKE' }, slug: 'features/sqm' },
        { label: 'Failsafe & sysupgrade', translations: { ja: 'Failsafe と sysupgrade', 'zh-CN': 'Failsafe 与升级', 'zh-Hant': 'Failsafe 與升級', es: 'Failsafe y sysupgrade', de: 'Failsafe & sysupgrade', fr: 'Failsafe et sysupgrade' }, slug: 'features/failsafe' },
      ],
    },
    {
      label: 'Network',
      translations: { ja: 'ネットワーク', 'zh-CN': '网络', 'zh-Hant': '網路', es: 'Red', de: 'Netzwerk', fr: 'Réseau' },
      items: [
        {
          label: 'DNS',
          translations: { ja: 'DNS', 'zh-CN': 'DNS 设置', 'zh-Hant': 'DNS 設定', es: 'DNS', de: 'DNS', fr: 'DNS' },
          slug: 'network/dns',
        },
        {
          label: 'IPv6',
          translations: { ja: 'IPv6', 'zh-CN': 'IPv6', 'zh-Hant': 'IPv6', es: 'IPv6', de: 'IPv6', fr: 'IPv6' },
          slug: 'network/ipv6',
        },
        {
          label: 'LAN address',
          translations: { ja: 'LAN アドレス', 'zh-CN': '修改 LAN 地址', 'zh-Hant': '修改 LAN 位址', es: 'Dirección LAN', de: 'LAN-Adresse', fr: 'Adresse LAN' },
          slug: 'network/lan-address',
        },
        {
          label: 'WAN connectivity',
          translations: { ja: 'WAN 接続', 'zh-CN': '主路由联网', 'zh-Hant': '主路由器連線', es: 'Conectividad WAN', de: 'WAN-Anbindung', fr: 'Connectivité WAN' },
          slug: 'network/wan-connectivity',
        },
        {
          label: 'Bypass gateway',
          translations: { ja: 'バイパスゲートウェイ', 'zh-CN': '旁路网关', 'zh-Hant': '旁路閘道', es: 'Puerta de enlace en paralelo', de: 'Bypass-Gateway', fr: 'Passerelle en dérivation' },
          slug: 'network/bypass-gateway',
        },
        {
          label: 'Wired/wireless AP',
          translations: { ja: '有線/無線 AP', 'zh-CN': '有线/无线 AP', 'zh-Hant': '有線／無線 AP', es: 'AP por cable/inalámbrico', de: 'Kabel-/WLAN-AP', fr: 'AP filaire/Wi-Fi' },
          slug: 'network/ap-mode',
        },
      ],
    },
    {
      label: 'Wireless & VLAN',
      translations: { ja: 'ワイヤレスと VLAN', 'zh-CN': '无线与 VLAN', 'zh-Hant': '無線與 VLAN', es: 'Wi-Fi y VLAN', de: 'WLAN & VLAN', fr: 'Wi-Fi et VLAN' },
      items: [
        {
          label: 'DSA VLAN',
          translations: { ja: 'DSA VLAN', 'zh-CN': 'DSA VLAN', 'zh-Hant': 'DSA VLAN', es: 'DSA VLAN', de: 'DSA-VLAN', fr: 'DSA VLAN' },
          slug: 'wireless-vlan/dsa-vlan',
        },
        {
          label: 'Guest Wi-Fi',
          translations: { ja: 'ゲスト Wi-Fi', 'zh-CN': '访客 Wi-Fi', 'zh-Hant': '訪客 Wi-Fi', es: 'Wi-Fi de invitados', de: 'Gast-WLAN', fr: 'Wi-Fi invité' },
          slug: 'wireless-vlan/guest-wifi',
        },
      ],
    },
    {
      label: 'Remote access',
      translations: { ja: 'リモートアクセス', 'zh-CN': '远程访问', 'zh-Hant': '遠端存取', es: 'Acceso remoto', de: 'Fernzugriff', fr: 'Accès à distance' },
      items: [
        {
          label: 'WireGuard server',
          translations: { ja: 'WireGuard サーバー', 'zh-CN': 'WireGuard 服务端', 'zh-Hant': 'WireGuard 伺服器端', es: 'Servidor WireGuard', de: 'WireGuard-Server', fr: 'Serveur WireGuard' },
          slug: 'remote-access/wireguard-server',
        },
        {
          label: 'WireGuard client',
          translations: { ja: 'WireGuard クライアント', 'zh-CN': 'WireGuard 客户端', 'zh-Hant': 'WireGuard 用戶端', es: 'Cliente WireGuard', de: 'WireGuard-Client', fr: 'Client WireGuard' },
          slug: 'remote-access/wireguard-client',
        },
      ],
    },
    {
      label: 'Installation',
      translations: { ja: 'インストール', 'zh-CN': '安装', 'zh-Hant': '安裝', es: 'Instalación', de: 'Installation', fr: 'Installation' },
      items: [
        {
          label: 'Proxmox',
          translations: { ja: 'Proxmox', 'zh-CN': 'PVE', 'zh-Hant': 'PVE', es: 'Proxmox', de: 'Proxmox', fr: 'Proxmox' },
          slug: 'installation/proxmox',
        },
      ],
    },
    {
      label: 'Software',
      translations: { ja: 'ソフトウェア', 'zh-CN': '软件', 'zh-Hant': '軟體', es: 'Software', de: 'Software', fr: 'Logiciels' },
      items: [
        {
          label: 'AdGuard Home',
          translations: { ja: 'AdGuard Home', 'zh-CN': 'AdGuard Home', 'zh-Hant': 'AdGuard Home', es: 'AdGuard Home', de: 'AdGuard Home', fr: 'AdGuard Home' },
          slug: 'software/adguard-home',
        },
        {
          label: 'SQM / CAKE',
          translations: { ja: 'SQM / CAKE', 'zh-CN': 'SQM / CAKE', 'zh-Hant': 'SQM / CAKE', es: 'SQM / CAKE', de: 'SQM / CAKE', fr: 'SQM / CAKE' },
          slug: 'software/sqm',
        },
        {
          label: 'OpenClash',
          translations: { ja: 'OpenClash', 'zh-CN': 'OpenClash', 'zh-Hant': 'OpenClash', es: 'OpenClash', de: 'OpenClash', fr: 'OpenClash' },
          slug: 'software/openclash',
        },
        {
          label: 'Package sources',
          translations: { ja: 'パッケージソース', 'zh-CN': '软件源', 'zh-Hant': '套件來源', es: 'Orígenes de paquetes', de: 'Paketquellen', fr: 'Sources de paquets' },
          slug: 'software/package-sources',
        },
        {
          label: 'apk vs opkg',
          translations: { ja: 'apk と opkg の違い', 'zh-CN': 'apk / opkg 对照', 'zh-Hant': 'apk / opkg 對照', es: 'apk frente a opkg', de: 'apk und opkg im Vergleich', fr: 'apk et opkg comparés' },
          slug: 'software/apk-vs-opkg',
        },
      ],
    },
    {
      label: 'Upgrade & recovery',
      translations: { ja: 'アップグレードと復旧', 'zh-CN': '升级恢复', 'zh-Hant': '升級與復原', es: 'Actualización y recuperación', de: 'Update & Wiederherstellung', fr: 'Mise à jour et récupération' },
      items: [
        {
          label: 'Backup and restore',
          translations: { ja: 'バックアップとリストア', 'zh-CN': '备份与恢复', 'zh-Hant': '備份與還原', es: 'Copia de seguridad y restauración', de: 'Sicherung und Wiederherstellung', fr: 'Sauvegarde et restauration' },
          slug: 'recovery/backup-restore',
        },
        {
          label: 'Firmware upgrade',
          translations: { ja: 'ファームウェアのアップグレード', 'zh-CN': '固件升级', 'zh-Hant': '韌體升級', es: 'Actualización del firmware', de: 'Firmware-Update', fr: 'Mise à jour du firmware' },
          slug: 'recovery/firmware-upgrade',
        },
      ],
    },
    {
      label: 'Troubleshooting',
      translations: { ja: 'トラブルシューティング', 'zh-CN': '故障排查', 'zh-Hant': '疑難排解', es: 'Solución de problemas', de: 'Fehlersuche', fr: 'Dépannage' },
      items: [
        {
          label: "Can't reach LuCI",
          translations: { ja: 'LuCI にアクセスできない', 'zh-CN': '进不去后台', 'zh-Hant': '無法進入管理介面', es: 'No se puede acceder a LuCI', de: 'LuCI nicht erreichbar', fr: 'Impossible d’accéder à LuCI' },
          slug: 'troubleshooting/no-web-ui',
        },
        {
          label: 'Plugin install',
          translations: { ja: 'プラグインのインストール', 'zh-CN': '插件装不上', 'zh-Hant': '外掛程式無法安裝', es: 'Instalación de complementos', de: 'Plugin-Installation', fr: 'Installation de plugins' },
          slug: 'troubleshooting/plugin-install',
        },
        {
          label: 'No internet',
          translations: { ja: 'インターネットに接続できない', 'zh-CN': '无法上网', 'zh-Hant': '無法上網', es: 'Sin internet', de: 'Kein Internet', fr: 'Pas d’Internet' },
          slug: 'troubleshooting/no-internet',
        },
      ],
    },
  ],
} as SiteMeta;

export default meta;
