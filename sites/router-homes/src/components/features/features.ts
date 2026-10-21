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
  },
  {
    slug: 'apk',
    span: 5,
    icon: icons.box,
    en: { title: 'apk replaces opkg', desc: 'New package format and new commands. Don’t mix them with 24.10.' },
    zh: { title: 'apk 取代 opkg', desc: '包格式和命令都变了，别和 24.10 混用。' },
  },
  {
    slug: 'kernel-toolchain',
    span: 5,
    icon: icons.chip,
    en: { title: 'Kernel 6.12, newer toolchain', desc: 'Linux 6.6 → 6.12, GCC 13.3 → 14.3. Kernel modules must match.' },
    zh: { title: '内核 6.12 与新工具链', desc: 'Linux 6.6 → 6.12，GCC 13.3 → 14.3，内核模块必须对得上。' },
  },
  {
    slug: 'uci',
    span: 4,
    icon: icons.sliders,
    en: { title: 'UCI: one config system', desc: 'Every service reads /etc/config. LuCI edits the same files.' },
    zh: { title: 'UCI 统一配置', desc: '服务都读 /etc/config，LuCI 改的也是这些文件。' },
  },
  {
    slug: 'firewall4',
    span: 4,
    icon: icons.wall,
    en: { title: 'firewall4 on nftables', desc: 'Default since 22.03. Same zones, same UCI syntax.' },
    zh: { title: 'firewall4 · nftables', desc: '22.03 起默认，区域和 UCI 写法不变。' },
  },
  {
    slug: 'dsa',
    span: 4,
    icon: icons.ports,
    en: { title: 'DSA switch ports', desc: 'Each port is a Linux interface; VLANs live on br-lan.' },
    zh: { title: 'DSA 交换机端口', desc: '每个网口都是 Linux 接口，VLAN 配在 br-lan 上。' },
  },
  {
    slug: 'wireguard',
    span: 4,
    icon: icons.key,
    en: { title: 'WireGuard in the kernel', desc: 'Mainline since Linux 5.6; configured as a network interface.' },
    zh: { title: '内核级 WireGuard', desc: 'Linux 5.6 起进入主线，在 OpenWrt 里就是一个网络接口。' },
  },
  {
    slug: 'sqm',
    span: 4,
    icon: icons.gauge,
    en: { title: 'SQM with CAKE', desc: 'Keeps latency low under load. Start at 90% of measured speed.' },
    zh: { title: 'SQM 与 CAKE', desc: '满载时压住延迟，先按实测带宽的 90% 设置。' },
  },
  {
    slug: 'failsafe',
    span: 4,
    icon: icons.buoy,
    en: { title: 'Failsafe and sysupgrade', desc: 'A boot-time way back on 192.168.1.1; upgrades keep config.' },
    zh: { title: 'Failsafe 与 sysupgrade', desc: '启动时的退路，192.168.1.1；升级默认保留配置。' },
  },
];

export const featureBySlug = Object.fromEntries(features.map((f) => [f.slug, f])) as Record<FeatureSlug, Feature>;
