# DNS E2 实验记录（2026-10-20）

## 环境

- Proxmox VE 9.2.2，单 Realtek RTL8111；OpenWrt 25.12.6 x86_64 VM 200（512MB / 2 vCPU）。
- WAN `eth0`：DHCP，`192.168.50.77/24`，上游网关 `192.168.50.1`。
- LAN `eth1`：`192.168.1.1/24`。
- 客户端：PVE host 上的 netns + veth 接 `vmbr1`，`busybox udhcpc` 获取 DHCP。

## 结果

### 基线

- `/tmp/resolv.conf.d/resolv.conf.auto`：`nameserver 192.168.50.1`。
- `netstat -lnp | grep :53`：dnsmasq 监听 `127.0.0.1:53`、`192.168.1.1:53`、`192.168.50.77:53`。
- `nslookup openwrt.org 127.0.0.1`：返回 A 和 AAAA。

### 自定义 WAN DNS

```sh
uci set network.wan.peerdns='0'
uci -q delete network.wan.dns
uci add_list network.wan.dns='1.1.1.1'
uci commit network
ifup wan
```

- `resolv.auto` 变为 `nameserver 1.1.1.1`。
- `nslookup openwrt.org 127.0.0.1` 仍成功。

### 故障与恢复

- 把 dnsmasq 上游改为不可达的 `192.0.2.1`（`noresolv=1` + `server`），查询随机 `.example.com`：`connection timed out; no servers could be reached`。
- 删除 `noresolv`/`server`，恢复 `peerdns=1`，重启 dnsmasq 后解析恢复。
- 注意：OpenWrt 没有 `timeout` 命令；本次用本地 SSH 超时包裹查询。

### 客户端

- netns 客户端 DHCP 获得 `192.168.1.116/24`，默认路由 `192.168.1.1`，DNS `192.168.1.1`。
- `dig @192.168.1.1 openwrt.org` 返回 `64.226.122.113`。
- `ping 192.168.50.1` 通（TTL 63，经 OpenWrt 转发）。

## 限制

- 浏览器 DoH 未测（无浏览器环境）；页面保留为检查项，不写成已验证。
- IPv6 AAAA 解析成功，但没有独立验证 IPv6 上游/RA/RDNSS。
- 未测物理 LAN 客户端、长期稳定性和不同固件版本。

## 结论

DNS 页可按 E2 记录：WAN DNS 修改、客户端查询、坏上游失败和恢复路径均已复现；浏览器 DoH 与 IPv6 上游仍属未测项。
