// Devices shown on the download page. Every entry was checked against the
// official OpenWrt 25.12.6 build metadata (targets/<target>/profiles.json on
// downloads.openwrt.org) on 2026-10-22: the profile id exists, and the Wi-Fi
// generation follows from the wireless driver in its package list.
// Being listed here means "has an official image", not "recommended".

export const RELEASE = '25.12.6';
export const RELEASE_DATE = '2026-10-18';
export const CHECKED_AT = '2026-10-22';

export type DeviceGroup = 'wifi6' | 'wifi5' | 'travel' | 'board' | 'x86';
export type Wifi = 'Wi-Fi 6' | 'Wi-Fi 5' | 'Wi-Fi 4' | 'none' | 'addon';

export interface Device {
  name: string;
  target: string;
  /** Profile id in the firmware selector. */
  id: string;
  group: DeviceGroup;
  wifi: Wifi;
  /** Same model, more than one image to choose from. */
  variants?: { en: string; zh: string };
}

export const groups: { id: DeviceGroup; en: string; zh: string }[] = [
  { id: 'wifi6', en: 'Wi-Fi 6 routers', zh: 'Wi-Fi 6 路由器' },
  { id: 'wifi5', en: 'Wi-Fi 5 classics', zh: 'Wi-Fi 5 经典款' },
  { id: 'travel', en: 'Travel & portable', zh: '便携/旅行' },
  { id: 'board', en: 'Boards & mini routers', zh: '开发板与软路由' },
  { id: 'x86', en: 'x86 & virtual machines', zh: 'x86 与虚拟机' },
];

const layouts = { en: 'Stock layout and OpenWrt U-Boot layout are separate images', zh: '原厂分区与 OpenWrt U-Boot 分区是两套镜像' };

