# E2 recipe: OpenClash compatibility and clean disable

## Status

E1 plan, not executed. Lawful test environment only; no proxy endpoints, subscriptions or bypass steps are provided.

## Environment

- OpenWrt 25.12.6 or 24.10 with a matching OpenClash release package.
- x86_64 or aarch64 matching the package.
- Existing DNS owner documented (dnsmasq 53, AGH 53/5353, or another resolver).
- Console/SSH access; backup of `/etc/config/openclash`, `/etc/config/dhcp`, firewall.

## Safety

- Only use official release packages and verify checksums.
- Do not rename ipk to apk or mix architectures.
- Do not run two DNS servers on 53.
- Do not paste unknown subscriptions or share accounts.
- Keep a rollback path; test disable before adding any configuration.

## Steps

1. Record firmware/architecture:
   ```sh
   ubus call system board
   cat /etc/openwrt_release
   uname -m
   command -v apk
   command -v opkg
   df -h /
   ```
2. Record DNS baseline:
   ```sh
   netstat -lnp | grep -E ':53|:5353|:7874|:9090'
   nslookup openwrt.org 127.0.0.1
   ```
3. Find an exact release package for the firmware/architecture; verify SHA-256.
4. Back up config:
   ```sh
   cp /etc/config/openclash /etc/config/openclash.bak.$(date +%F) 2>/dev/null || true
   cp /etc/config/dhcp /etc/config/dhcp.bak.$(date +%F)
   ```
5. Install only the matching package per the project's instructions; do not disable all package verification.
6. Start OpenClash with DNS takeover disabled; check logs/ports:
   ```sh
   /etc/init.d/openclash start
   ps w | grep -Ei 'openclash|mihomo|clash' | grep -v grep
   netstat -lnp | grep -E ':53|:7874|:9090'
   logread | grep -i openclash | tail -30
   ```
7. No proxy endpoints are configured in this recipe. If a lawful configuration is not available, stop here.
8. Disable and verify recovery:
   ```sh
   /etc/init.d/openclash stop
   /etc/init.d/openclash disable
   /etc/init.d/dnsmasq restart
   nslookup openwrt.org 127.0.0.1
   ```
9. Record whether LuCI, DNS and basic connectivity are restored; test a reboot.

## Pass criteria

- The package matches firmware/architecture; checksum passes.
- OpenClash starts without a 53 conflict; DNS ownership is explicit.
- Disabling restores DNS and basic connectivity without factory reset.
- LuCI/SSH remain reachable throughout.
- No circumvention, subscription or shared-account steps are used.

## Not covered

- Proxy endpoints, subscription links, rule sets.
- Bypassing network controls or service/region restrictions.
- Legal advice.
