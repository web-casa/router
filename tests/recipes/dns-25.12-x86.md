# E2 recipe: DNS on OpenWrt 25.12.6 x86 VM

## Environment

- OpenWrt 25.12.6 x86_64 VM on PVE 9.2.2, VM 200, 512MB / 2 vCPU.
- 2 vNICs: WAN DHCP on `vmbr0`, LAN `192.168.1.1/24` on `vmbr1`.
- Linux netns client on `vmbr1` (or a client VM), no browser DoH.
- Image SHA-256: `f8538784d0288b4133a99ac2a68443e4922ffde6343e80df56a5882364b9d499`.

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
- No test claim is marked E3; this is an E2 recipe.

## Run log 2026-10-20

- Baseline: `resolv.auto` = `nameserver 192.168.50.1`; `nslookup openwrt.org 127.0.0.1` returned A/AAAA.
- Custom WAN DNS: `peerdns=0`, `network.wan.dns=1.1.1.1`; `resolv.auto` changed to `nameserver 1.1.1.1`; queries still worked.
- Failure: dnsmasq `noresolv=1` + `server=192.0.2.1`; random `.example.com` query returned `connection timed out; no servers could be reached`; restore `peerdns=1`, delete `noresolv`/`server`, restart dnsmasq; resolution recovered.
- Client: netns DHCP `192.168.1.116/24`, DNS `192.168.1.1`; `dig @192.168.1.1 openwrt.org` = `64.226.122.113`; `ping 192.168.50.1` works (TTL 63).
- Findings: OpenWrt has no `timeout` command; wrap a hanging query from the SSH/client side instead. IPv6 AAAA resolved, but IPv6 upstream/RA/RDNSS was not independently tested. Browser DoH not tested.
