# 文档站群开发方案（v0.7 · OpenWrt 24 主题 / Starlight 双语版）

> 状态：技术路线已确认 **Astro 7 + Starlight 0.42**；内容研究以随附 DOCX（17 页开发方案）与 XLSX（8 张工作表）为准；首站 Router.Homes（https://router.homes），24 个 P0 主题 × 中英 = 48 页；域名未绑定，Phase 0–4 只做 preview。
> 参考：`~/centosfan`、`starlight-multi-site`（不采用）、`astro-fleet`（不采用）、ubuntu.fan（只复用信息架构，不复用 Nextra 壳）。
> 本版取代 v0.6 的“8–10 页 OpenWrt 基础文档”范围；v0.6 的审核绑定、域名四态、preview 索引、部署回滚等门禁继续保留。

---

## 0. 结论与决策

### 0.1 关键结论

1. **路线保持 Starlight**。Starlight 在不配置 `root` locale 时，会生成 `prefixDefaultLocale: true`，因此 `/en/` 与 `/zh/` 都可以显式存在；根 `/` 由 Cloudflare `_redirects` 301 到 `/en/`。
2. **首发 24 个 P0 主题、48 个语言页**；完整候选库 54 个（P0 24 / P1 26 / P2 4），按实测能力分批发布。
3. **四组双语样板先行**：PVE 安装 OpenWrt、OpenClash 最小配置、AdGuard Home、SQM/CAKE。第 1–2 周完成，作为后续文章的验收标准。
4. **无第二评审人**：P0 用 solo 批准；P0 不含裸机刷机教程（002 是设备核对/恢复入口），PVE/DSA/VLAN 用 E3 + 管理路径恢复 + “未经独立复核”披露；P1/P2 的刷机、迁移、破坏性网络变更在找到评审人前不发布。
5. **域名未绑定**：`unbound → binding → verified → live` 四态；preview 允许，正式内容生产部署在绑定验收后开启。
6. **ubuntu.fan 不是 Fumadocs**：它是 Next.js + Nextra + Pagefind，中文在根路径、英文 `/en/`；我们只复用其任务导航/常青教程/版本专题/操作-排错内链的组织方式，不复用代码。

### 0.2 ADR

| ID | 决策 | 选择 |
|---|---|---|
| ADR-001 | 架构 | Monorepo，每站独立 Astro/Starlight 项目 |
| ADR-002 | 内容模型 | 每站独立内容；v1 不做跨站内容包 |
| ADR-003 | 站点差异 | 每站独立 sidebar/首页/栏目/主题 |
| ADR-004 | 部署 | Cloudflare Pages 每站一项目 + Actions 直传 |
| ADR-005 | 规模 | 首发 3–5 站，12 个月 10–20 站 |
| ADR-006 | 内容生产 | DeepSeek Harness 外部写作 + 人工批准 + 门禁 |
| ADR-007 | 首站范围 | Router.Homes：24 P0 主题 / 48 页面；四组样板先行；6–8 周 |
| ADR-008 | 证据策略 | 规格 E1；可复现步骤 E2；吞吐/覆盖/“我们实测” E3；P0 至少 4 组样板含 E3 |
| ADR-009 | 跨站分发 | v1 不做；出现真实复用页后再评估 |
| ADR-010 | 域名状态 | `unbound → binding → verified → live`；未绑定只允许 preview |
| ADR-011 | 批准机制 | 无第二评审人；P0 solo 批准；P1/P2 破坏性内容需评审人或延后 |
| ADR-012 | OpenWrt 版本 | 25.12.6 稳定版为主；24.10.8 旧稳定版只做差异；25.12 apk、24.10 opkg |
| ADR-013 | 双语 URL | 不设 `root` locale；`defaultLocale: 'en'`；显式 `/en/` + `/zh/`；`/` 301 到 `/en/` |
| ADR-014 | 内容架构 | 8 栏目 + 场景入口 + 症状索引 + 固件身份卡 + 拓扑/端口表 + 执行位置 + 保留矩阵 + 组合测试记录 + 别名搜索 |
| ADR-015 | 缺译策略 | v1 只发布成对页面；P1 单语发布延后，缺译不生成可索引 URL |

**Codex v0.5 的 10 条 P0/P1** 仍保留：审核绑定、MDX/执行安全、claims/evidence、CI、隔离边界、页面级索引、dedup 校准、canary、部署回滚、门禁/工期。v0.7 只调整内容规模与 i18n/组件实现，不降低发布门禁。

