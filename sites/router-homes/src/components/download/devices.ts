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
  variants?: { en: string; ja: string; zh: string; 'zh-hant': string; es: string; de: string; fr: string };
}

export const groups: { id: DeviceGroup; en: string; ja: string; zh: string; 'zh-hant': string; es: string; de: string; fr: string }[] = [
  { id: 'wifi6', en: 'Wi-Fi 6 routers', ja: 'Wi-Fi 6 ルーター', zh: 'Wi-Fi 6 路由器', 'zh-hant': 'Wi-Fi 6 路由器', es: 'Routers Wi-Fi 6', de: 'Wi-Fi-6-Router', fr: 'Routeurs Wi-Fi 6' },
  { id: 'wifi5', en: 'Wi-Fi 5 classics', ja: 'Wi-Fi 5 の定番機', zh: 'Wi-Fi 5 经典款', 'zh-hant': 'Wi-Fi 5 經典款', es: 'Clásicos Wi-Fi 5', de: 'Wi-Fi-5-Klassiker', fr: 'Classiques Wi-Fi 5' },
  { id: 'travel', en: 'Travel & portable', ja: 'トラベル・携帯向け', zh: '便携/旅行', 'zh-hant': '可攜／旅行', es: 'Viaje y portátiles', de: 'Reise & mobil', fr: 'Voyage et portables' },
  { id: 'board', en: 'Boards & mini routers', ja: 'ボードとミニルーター', zh: '开发板与软路由', 'zh-hant': '開發板與迷你路由器', es: 'Placas y mini routers', de: 'Boards & Mini-Router', fr: 'Cartes et mini-routeurs' },
  { id: 'x86', en: 'x86 & virtual machines', ja: 'x86 と仮想マシン', zh: 'x86 与虚拟机', 'zh-hant': 'x86 與虛擬機器', es: 'x86 y máquinas virtuales', de: 'x86 & virtuelle Maschinen', fr: 'x86 et machines virtuelles' },
];

const layouts = { en: 'Stock layout and OpenWrt U-Boot layout are separate images', ja: '純正レイアウトと OpenWrt U-Boot レイアウトでは別のイメージを使います', zh: '原厂分区与 OpenWrt U-Boot 分区是两套镜像', 'zh-hant': '原廠分區與 OpenWrt U-Boot 分區是兩套映像檔', es: 'El particionado de fábrica y el de OpenWrt U-Boot usan imágenes distintas', de: 'Original-Partitionierung und OpenWrt-U-Boot-Partitionierung benötigen getrennte Images', fr: 'Le partitionnement d’origine et celui d’OpenWrt U-Boot utilisent des images distinctes' };

