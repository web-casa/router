# E2 recipe: WireGuard client on Linux netns

## Status

E2 partial, run 2026-10-20. Linux netns client handshake/tunnel/HTTP verified; Windows/phone/DNS/full tunnel untested.

## Environment

- PVE netns client 192.168.1.251/24; endpoint 192.168.1.2:51820.
- Tunnel: client 10.10.0.2/24, server 10.10.0.1/24; AllowedIPs 10.10.0.0/24.

## Client

```sh
ip netns add wg-client
# veth 192.168.1.251/24 on the lab bridge, then:
ip link add wg0 type wireguard
wg set wg0 private-key /tmp/wg-client.key \
  peer <server-public-key> endpoint 192.168.1.2:51820 \
  allowed-ips 10.10.0.0/24 persistent-keepalive 5
ip addr add 10.10.0.2/24 dev wg0
ip link set wg0 up
```

Equivalent `wg-quick` config uses `[Interface] PrivateKey/Address` and `[Peer] PublicKey/Endpoint/AllowedIPs`.

## Verify

```sh
wg show
ip route
ping -c 3 10.10.0.1
curl -sSI --max-time 5 http://10.10.0.1/ | head -3
```

Do not include the endpoint IP in AllowedIPs without an exception route; a full-tunnel config can loop the handshake.

## Pass criteria

- Handshake is recent, not just interface up.
- Tunnel IP pings.
- HTTP works over the tunnel.
- DNS/full-tunnel/LAN access are separately verified if claimed.
- Private key never leaves the client.

## Run log 2026-10-20

- Client wg0 10.10.0.2/24; endpoint 192.168.1.2:51820; allowed 10.10.0.0/24; keepalive 5.
- Handshake 3 seconds ago; transfer 124 B received / 180 B sent.
- Ping 10.10.0.1 4/4; HTTP 200.
- Not tested: Windows/phone, DNS through tunnel, full 0.0.0.0/0, public endpoint, roaming/reconnect.
