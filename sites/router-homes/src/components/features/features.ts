// The nine OpenWrt features shown on the home page. Each one links to
// /<locale>/features/<slug>/, whose body lives in src/content/docs.
// Facts here are summaries of those pages; keep them in sync.

export type FeatureSlug =
  | 'openwrt-25-12'
  | 'apk'
  | 'kernel-toolchain'
  | 'uci'
  | 'firewall4'
  | 'dsa'
  | 'wireguard'
  | 'sqm'
  | 'failsafe';

export interface Feature {
  slug: FeatureSlug;
  /** Grid placement on wide screens: columns of 12, optional row span. */
  span: number;
  rows?: number;
  /** Solar icon name. */
  icon: string;
  en: { title: string; desc: string };
  zh: { title: string; desc: string };
  'zh-hant': { title: string; desc: string };
  ja: { title: string; desc: string };
  es: { title: string; desc: string };
  de: { title: string; desc: string };
  fr: { title: string; desc: string };
}

// Solar icon names (rendered by Icon.astro).
const icons = {
  spark: 'stars-minimalistic',
  box: 'box',
  chip: 'cpu',
  sliders: 'tuning-2',
  wall: 'shield-network',
  ports: 'routing-2',
  key: 'key-minimalistic',
  gauge: 'speedometer-middle',
  buoy: 'restart-circle',
};

