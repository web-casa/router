# E2 recipe: OpenWrt firmware upgrade with config/package verification

## Status

E2 partial, run 2026-10-20 on OpenWrt 25.12.6 x86 VM 200. Same-version sysupgrade verified; cross-version and plugin rebuild not completed.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; `apk`; PVE snapshot `pre-019-20261021`.
- Before: 239 packages; SQM/OpenClash installed; LAN 192.168.1.2/24, DHCP ignore.
- Image: TUNA 25.12.6 x86/64 combined ext4; `.img.gz` checksum matched official.

## Preflight

```sh
cat /etc/openwrt_release
cat /etc/apk/arch
apk list --installed > /tmp/packages-$(date +%F).txt
wc -l /tmp/packages-$(date +%F).txt
sysupgrade -b /tmp/pre-upgrade-$(date +%F).tar.gz
sha256sum /tmp/pre-upgrade-$(date +%F).tar.gz
```

Keep a console/rollback path; copy the config archive off-device; take a VM snapshot.

## Image and upgrade

```sh
wget -O /tmp/openwrt.img.gz <official-image-url>
sha256sum /tmp/openwrt.img.gz
gzip -dkf /tmp/openwrt.img.gz
sysupgrade -v /tmp/openwrt.img
```

The SSH session drops during reboot; wait and reconnect. Do not power off.

## Post-check

```sh
cat /etc/openwrt_release
uci show network.lan.ipaddr
uci show dhcp.lan
nslookup openwrt.org 127.0.0.1
apk list --installed | wc -l
for p in sqm-scripts luci-app-sqm luci-app-openclash; do
  apk info -e "$p" && echo "$p installed" || echo "$p MISSING"
done
```

Then reinstall packages one at a time and verify LuCI/service/DNS after each.

## Pass criteria

- Device boots; management HTTP/SSH recovers.
- Config (LAN/DHCP) preserved.
- DNS/WAN verified from the router and a client.
- Package loss identified and rebuild order documented.
- Snapshot/rollback path verified.

## Run log 2026-10-20

- `sysupgrade -v /tmp/openwrt.img` began; SSH closed; VM rebooted.
- After reboot: release 25.12.6; LAN `.2`; DHCP ignore kept; HTTP 200; SSH OK; DNS OK.
- Packages: 239 → 182; `sqm-scripts`, `luci-app-sqm`, `luci-app-openclash` missing.
- SQM reinstall was attempted but not completed (tunnel/timeout); no claim of rebuilt plugins.
- Snapshot `pre-019-20261021` was rolled back after the test; VM left stopped.

## Not tested

- Cross-version upgrade, real Wi-Fi/PPPoE, power-loss/interruption recovery, full plugin rebuild, ASU/owut.

## Safety

- Back up config and package list before upgrade; keep the old firmware/VM snapshot.
- Do not use same-version results as proof for a major-version upgrade.
- Config archives may contain credentials; do not commit/share them.