---

## 1. 研究输入与独立核验

### 1.1 随附成果

- **DOCX**：17 页开发方案，含定位、搜索/社区研究、信息架构、24 个 P0 主题、文章模板、内容模型、双语 URL、技术实现、工作包、6–8 周节奏。
- **XLSX**：8 张工作表——阅读说明与优先级、双语选题（54 个）、关键词明细（339 + 78）、SERP 样本（14 组）、相关词拓展、社区证据（53 条）、社区补充词、修订记录（15 项优先级变动）。

### 1.2 独立核验结果

| 项 | 核验 | 结论 |
|---|---|---|
| OpenWrt 当前稳定版 | `downloads.openwrt.org/.versions.json` | **25.12.6** 稳定；**24.10.8** 旧稳定 |
| 包管理器 | OpenWrt Wiki `apk` 页 | 25.12+ 使用 **apk**；24.10 使用 **opkg**；官方明确不建议 `apk upgrade` 批量升级代替固件升级 |
| 关键词 | DataForSEO 同参数抽查 | `openclash` 18,100 / 2026-09 9,900；`openwrt pbr` 390 / 210；`openwrt iptv` 1,300 / 1,900，与 DOCX 一致 |
| 社区痛点 | 独立搜索 | 25.12.5 升级后 AdGuard Home/DNS 失效、OpenClash `opkg` 安装超时/依赖、SQM bufferbloat、IPTV VLAN+udpxy、Travelmate 酒店认证页，均有可追溯来源 |
| ubuntu.fan 栈 | 页面/JS 资产 | **Next.js + Nextra + Pagefind**；中文根路径、英文 `/en/`，无 `/zh/`；不是 Fumadocs |
| Fumadocs | 官方文档 | 支持 `hideLocale: never`、`fallbackLanguage: null`、静态 ZBSearch；但本方案已选 Starlight，仅作对照 |
| Starlight i18n | 源码 `utils/i18n.ts` | 多语言且**不配置 root** 时生成 `prefixDefaultLocale: true`；`redirectToDefaultLocale: false`；`fallbackType: 'redirect'` |

### 1.3 研究边界

- 53 条社区记录中 **36 条读到正文/相关回帖，17 条仅公开索引**；恩山 8 条均受访问限制；**全部未本地复现**。
- 78 条补充词与原 339 条有 **8 个精确重复**，不能称为 417 个不同关键词；`qwrt`、`smartdns` 待消歧，不参与机会排序。
- DataForSEO 为全球 Google、未显式地区/语言；数值可复现，但报告中必须保留“全球口径、非百度/非站点流量”的方法说明。
- 英文社区不等于境外用户；社区样本不能推算占比/故障率。
- 所有教程尚未实测；论坛中的“已解决”只是帖子报告。

**核验来源（2026-10-19）**：

- OpenWrt 版本元数据：https://downloads.openwrt.org/.versions.json
- OpenWrt 25.12 apk 文档：https://openwrt.org/docs/guide-user/additional-software/apk
- OpenWrt 25.12 发布公告：https://lists.openwrt.org/pipermail/openwrt-announce/2026-March/000081.html
- DataForSEO 搜索量接口：https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/
- 25.12.5 升级后 AdGuard Home/DNS 问题：https://forum.openwrt.org/t/openwrt-25-12-5-service-release/251479
- OpenClash 安装报错：https://global.v2ex.co/t/1126370；https://github.com/vernesong/OpenClash/issues/3914
- SQM/CAKE 与 bufferbloat：https://bufferspeed.com/blog/unifi-openwrt-gaming-sqm-guide
- IPTV 单线复用（VLAN + udpxy）：https://cloud.tencent.cn/developer/article/2479155
- Travelmate 酒店认证：https://www.xda-developers.com/built-travel-router-that-defeats-hotel-wi-fi-login-pages/
- PVE 多网桥/管理网络：https://forum.proxmox.com/threads/passing-multiple-bridges-to-openwrt-vm-issue.179011/
- Starlight i18n 源码（prefixDefaultLocale/fallbackType）：https://github.com/withastro/starlight/blob/main/packages/starlight/src/utils/i18n.ts
- Fumadocs i18n（对照，不采用）：https://www.fumadocs.dev/docs/headless/internationalization/config
- ubuntu.fan（Next.js + Nextra + Pagefind 实测）：https://ubuntu.fan/

