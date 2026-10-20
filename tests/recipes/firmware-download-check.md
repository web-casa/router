# E1/E2 recipe: firmware download check

## Status

E1 checklist, not executed on a specific device. Read-only; do not flash while collecting.

## Goal

Record enough evidence to choose the exact firmware image and recovery path before downloading.

## Steps

1. Device label:
   - full vendor/model, hardware revision, region variant;
   - FCC ID/serial prefix (do not publish);
   - reset/recovery method.
2. Existing OpenWrt:
   ```sh
   ubus call system board
   cat /etc/openwrt_release
   cat /tmp/sysinfo/model 2>/dev/null
   cat /tmp/sysinfo/board_name 2>/dev/null
   ```
3. x86:
   ```sh
   cat /sys/class/dmi/id/sys_vendor
   cat /sys/class/dmi/id/product_name
   cat /sys/class/dmi/id/board_name
   cat /sys/class/dmi/id/board_version
   cat /sys/class/dmi/id/bios_version
   ```
4. Firmware selector:
   - release, target/subtarget, profile, device page;
   - first-install vs upgrade image;
   - download URL and checksum.
5. Verify:
   ```sh
   sha256sum openwrt-*.img.gz
   ```
6. Recovery:
   - failsafe/TFTP/serial entry;
   - LAN address, gateway, root password location;
   - `sysupgrade -b` backup if available;
   - installed packages/kernel modules.
7. Stop before flashing. No write operation is part of this recipe.

## Record

| Field | Value |
|---|---|
| Vendor/model | |
| Hardware revision | |
| Region/variant | |
| `release.target` | |
| `board_name` / profile | |
| Image type (sysupgrade/factory/x86) | |
| Download source | |
| SHA-256 match | |
| Recovery method | |
| Backup path | |

## Pass criteria

- Model + revision + target/profile match the official device page.
- Image type matches the current firmware scenario.
- Checksum matches; source is official/vendor.
- Recovery path and backup are known before flashing.
- No flash was attempted during the check.

## Safety

- Do not publish serial numbers/FCC IDs.
- Do not use cloud-drive/forum repacks.
- Do not bypass vendor signatures or locks.
- Bare-metal/bootloader flashing is out of scope (R2).
