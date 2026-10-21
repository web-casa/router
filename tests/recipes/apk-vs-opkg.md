# E2/E1 recipe: apk vs opkg command and migration check

## Status

E2 partial for 25.12 apk, run 2026-10-20; 24.10 opkg is an official command reference, not executed.

## Environment

- OpenWrt 25.12.6 x86 VM 200; `apk`; official/TUNA feeds.
- No 24.10 device in this lab.

## 25.12 apk

```sh
cat /etc/openwrt_release
command -v apk
apk update
apk search -x sqm-scripts
apk add sqm-scripts
apk info -e sqm-scripts
apk list --installed | wc -l
```

Expected/observed: 11220 packages from official and TUNA; `sqm-scripts 1.7.2-r1` installed.

## 24.10 opkg (not executed)

```sh
cat /etc/openwrt_release
command -v opkg
opkg update
opkg list | grep sqm-scripts
opkg install sqm-scripts
opkg list-installed | grep sqm-scripts
```

Do not rename `.ipk` to `.apk`; find a matching `.apk` or rebuild.

## Migration check

1. Back up config and package lists (018).
2. Upgrade/reflash 25.12 (019).
3. Reinstall from apk feeds in order: base networking → DNS → management → apps.
4. Restore config; verify LuCI/service/DNS.
5. Keep old firmware/snapshot for rollback.

## Pass criteria

- Package manager matches release.
- Feed file/format/arch match.
- 25.12 packages are reinstalled, not converted.
- Config restore and basic networking are verified.
- 24.10 commands are not presented as executed until a real 24.10 device is used.

## Run log 2026-10-20

- 25.12 official/TUNA `apk update`: 11220 packages; `sqm-scripts` installed.
- After 25.12 sysupgrade: 239→182 packages; SQM/OpenClash required reinstall.
- 24.10 opkg: not executed.