---

## 2. 首发范围与路线图

### 2.1 24 个 P0 主题（中英各一篇，共 48 页）

| ID | 中文标题（简） | 栏目 | 关键验证 |
|---|---|---|---|
| 002 | 固件下载与设备核对：型号、硬件修订、恢复入口 | 入门安装 | 型号/修订、profile、镜像类型 |
| 003 | x86 镜像怎么选与安装 | 入门安装 | x86/64 启动方式；完整镜像 |
| 004 | PVE 安装 OpenWrt：网口映射、宿主机联网与恢复 | 入门安装 | 物理口—bridge—vNIC—interface；VM 关闭仍可管理 |
| 005 | 首次登录 LuCI 与中文界面 | 入门安装 | 默认登录、密码、语言包版本 |
| 006 | 修改 LAN 地址并重新进入后台 | 基础联网 | 新旧地址、租约、恢复 |
| 007 | 主路由联网：DHCP 与 PPPoE | 基础联网 | WAN/LAN、DHCP/PPPoE 分别验证 |
| 008 | 有线 AP 接入现有路由器 | 基础联网 | 上游 DHCP、管理 IP、无线桥接 |
| 009 | 保留主路由：指定设备走 OpenWrt 旁路网关 | 基础联网 | 网关/DHCP/DNS、IPv4/IPv6、旁路关机影响 |
| 011 | DNS 怎么设置：路由器、手机、浏览器分别走哪里 | DNS/防火墙 | 路由端/终端/浏览器分别查询 |
| 012 | IPv6 基础配置与连通性检查 | 基础联网 | PD、RA、DNS、防火墙 |
| 014 | 软件源与国内镜像：apk 与 opkg 分开 | 软件包/应用 | release/target/ABI/源一致 |
| 015 | 无法上网或间歇断流：全网/终端/应用 | 故障排查 | 分层对照、应用启停 |
| 016 | 进不去后台：IP、网口、本地控制台恢复 | 故障排查 | 地址/进程/控制台/恢复 |
| 017 | 插件装不上：下载、依赖、冲突、postinst | 故障排查 | 主程序/LuCI/语言包分别核对 |
| 018 | 备份恢复：配置、插件、管理入口分别验证 | 升级恢复 | 配置归档 vs 完整镜像；实际恢复 |
| 019 | 固件升级：配置保留、插件重建、DNS 验证 | 升级恢复 | sysupgrade/ASU/owut；保留矩阵 |
| 021 | WireGuard 回家网络：服务端与客户端验证 | 远程访问 | 端点、peer、AllowedIPs、DNS、LAN |
| 022 | WireGuard 客户端配置与联网验证 | 远程访问 | 单一路由场景、DNS、中断恢复 |
| 023 | DSA VLAN：端口与网桥完整示例 | 无线/VLAN | tagged/untagged/PVID、管理口、回滚 |
| 024 | 访客 Wi-Fi 独立网段与隔离验证 | 无线/VLAN | 独立 DHCP/DNS、主 LAN 隔离 |
| 025 | 下载时游戏/会议变卡：SQM 与 CAKE 实测 | 软件包/应用 | 空载/负载延迟、吞吐、接口/加速/CPU |
| 026 | AdGuard Home：从后台到终端过滤验证 | DNS/防火墙 | 端口/上游、终端查询、过滤、失效恢复 |
| 041 | 我用的到底是哪种 OpenWrt：原生/ImmortalWrt/iStoreOS/厂商 | 入门安装 | 项目、build、upstream、包管理器、硬件修订 |
| 043 | OpenClash 入门：兼容性、最小配置、联网验证 | 软件包/应用 | 固件/前端/内核、包格式、DNS/规则/停用恢复 |

完整标题、英文标题、slug、关键词、验证条件见 XLSX「双语选题」。

### 2.2 8 个栏目

入门安装｜基础联网｜无线与 VLAN｜DNS 与防火墙｜远程访问｜软件包与应用｜升级恢复｜故障排查。

首页用场景入口，不用栏目列表：中文优先“已有光猫/爱快想加 OpenWrt”“装代理/去广告先跑通最小配置”“只有手机/某个应用断流”“换固件/升级后恢复插件与家庭网络”；英文优先“Set up OpenWrt without losing access”“Fix gaming and call lag under load”“Set up a VPN and verify connectivity”“Set up ad blocking, Wi-Fi and guest devices”。

