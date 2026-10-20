# E2 recipe: change LAN address on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20. Address switch, old-address failure and rollback verified; DHCP lease and physical clients were not.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; isolated bridge `vmbr5`.
- LAN `192.168.1.1/24` → `192.168.10.1/24`; DHCP `100–199`, lease `12h`.
- Management: static host IP + LuCI/SSH.

## Safety

- Keep console access; do not rely on the session you are about to drop.
- Back up `/etc/config/network` and `/etc/config/dhcp`.
- Do not overlap the new subnet with WAN/upstream/VPN.
- Do not factory-reset as a first step.

## Steps

1. Record:
   ```sh
   uci show network.lan
   uci show dhcp.lan
   ip -4 addr show br-lan
   ```
2. Change:
   ```sh
   uci set network.lan.ipaddr='192.168.10.1/24'
   uci commit network
   uci set dhcp.lan.start='100'
   uci set dhcp.lan.limit='100'
   uci set dhcp.lan.leasetime='12h'
   uci commit dhcp
   /etc/init.d/network reload
   /etc/init.d/dnsmasq restart
   ```
3. Move the management host to `192.168.10.2/24`; verify:
   ```sh
   curl -I http://192.168.10.1/
   ssh root@192.168.10.1
   ```
4. Confirm old address fails; new works. Check config:
   ```sh
   ip -4 addr show br-lan
   ubus call network.interface.lan status
   grep -R "dhcp-range" /var/etc/dnsmasq.conf* /tmp/etc/dnsmasq.conf* 2>/dev/null
   ```
5. Optionally test DHCP from a client; release/renew and verify `192.168.10.x`.
6. Roll back:
   ```sh
   uci set network.lan.ipaddr='192.168.1.1/24'
   uci commit network
   /etc/init.d/network reload
   /etc/init.d/dnsmasq restart
   ```
7. Verify old address works and new times out.

## Pass criteria

- Old address stops responding after the change.
- New LuCI/SSH works.
- DHCP range matches the new subnet.
- Rollback restores the old address without factory reset.
- No WAN change is required.

## Run log 2026-10-20

- Change executed; SSH session dropped with timeout (expected).
- Old `192.168.1.1`: 100% packet loss.
- New `192.168.10.1`: ping OK, HTTP 200, LuCI/SSH OK.
- `dhcp-range=set:lan,192.168.10.100,192.168.10.199,255.255.255.0,12h`.
- Rollback: old HTTP 200; new timed out.
- DHCP netns attempt: no lease; dnsmasq logged `no address range available` (not marked verified).
- Screenshot: `src/assets/screenshots/luci/lan-edit-192-168-10.webp`.

## Not tested

- Real DHCP client lease/renewal, physical LAN, IPv6, upstream/VPN overlap.
