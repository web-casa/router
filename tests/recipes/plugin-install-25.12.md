# E2 recipe: plugin install and LuCI menu on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20. Install/dependency/LuCI menu/remove-reinstall verified; architecture rejection and postinst failure were not reproduced.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; x86_64; apk.
- Test packages: `sqm-scripts 1.7.2-r1`, `luci-app-sqm`.
- Mirror used for speed (TUNA); page does not require it.

## Steps

1. Record:
   ```sh
   cat /etc/apk/arch
   apk update
   apk search sqm-scripts
   apk search luci-app-sqm
   ```
2. Install core only:
   ```sh
   apk add sqm-scripts
   apk info -e sqm-scripts
   ```
   Confirm no LuCI menu/controller is created.
3. Install the LuCI app:
   ```sh
   apk add luci-app-sqm
   apk info -L luci-app-sqm | head -20
   ls -l /usr/share/luci/menu.d/luci-app-sqm.json
   ```
4. Remove the LuCI app and confirm the menu file disappears:
   ```sh
   apk del luci-app-sqm
   ls -l /usr/share/luci/menu.d/luci-app-sqm.json
   ```
5. Reinstall and confirm restoration.
6. Architecture negative case: use an architecture-specific package (ELF), not a `noarch`/`any` package. Do not use `--allow-untrusted` as proof.
7. Postinst failure (not run): inspect `logread`, `/etc/uci-defaults`, package file list; do not force-reinstall blindly.

## Pass criteria

- Core package installs without LuCI menu.
- LuCI app adds the menu/static files; removal removes them; reinstall restores.
- Dependencies are visible in install output/`apk info -R`.
- A real wrong-arch test uses an arch-specific package and fails safely.
- Recovery does not require reflashing firmware.

## Run log 2026-10-20

- `apk update` OK; 11220 packages.
- `sqm-scripts` installed; `luci-app-sqm` not installed; no LuCI menu.
- `luci-app-sqm` installed; `/usr/share/luci/menu.d/luci-app-sqm.json` and `/www/luci-static/resources/view/network/sqm.js` present.
- `apk del luci-app-sqm`: menu file removed; reinstall restored.
- aarch64 `sqm-scripts` is `sqm-scripts-any` (noarch); local `--allow-untrusted` accepted it, so it is **not** a wrong-arch rejection test.
- Not tested: postinst failure, kmod ABI mismatch, architecture-specific package rejection.

## Safety

- No real credentials; no repository changes left behind.
- Do not install foreign-arch binaries on a production router.
