# E2 recipe: DNS on OpenWrt 25.12.6 x86 VM

## Environment

- OpenWrt 25.12.6 x86_64 VM, 2 vNICs (WAN DHCP, LAN 192.168.1.1/24).
- One Linux client VM on LAN; no browser DoH.
- Record the VM image URL and SHA-256 in the test log.

## Steps

1. Boot the VM; confirm `cat /tmp/resolv.conf.d/resolv.conf.auto` and `uci show dhcp`.
2. From the client: `cat /etc/resolv.conf`, `nslookup openwrt.org`.
3. Change the DNS forwarder in LuCI or via UCI; apply and restart dnsmasq.
4. Verify router (`nslookup openwrt.org 127.0.0.1`), client, and IPv6 AAAA.
5. Set a deliberately bad forwarder; confirm the failure mode; restore the backup.
6. Record commands, outputs, firmware version, date, and recovery path.

## Pass criteria

- Router and client resolve A and AAAA records.
- Client DNS points at the OpenWrt LAN address.
- Bad forwarder is recoverable without losing LuCI/SSH.
- No test claim is marked E3; this is an E2 recipe until executed on the recorded VM.
