# E2 recipe: bypass gateway on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20. WAN-enabled bypass (LAN + WAN) verified for DHCP-off, static gateway/DNS, DNS switch and dead-gateway rollback; pure one-arm bypass not tested.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86 VM 200; isolated LAN bridge.
- LAN `192.168.1.2/24`; DHCP `ignore=1`; WAN DHCP `192.168.50.5/24`.
- Client netns `192.168.1.100/24`, gateway/DNS `192.168.1.2`.

## Steps

1. Back up and record:
   ```sh
   uci show network.lan
   uci show network.wan
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
3. Keep WAN/NAT (WAN-enabled mode):
   ```sh
   ubus call network.interface.wan status
   ip route
   uci show firewall | grep -E 'zone|masquerade|forward'
   ```
4. Static client:
   ```sh
   ip addr add 192.168.1.100/24 dev eth0
   ip route add default via 192.168.1.2
   echo 'nameserver 192.168.1.2' > /etc/resolv.conf
   ping -c 2 192.168.1.2
   ping -c 2 1.1.1.1
   nslookup openwrt.org 192.168.1.2
   ```
5. DHCP-off check:
   ```sh
   udhcpc -i eth0 -f -q -n -t 3
   ```
6. DNS/gateway control:
   ```sh
   nslookup openwrt.org 1.1.1.1
   ip route replace default via 192.168.1.250
   ping -c 2 1.1.1.1
   ip route replace default via 192.168.1.2
   ```

## Pass criteria

- Client DHCP gets no offer; static still works.
- Gateway/DNS `.2` gives working public IP and DNS.
- DNS switch and dead-gateway test produce distinct results.
- Restoring gateway/DNS recovers.
- Pure one-arm instructions are not marked tested without a main-router lab.

## Run log 2026-10-20

- LAN `192.168.1.2/24`; `dhcp.lan.ignore=1`; WAN `192.168.50.5/24`.
- `udhcpc` no lease (`no lease, failing`); static `.100` worked.
- Ping `.2` and `1.1.1.1`, `nslookup` via `.2` all worked.
- DNS `1.1.1.1` worked; gateway `.250` gave 100% loss; restoring `.2` recovered.
- Cast: `public/casts/009-bypass.cast`.
- Not tested: pure one-arm bypass, main-router return route, real Wi-Fi/Windows, IPv6/RA.

## Safety

- Do not enable two DHCP servers on one LAN.
- Keep console access; changing LAN drops the old address.
- Restore the old LAN/DHCP config if the client cannot reach the bypass.
