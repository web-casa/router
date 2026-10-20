# E2 recipe: OpenWrt 25.12.6 on a single-NIC Proxmox VE host

## Environment

- Proxmox VE 9.2.2, kernel 7.0.2-6-pve.
- One physical NIC: Realtek RTL8111 (`nic0`), bridge `vmbr0`, host `192.168.50.2/24`, gateway `192.168.50.1`.
- OpenWrt 25.12.6 x86_64 generic ext4 combined image.
- Test client VM attached to internal bridge `vmbr1` (no physical ports).

## Safety

- Keep monitor/keyboard, IPMI, or cloud VNC available; do not rely only on SSH.
- Do not change `vmbr0` address/gateway.
- Do not run DHCP on `vmbr0`; OpenWrt WAN must have `dhcp.wan.ignore='1'`.
- Use a temporary `vmbr1`; do not add physical ports to it.

## Steps

1. Record `ip -br link`, `ip -br addr`, `cat /etc/network/interfaces`, `bridge link`, `qm list`, `pvesm status`.
2. Create `vmbr1`:
   ```sh
   ip link add name vmbr1 type bridge
   ip link set vmbr1 up
   ```
3. Download and verify the OpenWrt image:
   ```sh
   cd /var/lib/vz/template/iso
   wget https://downloads.openwrt.org/releases/25.12.6/targets/x86/64/openwrt-25.12.6-x86-64-generic-ext4-combined.img.gz
   wget https://downloads.openwrt.org/releases/25.12.6/targets/x86/64/sha256sums
   sha256sum -c sha256sums --ignore-missing
   gzip -d openwrt-25.12.6-x86-64-generic-ext4-combined.img.gz
   ```
4. Create VM 200:
   ```sh
   qm create 200 --name openwrt-lab --memory 512 --cores 2 --ostype l26 \
     --scsihw virtio-scsi-pci \
     --net0 virtio,bridge=vmbr0 \
     --net1 virtio,bridge=vmbr1 \
     --serial0 socket
   qm importdisk 200 /var/lib/vz/template/iso/openwrt-25.12.6-x86-64-generic-ext4-combined.img local-lvm
   qm set 200 --scsi0 local-lvm:vm-200-disk-0
   qm set 200 --boot order=scsi0
   qm start 200
   ```
5. Open `qm terminal 200` or the VNC console; identify `eth0/eth1` with `ip -br link`, `ip -br addr`, `uci show network`.
6. Configure WAN DHCP on the upstream interface, LAN `192.168.1.1/24` on the internal interface; set `dhcp.wan.ignore='1'`; commit and reload network.
7. Create a test client VM on `vmbr1`; verify lease, gateway, `ping 192.168.50.1`, `nslookup openwrt.org`.
8. Stop VM 200 (`qm stop 200`); verify PVE SSH and web UI from another machine; start it again.

## Pass criteria

- `vmbr0` still has `192.168.50.2/24`; PVE SSH/UI work throughout.
- OpenWrt WAN gets `192.168.50.x`; LAN is `192.168.1.1/24`.
- Test client can ping both gateways and resolve DNS.
- No DHCP server is running on `vmbr0`.
- Stopping VM 200 does not remove host access.

## Evidence to capture

- `qm config 200`
- OpenWrt `ip -br addr`, `uci show network`, `uci show dhcp`
- Client `ip route`, `nslookup openwrt.org`
- `qm stop 200` + host SSH/UI result
- PVE version and image SHA-256
