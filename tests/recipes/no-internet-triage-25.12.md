# E2 recipe: no internet / intermittent triage on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20. Controlled DNS, WAN and one-client route failures verified; intermittent/physical/app layers not.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; isolated LAN bridge.
- WAN DHCP `192.168.50.191/24`, gateway/DNS `192.168.50.1`.
- LAN `192.168.1.1/24`; netns client `192.168.1.175/24`.

## Baseline

```sh
ubus call network.interface.wan status
ip -4 addr show br-lan
ip -4 addr show eth1
ip route
# client
ip addr show
ip route
ping -c 2 192.168.1.1
ping -c 2 1.1.1.1
nslookup openwrt.org 192.168.1.1
```

## DNS failure

```sh
/etc/init.d/dnsmasq stop
# router: public IP still pings, DNS fails
ping -c 2 1.1.1.1
nslookup openwrt.org 127.0.0.1
# client: public IP pings, DNS fails
# restore
/etc/init.d/dnsmasq start
```

## WAN failure

```sh
ifdown wan
ip -4 addr show eth1
ping -c 2 1.1.1.1
# client: gateway pings, public fails
ifup wan
```

## One-client route failure

```sh
# inside the client netns
ip route del default
ping -c 2 192.168.1.1
ping -c 2 1.1.1.1
ip route add default via 192.168.1.1
```

## Pass criteria

- All-device failure is distinguished from one-client/one-app.
- IP-works/DNS-fails is identified with `nslookup`.
- WAN down leaves LAN/gateway reachable.
- Removing one client's default route affects only that client.
- Recovery restores DNS/WAN/route without factory reset.

## Run log 2026-10-20

- Baseline: WAN `192.168.50.191/24`; LAN `192.168.1.1`; client `192.168.1.175`; public ping/DNS OK.
- DNS stop: router public ping OK, DNS refused; client public ping OK, DNS refused; restart recovered.
- `ifdown wan`: no WAN IP; client gateway OK, public failed; `ifup wan` recovered.
- Client default route removed: gateway OK, public unreachable; restore recovered.
- Cast: `public/casts/015-triage.cast`.
- Not tested: intermittent/physical Wi-Fi, upstream jitter, app proxy/DoH/QUIC, IPv6 preference.