export const features: Feature[] = [
  {
    slug: 'openwrt-25-12',
    span: 7,
    rows: 2,
    icon: icons.spark,
    en: { title: 'OpenWrt 25.12 “Dave’s Guitar”', desc: 'Out since March 2026; 25.12.6 is the current service release. Over 2200 supported devices.' },
    zh: { title: 'OpenWrt 25.12 “Dave’s Guitar”', desc: '2026 年 3 月发布，当前服务版本 25.12.6，支持 2200 多款设备。' },
    'zh-hant': { title: 'OpenWrt 25.12 “Dave’s Guitar”', desc: '2026 年 3 月發布，目前的維護版本為 25.12.6，支援 2200 多款裝置。' },
    ja: { title: 'OpenWrt 25.12 “Dave’s Guitar”', desc: '2026年3月に登場。現在のサービスリリースは 25.12.6 で、2200 以上のデバイスに対応しています。' },
    es: { title: 'OpenWrt 25.12 “Dave’s Guitar”', desc: 'Disponible desde marzo de 2026; 25.12.6 es la versión de mantenimiento actual. Más de 2200 dispositivos compatibles.' },
    de: { title: 'OpenWrt 25.12 „Dave’s Guitar“', desc: 'Seit März 2026 erhältlich; 25.12.6 ist das aktuelle Service-Release. Über 2200 unterstützte Geräte.' },
    fr: { title: 'OpenWrt 25.12 « Dave’s Guitar »', desc: 'Disponible depuis mars 2026 ; 25.12.6 est la version de maintenance actuelle. Plus de 2200 appareils pris en charge.' },
  },
  {
    slug: 'apk',
    span: 5,
    icon: icons.box,
    en: { title: 'apk replaces opkg', desc: 'New package format and new commands. Don’t mix them with 24.10.' },
    zh: { title: 'apk 取代 opkg', desc: '包格式和命令都变了，别和 24.10 混用。' },
    'zh-hant': { title: 'apk 取代 opkg', desc: '套件格式與指令都變了，別和 24.10 混用。' },
    ja: { title: 'apk が opkg に代わる', desc: 'パッケージ形式もコマンドも新しくなりました。24.10 と混在させないでください。' },
    es: { title: 'apk sustituye a opkg', desc: 'Nuevo formato de paquetes y nuevos comandos. No los mezcle con 24.10.' },
    de: { title: 'apk ersetzt opkg', desc: 'Neues Paketformat und neue Befehle. Nicht mit 24.10 mischen.' },
    fr: { title: 'apk remplace opkg', desc: 'Nouveau format de paquets et nouvelles commandes. Ne les mélangez pas avec 24.10.' },
  },
  {
    slug: 'kernel-toolchain',
    span: 5,
    icon: icons.chip,
    en: { title: 'Kernel 6.12, newer toolchain', desc: 'Linux 6.6 → 6.12, GCC 13.3 → 14.3. Kernel modules must match.' },
    zh: { title: '内核 6.12 与新工具链', desc: 'Linux 6.6 → 6.12，GCC 13.3 → 14.3，内核模块必须对得上。' },
    'zh-hant': { title: '核心 6.12 與新工具鏈', desc: 'Linux 6.6 → 6.12，GCC 13.3 → 14.3，核心模組必須對得上。' },
    ja: { title: 'カーネル 6.12 と新しいツールチェーン', desc: 'Linux 6.6 → 6.12、GCC 13.3 → 14.3。カーネルモジュールを合わせる必要があります。' },
    es: { title: 'Kernel 6.12 y toolchain más reciente', desc: 'Linux 6.6 → 6.12, GCC 13.3 → 14.3. Los módulos del kernel deben coincidir.' },
    de: { title: 'Kernel 6.12, neuere Toolchain', desc: 'Linux 6.6 → 6.12, GCC 13.3 → 14.3. Kernelmodule müssen dazu passen.' },
    fr: { title: 'Noyau 6.12 et chaîne d’outils plus récente', desc: 'Linux 6.6 → 6.12, GCC 13.3 → 14.3. Les modules du noyau doivent correspondre.' },
  },
  {
    slug: 'uci',
    span: 4,
    icon: icons.sliders,
    en: { title: 'UCI: one config system', desc: 'Every service reads /etc/config. LuCI edits the same files.' },
    zh: { title: 'UCI 统一配置', desc: '服务都读 /etc/config，LuCI 改的也是这些文件。' },
    'zh-hant': { title: 'UCI 統一設定', desc: '服務都讀取 /etc/config，LuCI 修改的也是這些檔案。' },
    ja: { title: 'UCI：設定の一元管理', desc: 'すべてのサービスが /etc/config を読み込みます。LuCI が編集するのも同じファイルです。' },
    es: { title: 'UCI: un único sistema de configuración', desc: 'Todos los servicios leen /etc/config. LuCI edita los mismos archivos.' },
    de: { title: 'UCI: ein einheitliches Konfigurationssystem', desc: 'Jeder Dienst liest /etc/config. LuCI bearbeitet dieselben Dateien.' },
    fr: { title: 'UCI : un seul système de configuration', desc: 'Chaque service lit /etc/config. LuCI modifie les mêmes fichiers.' },
  },
  {
    slug: 'firewall4',
    span: 4,
    icon: icons.wall,
    en: { title: 'firewall4 on nftables', desc: 'Default since 22.03. Same zones, same UCI syntax.' },
    zh: { title: 'firewall4 · nftables', desc: '22.03 起默认，区域和 UCI 写法不变。' },
    'zh-hant': { title: 'firewall4 · nftables', desc: '22.03 起為預設，區域與 UCI 寫法不變。' },
    ja: { title: 'nftables 上の firewall4', desc: '22.03 から標準です。ゾーンも UCI の書き方も変わりません。' },
    es: { title: 'firewall4 sobre nftables', desc: 'Predeterminado desde 22.03. Mismas zonas, misma sintaxis UCI.' },
    de: { title: 'firewall4 auf nftables', desc: 'Standard seit 22.03. Gleiche Zonen, gleiche UCI-Syntax.' },
    fr: { title: 'firewall4 sur nftables', desc: 'Par défaut depuis 22.03. Mêmes zones, même syntaxe UCI.' },
  },
  {
    slug: 'dsa',
    span: 4,
    icon: icons.ports,
    en: { title: 'DSA switch ports', desc: 'Each port is a Linux interface; VLANs live on br-lan.' },
    zh: { title: 'DSA 交换机端口', desc: '每个网口都是 Linux 接口，VLAN 配在 br-lan 上。' },
    'zh-hant': { title: 'DSA 交換器連接埠', desc: '每個網路埠都是 Linux 介面，VLAN 設定在 br-lan 上。' },
    ja: { title: 'DSA スイッチポート', desc: '各ポートが Linux のインターフェースになり、VLAN は br-lan 上に設定します。' },
    es: { title: 'Puertos de switch DSA', desc: 'Cada puerto es una interfaz de Linux; las VLAN residen en br-lan.' },
    de: { title: 'DSA-Switch-Ports', desc: 'Jeder Port ist eine Linux-Schnittstelle; VLANs liegen auf br-lan.' },
    fr: { title: 'Ports de switch DSA', desc: 'Chaque port est une interface Linux ; les VLAN se placent sur br-lan.' },
  },
  {
    slug: 'wireguard',
    span: 4,
    icon: icons.key,
    en: { title: 'WireGuard in the kernel', desc: 'Mainline since Linux 5.6; configured as a network interface.' },
    zh: { title: '内核级 WireGuard', desc: 'Linux 5.6 起进入主线，在 OpenWrt 里就是一个网络接口。' },
    'zh-hant': { title: '核心層級 WireGuard', desc: '自 Linux 5.6 起進入主線，在 OpenWrt 裡就是一個網路介面。' },
    ja: { title: 'カーネル内蔵の WireGuard', desc: 'Linux 5.6 からメインラインに入り、ネットワークインターフェースとして設定します。' },
    es: { title: 'WireGuard en el kernel', desc: 'En la rama principal desde Linux 5.6; se configura como una interfaz de red.' },
    de: { title: 'WireGuard im Kernel', desc: 'Seit Linux 5.6 im Mainline-Kernel; wird als Netzwerkschnittstelle konfiguriert.' },
    fr: { title: 'WireGuard dans le noyau', desc: 'Intégré au noyau principal depuis Linux 5.6 ; se configure comme une interface réseau.' },
  },
  {
    slug: 'sqm',
    span: 4,
    icon: icons.gauge,
    en: { title: 'SQM with CAKE', desc: 'Keeps latency low under load. Start at 90% of measured speed.' },
    zh: { title: 'SQM 与 CAKE', desc: '满载时压住延迟，先按实测带宽的 90% 设置。' },
    'zh-hant': { title: 'SQM 與 CAKE', desc: '滿載時壓低延遲，先以實測頻寬的 90% 設定。' },
    ja: { title: 'SQM と CAKE', desc: '高負荷時もレイテンシを低く保ちます。まず実測速度の 90% で設定します。' },
    es: { title: 'SQM con CAKE', desc: 'Mantiene baja la latencia bajo carga. Empiece al 90 % de la velocidad medida.' },
    de: { title: 'SQM mit CAKE', desc: 'Hält die Latenz unter Last niedrig. Beginnen Sie bei 90 % der gemessenen Geschwindigkeit.' },
    fr: { title: 'SQM avec CAKE', desc: 'Maintient une latence faible en charge. Commencez à 90 % du débit mesuré.' },
  },
  {
    slug: 'failsafe',
    span: 4,
    icon: icons.buoy,
    en: { title: 'Failsafe and sysupgrade', desc: 'A boot-time way back on 192.168.1.1; upgrades keep config.' },
    zh: { title: 'Failsafe 与 sysupgrade', desc: '启动时的退路，192.168.1.1；升级默认保留配置。' },
    'zh-hant': { title: 'Failsafe 與 sysupgrade', desc: '開機時的退路，位址 192.168.1.1；升級預設保留設定。' },
    ja: { title: 'Failsafe と sysupgrade', desc: '起動時に 192.168.1.1 から入れる戻り口です。アップグレードでは設定が保持されます。' },
    es: { title: 'Failsafe y sysupgrade', desc: 'Una vía de retorno durante el arranque en 192.168.1.1; las actualizaciones conservan la configuración.' },
    de: { title: 'Failsafe und sysupgrade', desc: 'Ein Rückweg beim Booten unter 192.168.1.1; Updates behalten die Konfiguration.' },
    fr: { title: 'Failsafe et sysupgrade', desc: 'Une voie de retour au démarrage sur 192.168.1.1 ; les mises à jour conservent la configuration.' },
  },
];

export const featureBySlug = Object.fromEntries(features.map((f) => [f.slug, f])) as Record<FeatureSlug, Feature>;