### 2.3 P1/P2 与样板

- P1 26 个：独立参考/迁移、PassWall/PassWall2、DNS 组合（MosDNS+AGH+代理）、IPTV 单线复用、WireGuard PBR、旅行路由、WAN/VPN/NAS 吞吐诊断、代理前端选型等。
- P2 4 个：设备候选专题，取得硬件修订与恢复条件后再做。
- **四组样板**：004 PVE、043 OpenClash、026 AdGuard Home、025 SQM；第 1–2 周完成中英双语，作为后续验收标准。
- P1 可单语先行，但 v1 缺译策略是“不生成 URL”；Starlight `fallbackType: 'redirect'` 与 404 要求需在 Phase 0 验证/加保护。

---

## 3. 技术架构

### 3.1 Monorepo 与隔离边界

每站独立 Astro/Starlight 项目；内容、路由、产物、部署、回滚独立；依赖版本（catalog + 单 lockfile）、docs-kit、CI 工作流、共享门禁仍耦合。共享依赖升级默认触发全站验证。

### 3.2 双语 URL 与 Starlight 配置

```js
// sites/router-homes/astro.config.ts
starlight({
  defaultLocale: 'en',
  locales: {
    en: { label: 'English' },
    zh: { label: '简体中文', lang: 'zh-CN' },
  },
  // 不配置 root：Starlight 生成 prefixDefaultLocale: true
})
```

- 内容目录：`src/content/docs/en/**`、`src/content/docs/zh/**`；无 root 目录。
- 生成的 Astro i18n：`prefixDefaultLocale: true`、`redirectToDefaultLocale: false`、`fallbackType: 'redirect'`。
- 根 `/` 无页面；`public/_redirects` 增加 `/ /en/ 301`（Cloudflare Pages）。
- 页面 URL：`/en/docs/installation/proxmox/`、`/zh/docs/installation/proxmox/`。
- 中英各自自指 canonical；双向 hreflang `en`、`zh-Hans`，可选 `x-default` 指向英文。
- **缺译**：v1 只发布成对页面；`fallbackType: redirect` 会在缺译时跳默认语言，需在 Phase 0 验证能否改为真实 404；若不能，P1 单语发布延后，或加自定义 404/redirect guard。缺译不生成 sitemap/hreflang。

### 3.3 内容模型与组件

**frontmatter 必需字段组**（通过 `docsSchema({ extend })`）：

- 身份：`contentId`、`locale`、`slug`、`translationGroup`、`status`
- 固件：`firmware_flavor`、`vendor_version`、`upstream_base`、`build`
- 版本：`testedVersions`、`package_manager`、`firewallBackend`、`switchBackend`
- 设备/镜像：`target`、`subtarget`、`profile`、`hardware_revision`、`imageType`、`filesystem`、`bootMode`
- 应用：`apps`、`frontendVersion`、`coreVersion`、`package_feed`、`combinationId`
- 拓扑：`topologyId`、`portMap`、`gatewayOwner`、`dhcpOwner`、`dnsOwner`、`executionContext`
- 验证/恢复：`testStatus`、`lastVerifiedAt`、`testEnvironment`、`recoverySteps`、`retentionMatrix`
- 发现：`aliases`、`symptoms`、`prerequisites`、`relatedIssues`、`sources`

**首发组件**：

| 组件 | 作用 |
|---|---|
| `EnvCard` | 固件来源、版本、上游基础、构建、设备修订、包管理器、关键应用版本；未知保持未知 |
| `ScenarioCards` | 已有光猫/主路由、双路由、AP、PVE、指定设备等入口 |
| `TopologyTable` | 物理口 → bridge → vNIC → interface；网关/DHCP/DNS 职责 |
| `Step` / `ExecutionBadge` | 每步标 LuCI/CLI、路由器 Shell/电脑/手机，并给预期结果 |
| `RetentionMatrix` | 配置、软件包、脚本、数据、关键家庭服务分别保留/恢复 |
| `TestRecord` | 固定组合、设备、版本、日期、结果；未测不显示通过 |
| `SymptomIndex` | 全网/单终端/单应用、有线/Wi-Fi、IPv4/IPv6、安装后/升级后 |
| `AliasSearch` | OpenClash/ open克拉什、PVE/Proxmox、软路由/x86 router 等别名 |

