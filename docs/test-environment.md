# 测试环境与证据等级

不需要把机器或 SSH 密码交给维护者。需要 E2/E3 时，运行只读采集脚本并把脱敏输出贴回即可。

## 三个等级

| 等级 | 需要什么 | 能写什么 |
|---|---|---|
| E1 | 官方文档/规格，无本站执行 | “按官方文档整理”，不能写“已验证/已实测” |
| E2 | 固定配方 + 可复现环境（OpenWrt x86 VM / PVE VM） | “在记录的 VM 环境复现”，写清版本和限制 |
| E3 | 真实设备/真实家庭网络 + 测试记录 | “我们实测”，可写吞吐/延迟/覆盖/故障复现 |

## PVE

在 Proxmox 宿主机上运行：

```bash
bash scripts/collect-pve-env.sh > /tmp/pve-env.txt 2>&1
```

脚本只读，采集 `pveversion -v`、CPU/内存、物理网卡、bridge、`/etc/network/interfaces`、VM/CT 列表、磁盘概况。分享前删除公网 IP、MAC、主机名、VM 名称。

如果只要写 E1 草稿，不需要这一步。

## OpenWrt

在路由器上运行：

```bash
bash scripts/collect-openwrt-env.sh > /tmp/openwrt-env.txt 2>&1
```

脚本只读，采集 board、版本、接口、包管理器、`uci show network/dhcp`。脚本会尝试脱敏 password/username/key/secret，但分享前仍要人工检查公网 IP、MAC、SSID。

## 最小信息

如果不想跑脚本，至少提供：

- PVE：`pveversion -v`、`ip -br link`、`cat /etc/network/interfaces`、物理网口数量。
- OpenWrt：`ubus call system board`、`cat /etc/openwrt_release`、`ip -br addr`、`uci show network`。
