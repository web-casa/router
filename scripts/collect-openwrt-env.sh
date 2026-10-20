#!/usr/bin/env bash
# Read-only OpenWrt environment report. Run on the router; it changes nothing.
set -u

section() {
  printf '\n## %s\n' "$1"
}

redact() {
  sed -E "s/((password|username|key|secret)[[:space:]]*=[[:space:]]*')[^']*'/\1REDACTED'/Ig; s/((option[[:space:]]+)?(password|username|key|secret)[[:space:]]+').*'/\1REDACTED'/Ig"
}

printf '# OpenWrt environment report\n'
printf 'generated: %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
printf '\n> Redact public IPs, MAC addresses, SSIDs and credentials before sharing.\n'

section "Board"
if command -v ubus >/dev/null 2>&1; then
  ubus call system board 2>&1 || true
else
  echo '(ubus not installed)'
fi

section "/etc/openwrt_release"
if [ -f /etc/openwrt_release ]; then
  cat /etc/openwrt_release
else
  echo '(missing)'
fi

section "Kernel"
uname -a

section "Links"
if command -v ip >/dev/null 2>&1; then
  ip -br link
  printf '\n### Addresses\n'
  ip -br addr
fi

section "Package manager"
if command -v apk >/dev/null 2>&1; then
  printf 'apk present\n'
  apk info 2>/dev/null | head -40 || true
elif command -v opkg >/dev/null 2>&1; then
  printf 'opkg present\n'
  opkg list-installed 2>/dev/null | head -40 || true
else
  echo '(neither apk nor opkg found)'
fi

section "UCI network"
if command -v uci >/dev/null 2>&1; then
  uci show network 2>&1 | redact || true
else
  echo '(uci not installed)'
fi

section "UCI DHCP/DNS"
if command -v uci >/dev/null 2>&1; then
  uci show dhcp 2>&1 | redact || true
fi

section "/etc/config/network"
if [ -f /etc/config/network ]; then
  redact < /etc/config/network
else
  echo '(missing)'
fi

section "Notes"
cat <<'TXT'
- This script is read-only.
- It does not dump passwords, keys, or full firewall rules.
- Redact public IPs, MAC addresses, SSIDs and site-specific identifiers before sharing.
TXT
