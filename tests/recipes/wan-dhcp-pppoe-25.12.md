# E2/E1 recipe: WAN DHCP and PPPoE on OpenWrt 25.12

## Status

WAN DHCP E2 partial (2026-10-20); PPPoE E1, not executed (no real ISP account/line).

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; isolated bridge for LAN.
- Upstream `192.168.50.1`; WAN `eth1` DHCP; LAN `br-lan 192.168.10.1/24`.
- No real PPPoE credentials are used or stored.

## WAN DHCP

1. Record:
   ```sh
   uci show network.wan
   uci show network.lan
   ip -4 addr show
   ip route
   ```
2. Set DHCP:
   ```sh
   uci set network.wan.proto='dhcp'
   uci commit network
   /etc/init.d/network reload
   ```
3. Verify:
   ```sh
   ubus call network.interface.wan status
   ip -4 addr show eth1
   ip route
   cat /tmp/resolv.conf.d/resolv.conf.auto
   nslookup openwrt.org 192.168.50.1
   ```
4. LAN client:
   ```sh
   ip addr show
   ip route
   cat /etc/resolv.conf
   ping 192.168.10.1
   ```
5. If WAN has no address, check `logread -e udhcpc`; do not static-guess upstream.

## PPPoE (E1 plan)

Only with a lawful account/line:

```sh
uci set network.wan.proto='pppoe'
uci set network.wan.username='<account>'
uci set network.wan.password='<password>'
uci set network.wan.keepalive='5 3'
uci commit network
/etc/init.d/network reload
```

Verify `ubus call network.interface.wan status`, `ip -4 addr show pppoe-wan`, `ip route`, DNS, MTU, `logread | grep -Ei 'pppd|pppoe'`.

Never commit credentials or put them in screenshots.

## Pass criteria

- WAN DHCP has an address, default route and DNS.
- LAN client has the LAN gateway/DNS.
- WAN-side and LAN-side DNS are tested separately.
- PPPoE (if tested) authenticates, gets an address/route/DNS, and MTU is sane.
- No credentials in repo/log/screenshot.

## Run log 2026-10-20

- WAN `eth1`: DHCP `192.168.50.166/24`; gateway/DNS `192.168.50.1`.
- LAN `br-lan`: `192.168.10.1/24`.
- LAN DHCP netns client: `192.168.10.191/24`, gateway `192.168.10.1`.
- Not re-run: LAN client → public internet NAT/DNS end-to-end, IPv6, physical WAN.
- PPPoE: not tested (no real account/line).

## Not tested

- PPPoE authentication, VLAN/service name, MTU/MSS, IPv6.
- Physical WAN/ONT, double NAT, upstream MAC binding.