**内容清单**：prebuild 扫描 MDX/frontmatter，生成 `content/manifest.json`；侧栏、场景/症状入口、canonical、hreflang、sitemap、搜索别名从清单派生。Starlight 的路由仍由文件系统生成，manifest 不替代路由，只驱动导航/索引，避免两套事实源。

**搜索**：Starlight 内置 Pagefind。v1 用自定义 Search 包装层做别名改写（`search-aliases.json`），或 Phase 0 验证 Pagefind Node `addCustomRecord` 方案；**中文分词/召回是高风险项**，需用 40 条固定查询验收。若 Pagefind 中文召回不足，再评估 FlexSearch/外部搜索，不在 v1 提前引入。

### 3.4 目录结构

```
docs-fleet/
├─ pnpm-workspace.yaml
├─ turbo.json
├─ fleet.config.json
├─ packages/docs-kit/              # createDocsConfig、组件、主题、schema 扩展
├─ content/
│  ├─ briefs/<site>/<slug>.yaml
│  ├─ drafts/<site>/<slug>.mdx
│  ├─ evidence/<site>/<slug>/
│  ├─ reviews/<site>/<slug>.md
│  ├─ manifest.json                # prebuild 生成
│  ├─ search-aliases.json
│  ├─ query-registry.json
│  └─ policies/
├─ sites/router-homes/
│  ├─ astro.config.ts
│  ├─ site.meta.ts
│  ├─ src/content/docs/{en,zh}/...
│  ├─ src/components/
│  ├─ src/pages/                   # 场景/症状/404 等自定义页
│  ├─ public/_redirects
│  └─ package.json
├─ scripts/
│  ├─ fleet.ts
│  ├─ content/{import,check,approve,promote}.ts
│  ├─ build/{manifest,search-aliases,pagefind}.ts
│  ├─ checks/{claims,mdx,security,dedup,independence,links,smoke,canonical,i18n,queries}.ts
│  └─ deploy.ts / stamp.ts / ci-matrix.ts
├─ tests/search/queries.{zh,en}.json
├─ ops/{approvals,deployments}.json
└─ .github/workflows/{ci,deploy,approve-production}.yml
```

### 3.5 构建/部署

- Astro 7 + Starlight 0.42；pnpm catalog；Node 24.x；Turbo 2.x。
- `pnpm build` = prebuild manifest → Astro build → Pagefind → 40 查询冒烟。
- Pages direct upload；`domainStatus` 四态；未绑定只 preview。
- 40 查询验收：中文 20、英文 20，覆盖 OpenClash 别名、PVE、固件身份、后台失联、DNS、断流、SQM、VLAN、升级；每条指定预期前 3 结果，检查相关性/语种/空结果/手机操作。
- 生产部署要求：可信 run/commit/artifact、digest、批准、域名 `verified/live`、i18n/canonical/hreflang/sitemap/404 全过。

---

## 4. 内容生产与批准（无第二评审人）

### 4.1 流程

1. **Brief**：目标查询、意图、读者、uniqueAngle、大纲、来源、版本/设备条件、内链。
2. **Draft**：DeepSeek Harness 外部生成，存 `content/drafts` + claims。
3. **Import**：规范 frontmatter/路径；剥离外部批准/`human_verified`/部署字段；记录进口者、时间、原始哈希。
4. **Check**：schema、结构、claims/evidence、MDX 安全、来源、去重、内链。
5. **Approve**：solo 受信 workflow（GitHub Environment + `workflow_dispatch`）记录 `actor/site/page/contentRevision/policyVersion/commit`；明确“solo，未经独立复核”。
6. **Promote**：写入 `sites/<id>/src/content/docs/{en,zh}/`，更新 revision/批准对账。
7. **Build/Deploy**：门禁 → stamp → artifact → 部署 → smoke。

### 4.2 无评审人的边界

- **P0 允许 solo 批准**：P0 不含裸机刷机教程；002 是设备核对/恢复入口，不是刷机步骤。
- **高风险 P0**（PVE、DSA VLAN、访客隔离、SQM）：必须 E3 + 管理路径恢复 + 回滚步骤；文首/文末披露“solo 验证，未经独立复核”。
- **P1/P2 破坏性内容**（裸机刷机、bootloader 恢复、跨大版本迁移、IPTV 运营商配置）：没有第二评审人就**不发布操作步骤**；只能做“官方来源整理 + 前置检查 + 官方安装页导航”，或延后。
- 任何“已解决/我们实测”都必须对应 E3 记录；没有就写“未实测”。

