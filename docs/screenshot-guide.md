# 文档截图规范（PVE / LuCI / AGH）

## 来源

2026-10-20 临时截图环境：

- PVE 9.2.2，QEMU VM 200，独立 bridge `vmbr5`（不入库、不长期保留）。
- OpenWrt 25.12.6 x86_64，官方 combined ext4 镜像。
- LuCI 26.288；AdGuard Home 0.107.79。
- Chromium 149 + Playwright；浏览器视口 1440×900。

截图只用于界面示意；具体 IP、网卡名、磁盘和拓扑以读者环境为准。

## 抓法

### PVE/QEMU 控制台

```bash
# PVE 宿主机
echo "screendump /tmp/vm200.ppm" | qm monitor 200
```

- PPM 复制到本地后裁剪、转 WebP；控制台截图默认 1280×800。
- 只保留能说明问题的区域，例如 OpenWrt banner、apk 提示和 root shell；裁掉文件系统 UUID/无关内核日志。
- 不要用手机拍屏幕；不要包含密码、MAC、公网 IP。

### LuCI / AGH Web UI

- 用 Playwright 打开真实页面，1440×900，`deviceScaleFactor: 1`。
- 中文页面优先；如果界面本身没有中文（AGH 部分按钮），保留原文并在图注解释。
- 登录页/设置页不填真实密码；截图前确认输入框为空。
- AGH 仪表盘刚配置完为 0 是正常的，不要伪造查询数据。

## 脱敏

- MAC、公网 IP、序列号、UUID、邮箱、密码、订阅链接：裁掉或替换。
- 只保留实验网段/LAN 地址时，在正文/图注说明这是示例。
- 不上传原始 PPM/PNG 到仓库；只提交压缩后的 WebP 和必要图注。
- 截图中的第三方列表/URL 要确认可公开；不截个人订阅页。

## 排版

- 使用 `Figure.astro`：
  ```mdx
  import Figure from '@components/Figure.astro';
  import img from '@assets/screenshots/<page>/<name>.webp';

  <Figure src={img} alt="..." caption="..." />
  ```
- 中英文各写自己的 `alt`/`caption`；图注说明“这一步看什么”，不要重复正文。
- 每页 3–5 张，优先关键判断点；命令输出能用代码块就不用图片。
- WebP，宽度 1280/1440；不提交原始大图。

## 维护

- OpenWrt/LuCI/AGH 大版本变化时重截；图注写版本或“截图来自 …”。
- 截图是 E2/E1 的辅助证据，不替代 TestRecord；不要因为有一张图就把未验证内容标成 E3。
- 临时 VM、bridge、密码文件和 SSH 隧道用完即删；截图资产可以保留。
