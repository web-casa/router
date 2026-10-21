# E2 recipe: OpenWrt config backup and restore

## Status

E2 partial, run 2026-10-20 on OpenWrt 25.12.6 x86. Same-version config backup/restore and management entry verified; whole-image/cross-version/package rebuild not tested.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; `apk`.
- LAN `192.168.1.2/24`; management from the PVE host.
- 239 installed packages; no WAN required.

## Steps

1. Record:
   ```sh
   cat /etc/openwrt_release
   cat /etc/apk/arch
   apk list --installed > /tmp/packages-$(date +%F).txt
   wc -l /tmp/packages-$(date +%F).txt
   sysupgrade -l
   ```
2. Create and inspect:
   ```sh
   sysupgrade -b /tmp/backup-e2.tar.gz
   ls -lh /tmp/backup-e2.tar.gz
   tar -tzf /tmp/backup-e2.tar.gz | head
   sha256sum /tmp/backup-e2.tar.gz
   ```
3. Copy off-device:
   ```sh
   scp root@192.168.1.2:/tmp/backup-e2.tar.gz ./
   ```
4. Marker test:
   ```sh
   uci set network.lan.e2_marker='before-restore'
   uci commit network
   uci show network.lan.e2_marker
   ```
5. Restore and verify:
   ```sh
   sysupgrade -r /tmp/backup-e2.tar.gz
   uci show network.lan.e2_marker || true
   uci show network.lan.ipaddr
   wget -qO- --timeout=5 http://127.0.0.1/ | head -1
   ```
6. Reinstall packages separately from the package list; config backup does not contain binaries.

## Pass criteria

- Backup is readable with `tar -tzf`, has a checksum, and is copied off-device.
- Restore removes a post-backup test marker.
- LAN/HTTP/SSH still work after restore.
- DHCP/DNS services are reloaded/verified.
- Config backup is not presented as a full firmware/VM backup.

## Run log 2026-10-20

- `sysupgrade -b /tmp/backup-e2.tar.gz`: 4.2MB, 59 entries; includes `etc/config/network`, `dhcp`, `firewall`, `openclash`, `sqm`.
- `apk list --installed`: 239 packages.
- Marker `network.lan.e2_marker='before-restore'` was removed by `sysupgrade -r`.
- After restore: LAN `192.168.1.2/24`; HTTP 200; SSH OK.
- Not tested: whole PVE backup restore, cross-release restore, package reinstall, real-device brick recovery.

## Safety

- Config archives may contain Wi-Fi/PPPoE/DDNS/proxy credentials; never commit or post them.
- Keep the backup off-device; `/tmp` is lost on reboot.
- Do not restore across release/target/arch without a VM test.