### 4.3 八段文章模板

1. 解决什么问题 / 完成标准
2. 适用环境（固件身份、设备修订、版本、已有网络）
3. 接线与职责（上游、物理口、bridge、接口、网关/DHCP/DNS/IPv6）
4. 改动前准备（管理入口、备份、恢复）
5. 最小步骤（标执行位置 + 预期结果）
6. 终端验证（路由器 + 电脑/手机；允许/阻断；应用启停/重启）
7. 失败分支与恢复（错误原文、管理入口、最小联网回退）
8. 来源与复核（社区证据层级、官方链接、实测环境、日期、修改原因）

### 4.4 证据与版本

- E1 规格/标准；E2 OpenWrt x86 VM/固定配方；E3 真实设备/真实网络。
- 25.12.6 为主；24.10.8 只写差异段；`apk`/`opkg` 分开；不把 `apk upgrade`/`opkg upgrade` 当固件升级。
- fw4/nftables、DSA/swconfig 按设备核验；不把旧 iptables 教程直接套用。
- `testedVersions`、`testedTargets`、`lastVerifiedAt`、`knownLimitations` 必填；未知保持未知。
- 社区证据分“楼主问题/回帖建议/楼主后续/维护者结论”；未本地复现的不能写成站内实测。

### 4.5 去重与独立性

- 中英翻译对**不算重复**：按 `translationGroup` 排除，不做跨语言 dedup 阻断。
- 同一语言内：精确复制阻断；Jaccard ≥0.30 / containment ≥0.80 转人工；短页 <300 字符人工判断。
- 多站同质化仍是风险；v1 首站独立内容，不做跨站 packs。

---

## 5. 质量门禁

| 门禁 | 内容 | 阶段 |
|---|---|---|
| G0 | brief/draft schema、contentId/slug/locale/translationGroup | 写作/导入 |
| G1 | claims/evidence、E1/E2/E3、时效、版本/设备字段 | sourced |
| G2 | solo 批准 + `contentRevision`/`policyVersion` 匹配 | ready |
| G3 | 同语言去重/独立性；翻译对排除 | 发布前 |
| G4 | MDX AST、SSRF、secret/PII、许可/商标 | 发布前 |
| G5 | build、链接/锚点、静态 HTML、sitemap、canonical、hreflang、404、root 301 | 部署前 |
| G6 | 40 查询搜索验收、手机阅读、语言切换、缺译状态 | 部署前 |
| G7 | 产物 stamp/digest/可信 run/批准/域名状态 | 部署前 |
| G8 | GSC/索引/曝光/无结果查询/维护工时 | 发布后 |

### 5.1 保留的 v0.6 工程契约（不得回退）

- `contentRevision = SHA256(briefHash + pageHash + claimsHash + evidenceManifestHash + assets)`；`evidenceManifestHash` 覆盖来源、定位、摘录、证据等级、测试环境/配方、原始产物哈希、许可/权利；生命周期/部署字段不参与。
- Import 剥离外部批准、`human_verified`、部署状态；路径归一化并拒绝越界/symlink；MDX AST 白名单检查在首次编译前完成。
- Solo 批准由受信 `approve-production.yml`（GitHub Environment）写入 `ops/approvals.json`，绑定 `actor/site/page/contentRevision/policyVersion/commit`；内容变化即失效；review 文件不能自证发布权。
- 域名四态：`unbound/binding/verified/live`；`--target preview|production`；未绑定只允许 preview；`binding` 只允许无内容 noindex 占位部署；`verified/live` 才允许正式内容。
- Preview：canonical 用完整生产路径（不是首页）；实际验 `X-Robots-Tag: noindex`；base `pages.dev`/branch alias 也验；预览产物不得原样上生产，生产必须重新构建。
- CI：生产资格 = 全局 policy + 站点检查 + 同一可信 run/commit artifact + digest + 批准 + 域名状态；记录 `activeDeployment` 与 `lastHealthyDeployment`；preview 不能作为回滚目标。
- 部署：stamp 含 site/commit/inputDigest/policyVersion/artifactDigest/runId/mode；首次生产前准备 noindex 占位；Pages 配额、rollback API、404 而非全站 301 到首页。
- 内容安全：默认 `.md`；MDX 仅白名单组件；SSRF 防护；构建产物扫描 `_worker.js`/Functions；CODEOWNERS 保护 workflows/scripts/lockfile/docs-kit/registry。

