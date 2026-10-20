# E2 recipe: apk/opkg feeds and China mirror

## Status

E1 plan, not executed. Do not bulk-upgrade packages.

## Environment

- OpenWrt 25.12.6 (apk) and/or 24.10 (opkg), x86_64 or aarch64.
- Console/SSH; backup of feed files.

## Steps

1. Identify:
   ```sh
   ubus call system board
   cat /etc/openwrt_release
   uname -m
   cat /etc/apk/arch 2>/dev/null
   opkg print-architecture 2>/dev/null
   ```
2. Back up feeds:
   ```sh
   cp /etc/apk/repositories.d/distfeeds.list /etc/apk/repositories.d/distfeeds.list.bak.$(date +%F) 2>/dev/null || true
   cp /etc/opkg/distfeeds.conf /etc/opkg/distfeeds.conf.bak.$(date +%F) 2>/dev/null || true
   ```
3. Verify the mirror path with `curl -I` for the exact release/target/arch; 200 only.
4. Rewrite only the host part (`https://downloads.openwrt.org` → mirror root), keep the full path.
5. Run only:
   ```sh
   apk update
   # or
   opkg update
   ```
6. Search, do not install:
   ```sh
   apk search luci-app-sqm
   # or
   opkg list | grep luci-app-sqm
   ```
7. Restore the original feed and re-run `update`; confirm recovery.

## Pass criteria

- The feed index is reachable and signature/verification passes.
- `apk search`/`opkg list` sees a known package.
- No system-wide upgrade was run.
- Restoring the original feed returns to a working state.
- 25.12 and 24.10 were tested separately; packages/formats were not mixed.

## Record

| Field | 25.12 | 24.10 |
|---|---|---|
| Package manager | apk | opkg |
| Release/target/arch | | |
| Official feed sample | | |
| Mirror feed sample | | |
| `update` result | | |
| `search` result | | |
| Restore result | | |

## Safety

- No `apk upgrade`/`opkg upgrade` as a “firmware upgrade”.
- No mixing official/ImmortalWrt/iStoreOS feeds.
- No routine `--allow-untrusted`.
- Keep a console path if DNS/time/certs break.