export const devices: Device[] = [
  { name: 'Xiaomi Mi Router AX3000T', target: 'mediatek/filogic', id: 'xiaomi_mi-router-ax3000t', group: 'wifi6', wifi: 'Wi-Fi 6', variants: layouts },
  { name: 'Xiaomi Redmi Router AX6000', target: 'mediatek/filogic', id: 'xiaomi_redmi-router-ax6000-stock', group: 'wifi6', wifi: 'Wi-Fi 6', variants: layouts },
  { name: 'CMCC RAX3000M / RAX3000Me', target: 'mediatek/filogic', id: 'cmcc_rax3000m', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'eMMC and NAND units, DDR3 and DDR4 boot files', zh: '有 eMMC 与 NAND 两种存储，引导文件分 DDR3/DDR4' } },
  { name: 'GL.iNet GL-MT6000', target: 'mediatek/filogic', id: 'glinet_gl-mt6000', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'ASUS TUF-AX4200', target: 'mediatek/filogic', id: 'asus_tuf-ax4200', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'TUF-AX4200Q has its own image', zh: 'TUF-AX4200Q 是单独的镜像' } },
  { name: 'Cudy WR3000 v1', target: 'mediatek/filogic', id: 'cudy_wr3000-v1', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'WR3000E/H/P/S/U are separate images', zh: 'WR3000E/H/P/S/U 各有单独镜像' } },
  { name: 'H3C Magic NX30 Pro', target: 'mediatek/filogic', id: 'h3c_magic-nx30-pro', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'JDCloud RE-CP-03', target: 'mediatek/filogic', id: 'jdcloud_re-cp-03', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'OpenWrt One', target: 'mediatek/filogic', id: 'openwrt_one', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Linksys E8450 / Belkin RT3200', target: 'mediatek/mt7622', id: 'linksys_e8450', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'Separate UBI-layout image', zh: '另有 UBI 分区布局镜像' } },
  { name: 'Xiaomi Redmi AX6S / Router AX3200', target: 'mediatek/mt7622', id: 'xiaomi_redmi-router-ax6s', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Xiaomi AX3600', target: 'qualcommax/ipq807x', id: 'xiaomi_ax3600', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Redmi AX6', target: 'qualcommax/ipq807x', id: 'redmi_ax6', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Dynalink DL-WRX36', target: 'qualcommax/ipq807x', id: 'dynalink_dl-wrx36', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'GL.iNet GL-AX1800', target: 'qualcommax/ipq60xx', id: 'glinet_gl-ax1800', group: 'wifi6', wifi: 'Wi-Fi 6' },

  { name: 'Xiaomi Mi Router 4A Gigabit', target: 'ramips/mt7621', id: 'xiaomi_mi-router-4a-gigabit', group: 'wifi5', wifi: 'Wi-Fi 5', variants: { en: 'v1 and v2 are separate images', zh: 'v1 与 v2 是两套镜像' } },
  { name: 'Xiaomi Redmi Router AC2100', target: 'ramips/mt7621', id: 'xiaomi_redmi-router-ac2100', group: 'wifi5', wifi: 'Wi-Fi 5' },
  { name: 'Phicomm K2P', target: 'ramips/mt7621', id: 'phicomm_k2p', group: 'wifi5', wifi: 'Wi-Fi 5' },
  { name: 'D-Team Newifi D2', target: 'ramips/mt7621', id: 'd-team_newifi-d2', group: 'wifi5', wifi: 'Wi-Fi 5' },
  { name: 'TP-Link Archer C6 v3', target: 'ramips/mt7621', id: 'tplink_archer-c6-v3', group: 'wifi5', wifi: 'Wi-Fi 5', variants: { en: 'Archer C6 v2 is a different target (ath79)', zh: 'Archer C6 v2 属于另一个 target（ath79）' } },
  { name: 'TP-Link Archer C7 v5', target: 'ath79/generic', id: 'tplink_archer-c7-v5', group: 'wifi5', wifi: 'Wi-Fi 5' },

  { name: 'GL.iNet GL-MT3000', target: 'mediatek/filogic', id: 'glinet_gl-mt3000', group: 'travel', wifi: 'Wi-Fi 6' },
  { name: 'GL.iNet GL-MT2500', target: 'mediatek/filogic', id: 'glinet_gl-mt2500', group: 'travel', wifi: 'none', variants: { en: 'MaxLinear-PHY and Airoha-PHY units use different images', zh: 'MaxLinear PHY 与 Airoha PHY 两种硬件，镜像不同' } },
  { name: 'GL.iNet GL-AR300M16', target: 'ath79/generic', id: 'glinet_gl-ar300m16', group: 'travel', wifi: 'Wi-Fi 4' },

  { name: 'Raspberry Pi 4B / 400 / CM4', target: 'bcm27xx/bcm2711', id: 'rpi-4', group: 'board', wifi: 'Wi-Fi 5' },
  { name: 'Raspberry Pi 5 / 500 / CM5', target: 'bcm27xx/bcm2712', id: 'rpi-5', group: 'board', wifi: 'Wi-Fi 5' },
  { name: 'FriendlyARM NanoPi R2S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r2s', group: 'board', wifi: 'none', variants: { en: 'R2S Plus has its own image', zh: 'R2S Plus 是单独镜像' } },
  { name: 'FriendlyARM NanoPi R4S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r4s', group: 'board', wifi: 'none', variants: { en: 'Enterprise Edition has its own image', zh: '企业版是单独镜像' } },
  { name: 'FriendlyARM NanoPi R5S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r5s', group: 'board', wifi: 'none' },
  { name: 'FriendlyARM NanoPi R6S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r6s', group: 'board', wifi: 'none' },
  { name: 'Banana Pi BPI-R3', target: 'mediatek/filogic', id: 'bananapi_bpi-r3', group: 'board', wifi: 'Wi-Fi 6', variants: { en: 'R3 Mini has its own image', zh: 'R3 Mini 是单独镜像' } },
  { name: 'Banana Pi BPI-R4', target: 'mediatek/filogic', id: 'bananapi_bpi-r4', group: 'board', wifi: 'addon', variants: { en: 'R4 Lite and R4 2.5GE have their own images', zh: 'R4 Lite、R4 2.5GE 各有单独镜像' } },

  { name: 'Generic x86/64', target: 'x86/64', id: 'generic', group: 'x86', wifi: 'none', variants: { en: 'Mini PCs, PVE / ESXi VMs: BIOS and UEFI images', zh: '小主机、PVE/ESXi 虚拟机：分 BIOS 与 UEFI 镜像' } },
];

export const selectorUrl = (d: Device) =>
  `https://firmware-selector.openwrt.org/?version=${RELEASE}&target=${encodeURIComponent(d.target)}&id=${encodeURIComponent(d.id)}`;
export const targetUrl = (target: string) => `https://downloads.openwrt.org/releases/${RELEASE}/targets/${target}/`;