**零容忍**：错误 canonical、缺失/错误 hreflang、未发布页面进 sitemap、缺译被索引、错误站点/commit、无批准部署、root 未 301。

**其他阈值**：死链 0；允许/阻断负向测试通过；SQM 记录空载/负载/吞吐/CPU/加速状态；PVE 记录路由 VM 关闭后的管理/备份路径；DSA VLAN 记录管理口恢复；AGH 记录终端真实查询与失效恢复。

---

## 6. 开发工作包与工期

DOCX 基线为 **10–16 开发人日**（按复用外壳估算）；本方案不复用 ubuntu.fan 的 Nextra 壳，需在 Starlight 新建双语壳、8 个组件、manifest、Pagefind 别名层，建议按 **14–20 开发人日**规划，10–16 仅在新壳复用度高于预期时成立。

| 工作包 | 人日 |
|---|---:|
| 外壳/内容契约（schema、manifest、i18n、404/301） | 2–3 |
| 双语站壳与 8 栏目、场景/症状入口 | 3–4 |
| 8 个首发组件 + 搜索别名 + 40 查询 | 4–6 |
| 质量门禁、预览、部署、回滚 | 3–4 |
| 缓冲/复盘 | 2–3 |
| **合计** | **14–20** |

**内容工作量**：每个双语主题 8–14 小时；24 个 P0 = **192–336 小时（24–42 人日）**。1 名编辑 8 周约 320 小时，处在上沿；高工作量需要第二编辑、减少并行或延后，不能压缩验证。

### 6.1 六至八周节奏

| 周 | 重点 | 完成标志 |
|---|---|---|
| 1–2 | 双语壳、schema/manifest、PVE/OpenClash/AGH/SQM 四组样板 | 组件/证据/验证模板可复用；`/en` `/zh` `/` 301 正常 |
| 3–4 | 登录、固件辨识、基础联网、DNS、排错主路径 | 已发布路径不依赖未发布前置文章 |
| 5–6 | 分批上线已验证 P0；搜索/索引/部署回滚；绑定域名 | 可试运行；记录未完成主题与原因 |
| 7–8 | 剩余具备条件的 P0；复测复杂应用/无线/恢复 | 24 对范围目标或明确调整资源/日期 |
| 90 天 | 按问题覆盖/维护成本/实际环境选择 P1 | 有证据且可验证的任务优先 |

### 6.2 第一批交付

- 四组样板（8 页）先完成，不等 24 主题全齐。
- 域名未绑定期间只 preview；绑定后先发四组样板，再按完整任务组分批发布。
- 每批 4–6 页，避免评审/验证疲劳。

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 无第二评审人 | P0 高风险页缺独立复核 | P0 不含裸机刷机；PVE/DSA/VLAN 要求 E3+恢复+披露；P1/P2 破坏性内容延后 |
| 内容 192–336h / 8 周 | 单编辑超负荷 | 四组样板后重估；增加编辑或减少并行；不压缩验证 |
| 第三方代理应用（OpenClash/PassWall） | 版本漂移、法律/合规风险 | 固定版本/包源；只写技术配置与用户责任；不做规避/绕过教程；必要时法律复核 |
| 关键词“全球”口径 | 决策偏差 | 报告保留 API 参数；同时看 2026-09；不把均值当流量 |
| 社区样本偏差 | 选题过度拟合 | 36/53 可读、17 仅索引；不推算占比/故障率；用官方资料复核 |
| Starlight 缺译 `fallbackType: redirect` | 缺译被索引/跳转而非 404 | v1 只发成对页面；Phase 0 验证；P1 单语延后或加 404 guard |
| Pagefind 中文检索/别名 | 40 查询不达标 | Phase 0 用真实查询验收；别名改写；不足再评估 FlexSearch/外部搜索 |
| Root `/` 与 `/en` `/zh` | 重复/错误 canonical | `_redirects` 301；canonical 自指；sitemap/hreflang 校验 |
| 域名未绑定 | 无法生产验收 | 四态；preview noindex；绑定时做占位部署/路由验收 |
| 版本/设备条件不足 | 教程无法 E3 | 记录“未实测”；设备/运营商任务延后，不凑页数 |
| Pages 100 项目/文件限制 | 扩站受限 | 20 站内无碍；接近上限转 VPS/分账号 |
| Astro/Starlight 升级 | 全站回归 | catalog 锁版本；夹具站 canary；分批部署 |

