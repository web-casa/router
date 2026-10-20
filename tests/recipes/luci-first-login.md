# E2 recipe: first LuCI login on OpenWrt 25.12.6

## Status

E2 run completed 2026-10-20 on the official x86_64 image. Vendor/community firmware and failsafe are not covered.

## Environment

- Fresh OpenWrt 25.12.6 x86 VM or a device with a known-good factory image.
- One LAN client; WAN not required for the first login.
- Default LAN expected `192.168.1.1/24`; confirm from the device.

## Safety

- Use a LAN port, not WAN.
- Do not factory-reset a device with unknown configuration.
- Keep console/failsafe access available.
- Do not record the chosen password in the test log.

## Steps

1. Boot the fresh image; connect the client to LAN; confirm DHCP and default gateway.
2. Open `http://192.168.1.1/`; record whether LuCI prompts for a password or allows an empty password.
3. Set a unique root password; verify LuCI logout/login and SSH login with the same password.
4. Open **System → System → Language and Style**; record whether Simplified Chinese is preinstalled.
5. If missing, install:
   ```sh
   apk update
   apk add luci-i18n-base-zh-cn
   ```
6. Select 简体中文, save/apply, refresh, log out/in; confirm the UI remains Chinese.
7. Recover test: use a wrong password once, confirm the error; then use the correct password. Do not lock the account.
8. Record default LAN address, first-run prompt, language package version, and any vendor-specific default.

## Pass criteria

- The client reaches the real LAN management address.
- LuCI and SSH accept the new password.
- Simplified Chinese is selectable and persists after re-login.
- A wrong password fails without corrupting the session; correct password works.
- No factory reset is needed.

## Evidence to capture

- OpenWrt version and image source.
- Default LAN address/gateway.
- First-run password prompt behavior (no password value).
- `apk info -e luci-i18n-base-zh-cn` (or `opkg list-installed`).
- Before/after language screenshots or HTML `lang` attribute.
- Any vendor-specific defaults.

## Run log 2026-10-20

- VM 200, official OpenWrt 25.12.6 x86_64 combined ext4 image; LAN `192.168.1.1/24`.
- First LuCI login allowed a blank password and showed "No password set!"; set a temporary lab password.
- Installed `luci-i18n-base-zh-cn 26.288.56989~75a306d`; set `luci.main.lang='zh_cn'`; UI switched to Chinese.
- SSH login with the same password worked; no wrong-password lockout test was run.
- Screenshots: `src/assets/screenshots/luci/first-login-password.webp`, `language-zh.webp`.
- Not tested: vendor/community firmware defaults, failsafe, factory reset, wrong-password lockout.
