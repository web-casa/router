# E2 recipe: identify the OpenWrt flavor and image target

## Status

E1 plan, not executed. Read-only; do not flash anything while collecting.

## Goal

Record enough fields to tell official OpenWrt, ImmortalWrt, iStoreOS and vendor firmware apart, and to choose the correct upgrade image.

## Steps

1. On the device:
   ```sh
   ubus call system board
   cat /etc/openwrt_release
   ```
2. Package manager and architecture:
   ```sh
   command -v apk
   command -v opkg
   cat /etc/apk/arch 2>/dev/null
   opkg print-architecture 2>/dev/null
   uname -a
   ```
3. Hardware identity:
   ```sh
   cat /tmp/sysinfo/model 2>/dev/null
   cat /tmp/sysinfo/board_name 2>/dev/null
   cat /sys/class/dmi/id/product_name 2>/dev/null
   cat /sys/class/dmi/id/board_name 2>/dev/null
   cat /sys/class/dmi/id/board_version 2>/dev/null
   ```
4. Screenshot the web UI About/System page and the device label (model/revision).
5. Compare with the official firmware selector/vendor download page for the exact target/model.

## Record

| Field | Value |
|---|---|
| `release.distribution` | |
| `release.version` | |
| `release.revision` | |
| `release.target` | |
| `model` | |
| `board_name` | |
| hardware revision / DMI board_version | |
| package manager (apk/opkg) | |
| architecture | |
| web UI type (LuCI/vendor) | |
| feeds host | |
| vendor/community source | |

## Pass criteria

- The distribution and package manager are consistent with the observed feeds/UI.
- The target/model matches an official or vendor image page.
- No cross-model sysupgrade is selected.
- If the firmware is vendor/unknown, no flash is attempted.

## Safety

- Read-only commands only.
- Do not factory reset or flash a different model to “see what happens”.
- Keep the vendor recovery path if the device is vendor firmware.