---

## 8. 运营、SEO 与验收

- **域名**：未绑定；Phase 5/6 绑定。Cloudflare zone/NS、DNS/MX/TXT 备份、Custom Domain、TLS、apex/www、DNSSEC/CAA。
- **SEO**：`/en/`、`/zh/` 各自自指 canonical；双向 hreflang；`/` 301 到 `/en/`；只发布成对页面；sitemap 不含草稿/缺译/空筛选；FAQ/HowTo 不作为富结果收益项（Google 2026 已停止 FAQ 展示）。
- **GSC**：有 DNS 控制权可提前验证 Domain Property；sitemap 在正式验收后提交。
- **分析**：每语言/国家/topic/页面类型；非品牌只排除本站名/域名导航词，不排除含 OpenWrt 的任务词；记录无结果查询、恢复问题、维护工时。
- **90 天**：30 天查抓取/索引/语言对应；60 天补已获反馈的路径（OpenClash DNS、AGH 升级恢复、SQM 不生效、PVE 管理失联）；90 天按问题覆盖/曝光/维护成本选 P1。
- **备份**：Git 外保存证据/批准/许可/生产 artifact/域名映射；RPO≤24h、RTO≤4h；首发前异地恢复演练。
- **监控**：首页+关键页 5 分钟探测；证书 <14 天告警；危险操作错误 24h 纠正/撤稿。

---

## 9. 延后项与 Phase 0 确认

### 9.1 延后

1. 跨站内容包、50 站编排、VPS 替代部署。
2. P1/P2 单语发布、缺译 404 的完整方案、文档版本化、hreflang 多地区。
3. 802.11r/802.11s/多 AP 漫游、复杂 Wi-Fi 性能。
4. 裸机刷机、bootloader 恢复、跨大版本迁移（需第二评审人/设备）。
5. 第二套主题、大范围 Starlight 组件覆盖、embedding 去重、自动刷新。
6. 仓库内模型 API/自动批量（继续外部 DeepSeek Harness）。

### 9.2 Phase 0 必须确认

1. 四组样板的具体设备/固件/应用版本；PVE 宿主机、OpenClash 内核、AGH 版本、SQM 线路/CPU。
2. Starlight 无 root locale 的 `/en` `/zh` 构建、`/` 301、缺译行为、hreflang/sitemap 实测。
3. Pagefind 中文检索与别名：40 查询中先跑 20 条，决定是否需要别名层/替换搜索。
4. 24 个 P0 是否全部首发，还是先 16 个核心 + 8 个应用/性能；按设备和编辑能力调整。
5. 域名注册商/DNS 控制权、绑定时间、Pages 项目。
6. 第三方代理应用的合规边界；是否只写技术配置，不做规避教程。

### 9.3 下一步

1. Phase 0：用 2 页双语样板（DNS + PVE）验证 i18n/301/组件/搜索。
2. 第 1–2 周：四组样板（PVE、OpenClash、AGH、SQM）+ 双语壳。
3. 第 3–4 周：基础路径；第 5–6 周分批上线；第 7–8 周剩余 P0。

---

## 10. 评审记录

- v0.2 经 Codex 只读评审；10 条 P0/P1 纳入 v0.3。
- v0.4 收敛：移除自动 AI 生成/provider/批量/内容包；首站 8–10 页；E3 推荐。
- v0.5 首站定为 Router.Homes OpenWrt；域名未绑定；v0.5 再经 Codex 复审，10 条 P0/P1 纳入 v0.6。
- v0.6 完成 solo 批准、域名四态、preview canonical、CI 可信边界、刷机边界、证据哈希、工期与合规。
- v0.7 纳入 DOCX/XLSX 研究：24 个 P0 主题/48 页、8 栏目、四组样板、54 主题路线图、Starlight 显式 `/en` `/zh` 方案；无第二评审人；域名未绑定。
- v0.7 未执行代码/构建验证；Phase 0 的 2 页样板与四组样板是第一批验证。
- ubuntu.fan 实际为 Nextra + Pagefind（非 Fumadocs）；本方案只复用信息架构，不复用其壳。
