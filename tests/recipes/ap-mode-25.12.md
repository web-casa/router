# E2 recipe: wired AP under an existing router on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20. Wired AP/L2/upstream DHCP verified; Wi-Fi and real upstream internet not tested.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; one NIC on isolated LAN bridge.
- AP LAN `192.168.1.2/24`; `dhcp.lan.ignore=1`.
- Upstream netns `192.168.1.1/24` + BusyBox udhcpd (`192.168.1.100–199`); client `192.168.1.136/24`.

## Steps

1. Back up:
   ```sh
   uci show network.lan
   uci show dhcp.lan
   cp /etc/config/network /etc/config/network.bak.$(date +%F)
   cp /etc/config/dhcp /etc/config/dhcp.bak.$(date +%F)
   ```
2. Change LAN and disable DHCP:
   ```sh
   uci set network.lan.ipaddr='192.168.1.2/24'
   uci set dhcp.lan.ignore='1'
   uci commit network
   uci commit dhcp
   /etc/init.d/network reload
   /etc/init.d/dnsmasq restart
   ```
3. Connect AP LAN to the main router LAN; do not use WAN.
4. Client:
   ```sh
   udhcpc -i eth0 -f -q -n -t 5
   ip addr show
   ip route
   ping -c 2 192.168.1.1
   ping -c 2 192.168.1.2
   ```
   Check the DHCP server is `192.168.1.1`, not `.2`.
5. Wi-Fi: E1, test SSID/encryption/channel/roaming separately.

## Pass criteria

- AP LAN is outside the main DHCP pool.
- AP DHCP is off; client leases from the main router.
- Client gateway is the main router.
- AP management IP remains reachable.
- No loop/double DHCP; Wi-Fi not marked tested without hardware.

## Run log 2026-10-20

- AP LAN `192.168.1.2/24`; `dhcp.lan.ignore=1`.
- Upstream netns `192.168.1.1`; client DHCP: `192.168.1.136/24`, server `.1`, lease 864000s, gateway `.1`.
- Client pinged AP `.2` and upstream `.1`; AP-only lab had no internet (`1.1.1.1` 100% loss).
- Cast: `public/casts/008-ap.cast`.
- Not tested: real main-router internet, Wi-Fi/SSID/encryption/roaming, Windows/phone, IPv6/RA.

## Persistent lab note

- VM 200 is kept stopped for later labs; bridge `vmbr5` is isolated and has no uplink.
- Do not auto-start VM 200; start only for experiments and stop afterwards.
