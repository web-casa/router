# E2 recipe: AdGuard Home on OpenWrt 25.12.6 VM 201

## Environment

- Proxmox VE 9.2.2, single Realtek RTL8111, `vmbr0` WAN.
- OpenWrt 25.12.6 x86_64 VM 201: 1GB RAM, 2GB data disk `/dev/sdb`.
- Internal bridge `vmbr2` (no physical ports), LAN `192.168.2.1/24`; PVE host `192.168.2.2/24`.
- AdGuard Home `0.107.79` from the OpenWrt apk feed.

## Safety

- Do not put two OpenWrt DHCP servers on the same bridge. VM 200 uses `vmbr1` 192.168.1.0/24; VM 201 must use `vmbr2` 192.168.2.0/24.
- `mkfs.ext4 -F /dev/sdb` destroys the data disk; confirm it is the lab disk.
- Do not commit the AGH admin password.
- Keep PVE/OpenWrt console access while changing DNS.

## Steps

1. Create VM 201 from the OpenWrt image with LAN `192.168.2.1`, two vNICs (`vmbr0` WAN, `vmbr2` LAN), 1GB RAM, and a 2GB data disk.
2. Add host IP `192.168.2.2/24` on `vmbr2`; verify ping `192.168.2.1`.
3. Install packages:
   ```sh
   apk update
   apk add adguardhome block-mount e2fsprogs
   ```
4. Format/mount the data disk and persist via the auto-detected fstab UUID:
   ```sh
   mkfs.ext4 -F /dev/sdb
   mkdir -p /opt/agh
   mount /dev/sdb /opt/agh
   block info /dev/sdb
   uci show fstab
   # set the matching @mount[n] target to /opt/agh and enabled=1
   /etc/init.d/fstab enable
   block mount
   ```
   The lab used `fstab.@mount[2]` (UUID of the 2GB disk), target `/opt/agh`, enabled `1`.
5. Move dnsmasq to 5353:
   ```sh
   uci set dhcp.@dnsmasq[0].port='5353'
   uci commit dhcp
   /etc/init.d/dnsmasq restart
   ```
6. Configure AGH workdir and first run:
   ```sh
   uci set adguardhome.config.work_dir='/opt/agh/work'
   uci commit adguardhome
   mkdir -p /opt/agh/work
   chown -R adguardhome:adguardhome /opt/agh /etc/adguardhome
   /etc/init.d/adguardhome enable
   /etc/init.d/adguardhome start
   ```
7. Complete first-run: DNS 53, web 3000, admin account; upstream `192.168.50.1`; disable DNSSEC for this lab.
8. Set DHCP option 6:
   ```sh
   uci add_list dhcp.lan.dhcp_option='6,192.168.2.1'
   uci commit dhcp
   /etc/init.d/dnsmasq restart
   ```
9. Add custom rule `||blocked.example^`; verify with `nslookup blocked.example 192.168.2.1` and `nslookup openwrt.org 192.168.2.1`.
10. Reboot; verify `/opt/agh` mount, AGH 53/3000, and the filter rule.

## Pass criteria

- AGH on 53, web on 3000, dnsmasq on 5353.
- DHCP clients receive `192.168.2.1` as DNS.
- `blocked.example` returns `0.0.0.0`; normal names resolve.
- Reboot restores data disk, AGH, dnsmasq and filter rules.
- No DHCP server from another subnet on `vmbr2`.

## Run log 2026-10-20

- AGH `0.107.79` installed; default Quad9 DoH upstream timed out in this network, so upstream set to `192.168.50.1` and DNSSEC disabled.
- Ports: AGH 53/3000; dnsmasq 5353; DHCP option 6 `192.168.2.1`.
- Client: DHCP `192.168.2.166/24`; `blocked.example` → `0.0.0.0`; `openwrt.org` → `64.226.122.113`.
- Reboot: fstab mounted `/dev/sdb` at `/opt/agh`; AGH/dnsmasq/rules recovered; web 302.
- Findings: two OpenWrt VMs on one bridge caused a cross-subnet DHCP lease; separate `vmbr2` fixed it. Changing dnsmasq to 5353 required an explicit DHCP option 6. `block-mount`/fstab UUID is needed for reboot persistence.
- Not tested: real browser UI interaction, external filter subscriptions, physical LAN clients, IPv6, long-run stability.
