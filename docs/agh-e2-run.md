# AdGuard Home E2 实验记录（2026-10-20）

## 环境

- Proxmox VE 9.2.2，单 Realtek RTL8111。
- OpenWrt 25.12.6 x86_64 VM 201：1GB RAM、2GB 数据盘 `/dev/sdb`。
- 独立内部 bridge `vmbr2`，LAN `192.168.2.1/24`；PVE host `192.168.2.2/24`。
- AdGuard Home `0.107.79`（OpenWrt apk 包）。

## 结果

- AGH：DNS `53`，Web `3000`；dnsmasq：`5353`（继续负责 DHCP）。
- DHCP option 6：`192.168.2.1`；客户端 DHCP `192.168.2.166/24`。
- 过滤规则：`||blocked.example^`；查询 `blocked.example` 返回 `0.0.0.0`，`openwrt.org` 返回 `64.226.122.113`。
- 数据盘：`/dev/sdb` ext4，挂载 `/opt/agh`，fstab UUID 持久化。
- 重启：`/opt/agh` 自动挂载；AGH、dnsmasq、过滤规则恢复；Web 302。
- AGH 开机自启：`/etc/rc.d/S19adguardhome` 存在。

## 发现

1. **两个 OpenWrt VM 不能共用同一个带 DHCP 的 bridge**：VM 200 在 `vmbr1` 时，VM 201 的客户端拿到了 `192.168.1.x` 租约。为 VM 201 建独立 `vmbr2` 后正常。
2. **dnsmasq 改到 5353 后，客户端可能拿不到 DNS**：必须显式加 `dhcp_option='6,192.168.2.1'`。
3. **AGH 默认上游是 Quad9 DoH**，当前网络不可达；改为 `192.168.50.1` 并关闭 DNSSEC 后才解析。
4. **数据盘持久化需要 `block-mount` + fstab UUID**：只手动 mount，重启后会丢；命名 section 用 device 没挂上，改用 UUID 的 `mount` 条目后成功。
5. OpenWrt 没有 `dig`（本实验用 PVE host 的 `dig` 和 OpenWrt 的 `nslookup`）；页面命令使用 `nslookup`。

## 限制

- 没有真实浏览器操作 AGH UI，只用 HTTP 302 / API 验证。
- 没有订阅外部过滤列表；只用了自定义测试规则。
- 没有测物理 LAN 客户端、IPv6、长期稳定性和真实上游 DoH。
- 没有做独立复核，E3 仍需真实设备/真实网络。

## 清理

实验 VM 和数据盘：

```bash
qm stop 201
qm destroy 201
ip link del vmbr2
```

AGH 管理密码在本地 `.fleet/agh-admin.txt`（已忽略，不提交）；实验结束删除该文件。
