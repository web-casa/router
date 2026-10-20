# PVE 单网口 E2 实验记录（2026-10-20）

## 环境

- Proxmox VE 9.2.2，内核 7.0.2-6-pve。
- 单物理网口：Realtek RTL8111（`nic0`）→ `vmbr0`，宿主机 `192.168.50.2/24`，网关 `192.168.50.1`。
- 临时内部 bridge：`vmbr1`（无物理口）。
- OpenWrt 25.12.6 x86_64 generic ext4 combined 镜像，SHA-256 `f8538784d0288b4133a99ac2a68443e4922ffde6343e80df56a5882364b9d499`。
- VM 200：512MB / 2 vCPU；`net0` 在 `vmbr0`，`net1` 在 `vmbr1`。

## 执行

1. 下载并校验 OpenWrt 镜像（官方 hash）。
2. 创建临时 `vmbr1`。
3. 离线写入 `/etc/config/network`：WAN `eth0` DHCP，LAN `eth1` `192.168.1.1/24`；`dhcp.wan.ignore='1'`。
4. 写入 `/etc/dropbear/authorized_keys`，用临时 key 登录。
5. `qm create 200`、`qm importdisk`、`qm start 200`。
6. 在 PVE 上用 netns + veth 接 `vmbr1`，用 `busybox udhcpc` 跑 DHCP 客户端。
7. 验证 DNS/HTTP；`qm stop 200` 后再从新 SSH 连接验证宿主机。

## 结果

- OpenWrt WAN `eth0`：DHCP `192.168.50.77/24`，默认路由 `192.168.50.1`。
- OpenWrt LAN `eth1`：`192.168.1.1/24`。
- netns 客户端：DHCP `192.168.1.191/24`，默认路由 `192.168.1.1`，DNS 解析 `openwrt.org`，HTTP 200。
- `qm stop 200` 后：PVE `vmbr0` 仍为 `192.168.50.2/24`，新 SSH 连接仍可登录。
- 结论：单网口 PVE 上“`vmbr0` WAN + 内部 `vmbr1` LAN”的 E2 路径成立。

## 发现

- OpenWrt BusyBox `ip` **不支持 `-br`**；页面/配方里的 OpenWrt 命令改为 `ip link show` / `ip addr show`。PVE 宿主机的 `ip -br` 不受影响。
- PVE 的 `dhclient` 在 netns 里受 `/tmp`/AppArmor 限制，客户端测试改用 `busybox udhcpc`。
- 本实验没有测试物理 LAN 客户端、双网口、PPPoE/IPv6 上游和长期稳定性；这些不属于 E2 结论。

## 清理

当前 VM 200 已停止，`vmbr1` 仍在（无物理口）。如需清理：

```bash
qm destroy 200
ip link del vmbr1
```

镜像和 `vmbr1` 都是临时实验资源；删除前确认没有其他 VM 使用 `vmbr1`。