export const devices: Device[] = [
  { name: 'Xiaomi Mi Router AX3000T', target: 'mediatek/filogic', id: 'xiaomi_mi-router-ax3000t', group: 'wifi6', wifi: 'Wi-Fi 6', variants: layouts },
  { name: 'Xiaomi Redmi Router AX6000', target: 'mediatek/filogic', id: 'xiaomi_redmi-router-ax6000-stock', group: 'wifi6', wifi: 'Wi-Fi 6', variants: layouts },
  { name: 'CMCC RAX3000M / RAX3000Me', target: 'mediatek/filogic', id: 'cmcc_rax3000m', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'eMMC and NAND units, DDR3 and DDR4 boot files', ja: 'eMMC 版と NAND 版があり、ブートファイルは DDR3 用と DDR4 用に分かれます', zh: '有 eMMC 与 NAND 两种存储，引导文件分 DDR3/DDR4', 'zh-hant': '有 eMMC 與 NAND 兩種儲存裝置，開機檔分 DDR3/DDR4', es: 'Unidades con eMMC y con NAND, archivos de arranque DDR3 y DDR4', de: 'Geräte mit eMMC und NAND, Boot-Dateien für DDR3 und DDR4', fr: 'Modèles eMMC et NAND, fichiers de démarrage DDR3 et DDR4' } },
  { name: 'GL.iNet GL-MT6000', target: 'mediatek/filogic', id: 'glinet_gl-mt6000', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'ASUS TUF-AX4200', target: 'mediatek/filogic', id: 'asus_tuf-ax4200', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'TUF-AX4200Q has its own image', ja: 'TUF-AX4200Q は別のイメージです', zh: 'TUF-AX4200Q 是单独的镜像', 'zh-hant': 'TUF-AX4200Q 是獨立的映像檔', es: 'El TUF-AX4200Q tiene su propia imagen', de: 'Das TUF-AX4200Q hat ein eigenes Image', fr: 'Le TUF-AX4200Q a sa propre image' } },
  { name: 'Cudy WR3000 v1', target: 'mediatek/filogic', id: 'cudy_wr3000-v1', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'WR3000E/H/P/S/U are separate images', ja: 'WR3000E/H/P/S/U はそれぞれ別のイメージです', zh: 'WR3000E/H/P/S/U 各有单独镜像', 'zh-hant': 'WR3000E/H/P/S/U 各有獨立映像檔', es: 'WR3000E/H/P/S/U usan imágenes distintas', de: 'WR3000E/H/P/S/U haben jeweils eigene Images', fr: 'Les WR3000E/H/P/S/U ont chacun leur image' } },
  { name: 'H3C Magic NX30 Pro', target: 'mediatek/filogic', id: 'h3c_magic-nx30-pro', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'JDCloud RE-CP-03', target: 'mediatek/filogic', id: 'jdcloud_re-cp-03', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'OpenWrt One', target: 'mediatek/filogic', id: 'openwrt_one', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Linksys E8450 / Belkin RT3200', target: 'mediatek/mt7622', id: 'linksys_e8450', group: 'wifi6', wifi: 'Wi-Fi 6', variants: { en: 'Separate UBI-layout image', ja: 'UBI レイアウト用の別イメージがあります', zh: '另有 UBI 分区布局镜像', 'zh-hant': '另有 UBI 分區配置的映像檔', es: 'Imagen aparte para el particionado UBI', de: 'Eigenes Image für das UBI-Layout', fr: 'Image distincte pour la disposition UBI' } },
  { name: 'Xiaomi Redmi AX6S / Router AX3200', target: 'mediatek/mt7622', id: 'xiaomi_redmi-router-ax6s', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Xiaomi AX3600', target: 'qualcommax/ipq807x', id: 'xiaomi_ax3600', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Redmi AX6', target: 'qualcommax/ipq807x', id: 'redmi_ax6', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'Dynalink DL-WRX36', target: 'qualcommax/ipq807x', id: 'dynalink_dl-wrx36', group: 'wifi6', wifi: 'Wi-Fi 6' },
  { name: 'GL.iNet GL-AX1800', target: 'qualcommax/ipq60xx', id: 'glinet_gl-ax1800', group: 'wifi6', wifi: 'Wi-Fi 6' },

  { name: 'Xiaomi Mi Router 4A Gigabit', target: 'ramips/mt7621', id: 'xiaomi_mi-router-4a-gigabit', group: 'wifi5', wifi: 'Wi-Fi 5', variants: { en: 'v1 and v2 are separate images', ja: 'v1 と v2 は別のイメージです', zh: 'v1 与 v2 是两套镜像', 'zh-hant': 'v1 與 v2 是兩套映像檔', es: 'v1 y v2 usan imágenes distintas', de: 'v1 und v2 haben getrennte Images', fr: 'v1 et v2 ont des images distinctes' } },
  { name: 'Xiaomi Redmi Router AC2100', target: 'ramips/mt7621', id: 'xiaomi_redmi-router-ac2100', group: 'wifi5', wifi: 'Wi-Fi 5' },
  { name: 'Phicomm K2P', target: 'ramips/mt7621', id: 'phicomm_k2p', group: 'wifi5', wifi: 'Wi-Fi 5' },
  { name: 'D-Team Newifi D2', target: 'ramips/mt7621', id: 'd-team_newifi-d2', group: 'wifi5', wifi: 'Wi-Fi 5' },
  { name: 'TP-Link Archer C6 v3', target: 'ramips/mt7621', id: 'tplink_archer-c6-v3', group: 'wifi5', wifi: 'Wi-Fi 5', variants: { en: 'Archer C6 v2 is a different target (ath79)', ja: 'Archer C6 v2 は別の target（ath79）です', zh: 'Archer C6 v2 属于另一个 target（ath79）', 'zh-hant': 'Archer C6 v2 屬於另一個 target（ath79）', es: 'El Archer C6 v2 usa otro target (ath79)', de: 'Der Archer C6 v2 hat ein anderes Target (ath79)', fr: 'L’Archer C6 v2 utilise un autre target (ath79)' } },
  { name: 'TP-Link Archer C7 v5', target: 'ath79/generic', id: 'tplink_archer-c7-v5', group: 'wifi5', wifi: 'Wi-Fi 5' },

  { name: 'GL.iNet GL-MT3000', target: 'mediatek/filogic', id: 'glinet_gl-mt3000', group: 'travel', wifi: 'Wi-Fi 6' },
  { name: 'GL.iNet GL-MT2500', target: 'mediatek/filogic', id: 'glinet_gl-mt2500', group: 'travel', wifi: 'none', variants: { en: 'MaxLinear-PHY and Airoha-PHY units use different images', ja: 'MaxLinear PHY 搭載機と Airoha PHY 搭載機ではイメージが異なります', zh: 'MaxLinear PHY 与 Airoha PHY 两种硬件，镜像不同', 'zh-hant': 'MaxLinear PHY 與 Airoha PHY 兩種硬體，映像檔不同', es: 'Las unidades con PHY MaxLinear y con PHY Airoha usan imágenes distintas', de: 'Geräte mit MaxLinear-PHY und Airoha-PHY nutzen unterschiedliche Images', fr: 'Les modèles à PHY MaxLinear et à PHY Airoha utilisent des images différentes' } },
  { name: 'GL.iNet GL-AR300M16', target: 'ath79/generic', id: 'glinet_gl-ar300m16', group: 'travel', wifi: 'Wi-Fi 4' },

  { name: 'Raspberry Pi 4B / 400 / CM4', target: 'bcm27xx/bcm2711', id: 'rpi-4', group: 'board', wifi: 'Wi-Fi 5' },
  { name: 'Raspberry Pi 5 / 500 / CM5', target: 'bcm27xx/bcm2712', id: 'rpi-5', group: 'board', wifi: 'Wi-Fi 5' },
  { name: 'FriendlyARM NanoPi R2S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r2s', group: 'board', wifi: 'none', variants: { en: 'R2S Plus has its own image', ja: 'R2S Plus は別のイメージです', zh: 'R2S Plus 是单独镜像', 'zh-hant': 'R2S Plus 是獨立映像檔', es: 'El R2S Plus tiene su propia imagen', de: 'Das R2S Plus hat ein eigenes Image', fr: 'Le R2S Plus a sa propre image' } },
  { name: 'FriendlyARM NanoPi R4S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r4s', group: 'board', wifi: 'none', variants: { en: 'Enterprise Edition has its own image', ja: 'Enterprise Edition は別のイメージです', zh: '企业版是单独镜像', 'zh-hant': '企業版是獨立映像檔', es: 'La Enterprise Edition tiene su propia imagen', de: 'Die Enterprise Edition hat ein eigenes Image', fr: 'L’Enterprise Edition a sa propre image' } },
  { name: 'FriendlyARM NanoPi R5S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r5s', group: 'board', wifi: 'none' },
  { name: 'FriendlyARM NanoPi R6S', target: 'rockchip/armv8', id: 'friendlyarm_nanopi-r6s', group: 'board', wifi: 'none' },
  { name: 'Banana Pi BPI-R3', target: 'mediatek/filogic', id: 'bananapi_bpi-r3', group: 'board', wifi: 'Wi-Fi 6', variants: { en: 'R3 Mini has its own image', ja: 'R3 Mini は別のイメージです', zh: 'R3 Mini 是单独镜像', 'zh-hant': 'R3 Mini 是獨立映像檔', es: 'El R3 Mini tiene su propia imagen', de: 'Das R3 Mini hat ein eigenes Image', fr: 'Le R3 Mini a sa propre image' } },
  { name: 'Banana Pi BPI-R4', target: 'mediatek/filogic', id: 'bananapi_bpi-r4', group: 'board', wifi: 'addon', variants: { en: 'R4 Lite and R4 2.5GE have their own images', ja: 'R4 Lite と R4 2.5GE はそれぞれ別のイメージです', zh: 'R4 Lite、R4 2.5GE 各有单独镜像', 'zh-hant': 'R4 Lite、R4 2.5GE 各有獨立映像檔', es: 'R4 Lite y R4 2.5GE tienen cada uno su propia imagen', de: 'R4 Lite und R4 2.5GE haben jeweils eigene Images', fr: 'R4 Lite et R4 2.5GE ont chacun leur image' } },

  { name: 'Generic x86/64', target: 'x86/64', id: 'generic', group: 'x86', wifi: 'none', variants: { en: 'Mini PCs, PVE / ESXi VMs: BIOS and UEFI images', ja: 'ミニ PC、PVE / ESXi の VM：BIOS 用と UEFI 用のイメージがあります', zh: '小主机、PVE/ESXi 虚拟机：分 BIOS 与 UEFI 镜像', 'zh-hant': '迷你主機、PVE/ESXi 虛擬機器：分 BIOS 與 UEFI 映像檔', es: 'Mini PC y VM de PVE / ESXi: imágenes BIOS y UEFI', de: 'Mini-PCs, PVE-/ESXi-VMs: BIOS- und UEFI-Images', fr: 'Mini PC et VM PVE / ESXi : images BIOS et UEFI' } },
];

export const selectorUrl = (d: Device) =>
  `https://firmware-selector.openwrt.org/?version=${RELEASE}&target=${encodeURIComponent(d.target)}&id=${encodeURIComponent(d.id)}`;
export const targetUrl = (target: string) => `https://downloads.openwrt.org/releases/${RELEASE}/targets/${target}/`;
