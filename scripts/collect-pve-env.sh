#!/usr/bin/env bash
# Read-only PVE environment report. Run on the Proxmox host; it changes nothing.
set -u

section() {
  printf '\n## %s\n' "$1"
}

run_if() {
  if command -v "$1" >/dev/null 2>&1; then
    shift
    "$@" 2>&1 || true
  else
    printf '(not installed: %s)\n' "$1"
  fi
}

printf '# PVE environment report\n'
printf 'generated: %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
printf 'host: %s\n' "$(hostname 2>/dev/null || echo unknown)"
printf '\n> Redact public IPs, MAC addresses, hostnames, VM names and any credentials before sharing.\n'

section "PVE version"
run_if pveversion pveversion -v

section "Kernel"
uname -a

section "CPU"
run_if lscpu lscpu

section "Memory"
run_if free free -h

section "Ethernet hardware"
if command -v lspci >/dev/null 2>&1; then
  lspci 2>/dev/null | grep -iE 'ethernet|network controller' || echo '(no Ethernet controller found)'
else
  echo '(lspci not installed)'
fi

section "Link state"
run_if ip ip -br link

section "Addresses"
run_if ip ip -br addr

section "PVE bridges"
if command -v bridge >/dev/null 2>&1; then
  bridge link 2>&1 || true
else
  echo '(bridge command not installed)'
fi

section "/etc/network/interfaces"
if [ -f /etc/network/interfaces ]; then
  cat /etc/network/interfaces
else
  echo '(missing)'
fi

section "VM list"
run_if qm qm list

section "Container list"
run_if pct pct list

section "Block devices"
if command -v lsblk >/dev/null 2>&1; then
  lsblk -o NAME,SIZE,TYPE,MODEL 2>&1 || true
else
  echo '(lsblk not installed)'
fi

section "Notes"
cat <<'TXT'
- This script is read-only.
- It does not dump VM disks, firewall rules, or credentials.
- Before sharing, remove public IPs, MAC addresses, hostnames, VM names and any site-specific identifiers.
TXT
