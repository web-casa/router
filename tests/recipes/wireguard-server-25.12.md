# E2 recipe: WireGuard server on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20. LAN-side server, peer, handshake, tunnel ping and HTTP verified; WAN port-forward/DDNS/mobile/LAN forwarding not tested.

## Environment

- OpenWrt 25.12.6 x86 VM 200; LAN 192.168.1.2/24.
- PVE netns client 192.168.1.251/24 (veth on internal bridge).
- Tunnel 10.10.0.0/24: server 10.10.0.1, client 10.10.0.2; UDP 51820.

## Server

```sh
apk add wireguard-tools kmod-wireguard
umask 077
wg genkey > /tmp/wg-server.key
wg pubkey < /tmp/wg-server.key > /tmp/wg-server.pub

uci set network.wg0=interface
uci set network.wg0.proto='wireguard'
uci set network.wg0.private_key="$(cat /tmp/wg-server.key)"
uci set network.wg0.listen_port='51820'
uci set network.wg0.addresses='10.10.0.1/24'
uci set network.wg0.auto='1'
uci set network.wg0_client=wireguard_wg0
uci set network.wg0_client.public_key='<client-public-key>'
uci set network.wg0_client.allowed_ips='10.10.0.2/32'
uci set network.wg0_client.persistent_keepalive='25'
uci commit network

uci add_list firewall.@zone[0].network='wg0'
uci commit firewall
/etc/init.d/network restart
/etc/init.d/firewall reload
```

If the interface is named `wg` rather than `wg0`, this lab saw `proto: none`/device `wg0` missing; use `wg0` and peer type `wireguard_wg0`.

## Verify

```sh
wg show
ip -4 addr show wg0
ubus call network.interface.wg0 status
```

Client (see client recipe) must show a recent handshake; server `wg show` should list endpoint/allowed IPs/transfer.

## Pass criteria

- `wg0` exists with 10.10.0.1/24 and UDP 51820.
- Peer handshake succeeds.
- Client pings 10.10.0.1 and gets HTTP 200 from LuCI.
- No private keys in repo/screenshots/chat.
- WAN forwarding is explicitly not claimed if not tested.

## Run log 2026-10-20

- wireguard-tools 1.0.20260223 + kmod-wireguard 6.12.112 installed.
- `wg0` up 10.10.0.1/24; peer allowed 10.10.0.2/32.
- Client handshake; server transfer 1.47 KiB received / 1.90 KiB sent.
- Client ping tunnel 4/4; HTTP 200.
- Not tested: WAN port mapping/DDNS, phone/Windows, LAN forwarding/NAT/return route.
