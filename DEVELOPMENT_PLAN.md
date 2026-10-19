# 文档站群开发方案（v0.6 · OpenWrt 首站 / Codex 复审修订）

> 状态：首站 **Router.Homes（https://router.homes）**，内容为 **OpenWrt 中文文档**；域名尚未绑定；v0.5 经 Codex 只读复审，10 条 P0/P1 已纳入本版。
> 参考：`~/centosfan`（生产多站系统）、`starlight-multi-site`（原型，不采用）、`astro-fleet`（monorepo 工程参考，非 Starlight）。
> 核心边界：DeepSeek Harness 外部写作；仓库不做模型 API/自动批量；v1 不做内容包；人工批准 + claims/evidence + `contentRevision` + dedup/独立性门禁；未绑定域名只做 preview。

---

## 0. 决策与复审处置

| ID | 决策 | 选择 |
|---|---|---|
| ADR-001 | 架构 | Monorepo，每站独立 Astro/Starlight 项目 |
| ADR-002 | 内容模型 | 每站独立内容；v1 不做跨站内容包 |
| ADR-003 | 站点差异 | 每站独立 sidebar/首页/栏目 |
| ADR-004 | 部署 | Cloudflare Pages 每站一项目 + Actions 直传 |
| ADR-005 | 规模 | 首发 3–5 站，12 个月 10–20 站 |
| ADR-006 | 内容生产 | DeepSeek Harness 外部产出 + 人工批准 + 严格门禁 |
| ADR-007 | 首站内容 | Router.Homes（router.homes）OpenWrt 中文文档；最终 8–10 页，生产先发 4–6 页 |
| ADR-008 | 证据策略 | 规格 E1；可复现步骤 E2；吞吐/覆盖/“我们实测” E3；首站至少 2 页 E3 |
| ADR-009 | 跨站分发 | v1 不做；出现真实复用页后再评估 |
| ADR-010 | 域名状态 | `unbound → binding → verified → live` 四态；未绑定只允许 preview，不允许正式内容生产部署 |
| ADR-011 | 批准机制 | 第二人 PR approval；solo 用受信 `workflow_dispatch` 批准，绑定 actor/revision/policy；破坏性页面必须第二人或降级为来源整理 |
| ADR-012 | OpenWrt 版本 | 以一个已验证的 25.12.x 稳定版为主；24.10.x 只写差异段，不复制双套文章 |

**Codex v0.5 复审处置**：

| # | 级别 | 问题 | 处置 |
|---|---|---|---|
| 1 | P0 | GitHub 不允许 PR 作者自批，solo review 机制不可实现 | 采纳：solo 改为受信 workflow 批准；破坏性页面第二人或降级 |
| 2 | P0 | preview / 首次生产 / 绑定验收状态死锁 | 采纳：域名四态 + `--target preview|production`；首次发布占位 |
| 3 | P1 | preview canonical 校验与生产规则冲突 | 采纳：canonical 始终完整生产路径；未绑定时只校验本地路由 |
| 4 | P0 | CI 未表达可信部署边界 | 采纳：trusted run/commit/artifact + digest + approval；active/lastHealthy |
| 5 | P0 | 刷机/恢复写成通用流程 | 采纳：限定一个已验证型号/修订；三类恢复分开；E3 才可操作 |
| 6 | P1 | 25.12 apk / 24.10 opkg 口径过宽 | 采纳：25.12.x 主版本 + 24.10 差异段；`testedVersions` 等字段 |
| 7 | P1 | Wi-Fi 过宽；防火墙/隔离缺负向验收 | 采纳：收缩 Wi-Fi；补 IPv4/IPv6 隔离负向测试 |
| 8 | P1 | revision 未覆盖证据语义；导入信任字段 | 采纳：`evidenceManifestHash`；import 剥离外部批准 |
| 9 | P1 | 15–21 人日只适合砍范围 | 采纳：完整范围 20–30 工程 + 8–15 内容/测试人日；先发 4–6 页 |
| 10 | P1 | 合规/运营缺责任与时限 | 采纳：owner/告警人、许可字段、数据边界、RTO/RPO、撤稿时限 |

---

## 1. 目标与非目标

### 1.1 目标

1. 首发 3–5 站，设计容量 20（硬上限 50）；每站独立域名、内容、sidebar/首页、品牌。
2. 单站可独立开发、构建、预览、部署；单站故障不阻塞其他站。
3. 一条命令构建全部；一条命令构建指定站；CI 只构建受影响站点，但跨站检查全库运行。
4. 内容由 DeepSeek Harness 在仓库外生成，进入 `content/drafts/` 后走 `import → check → approve → promote`。
5. 首站 Router.Homes 最终 8–10 页 OpenWrt 文档；生产先发 4–6 页（含至少 2 页 E3），稳定后再补齐。
6. 域名未绑定期间只做 preview；绑定、TLS、路由验收后才允许正式内容部署。
7. 每站门禁可测量：schema、claims/evidence、revision 绑定、批准、dedup、独立性、链接、sitemap、canonical、产物。
8. 生产可运维：部署可追溯、可回滚；每站独立 Pages 项目；密钥最小权限。

### 1.2 非目标（v1 不做）

- 仓库内模型 API、自动批量生成、provider 适配。
- 跨站内容包 `add/sync/check/prune`。
- `mirror`/`localized`/多语言/文档版本化。
- 802.11r/802.11s/多 AP 漫游、完整双版本教程、snapshot 支持。
- CMS、跨站统一搜索、无人值守自动发布。
- 50 站编排、自动账号拆分、VPS 替代部署。
- 第二套主题、大范围 Starlight 组件覆盖、Lighthouse 硬阈值。

---

## 2. 架构

### 2.1 选型与隔离边界

Monorepo，每站独立 Astro/Starlight 项目。内容、路由、产物、部署、回滚独立；依赖版本（catalog + 单 lockfile）、docs-kit、CI 工作流、共享门禁仍耦合。共享依赖升级默认触发全站验证，生产可分批。

centosfan 的单项目多载体不混入本仓库；若未来出现“同一知识网络、70% 共享”的站群，单独建 B 仓。

### 2.2 目录结构

```
docs-fleet/
├─ pnpm-workspace.yaml
├─ turbo.json
├─ fleet.config.json               # 站点注册表（zod 校验）
├─ packages/
│  ├─ docs-kit/                    # createDocsConfig、主题、共享组件；构建到 dist
│  └─ content-kit/                 # 共享 MDX 片段（可选，v1 可空）
├─ content/
│  ├─ briefs/<site>/<slug>.yaml
│  ├─ drafts/<site>/<slug>.mdx
│  ├─ drafts/<site>/<slug>.claims.json
│  ├─ evidence/<site>/<slug>/      # 证据清单、原始产物哈希、脱敏副本
│  ├─ reviews/<site>/<slug>.md     # 审计记录
│  ├─ query-registry.json
│  └─ policies/                    # 来源、证据、许可、审核清单
├─ sites/router-homes/
│  ├─ astro.config.ts
│  ├─ site.meta.ts
│  ├─ package.json
│  ├─ src/content.config.ts
│  ├─ src/content/docs/
│  ├─ src/styles/theme.css
│  └─ public/
├─ scripts/
│  ├─ fleet.ts
│  ├─ new-site.ts
│  ├─ validate.ts
│  ├─ content/{import,check,approve,promote}.ts
│  ├─ deploy.ts
│  ├─ stamp.ts
│  ├─ ci-matrix.ts
│  └─ checks/{claims,mdx,security,dedup,independence,links,smoke,canonical,global,site,review}.ts
├─ ops/
│  ├─ approvals.json               # 受信批准记录（actor/revision/policy）
│  └─ deployments.json             # active/lastHealthy deployment
├─ templates/site/
└─ .github/workflows/{ci,deploy,approve-production}.yml
```

注册表用 JSON，`new-site` 直接追加；类型由 `packages/docs-kit/src/registry.ts` 的 zod schema 推导。

### 2.3 注册表、域名状态与权限

```json
{
  "id": "router-homes",
  "domain": "router.homes",
  "title": "Router.Homes",
  "description": "OpenWrt 中文文档：刷机、网络、Wi-Fi、防火墙与故障排查",
  "locale": "zh-CN",
  "audience": "想在家用路由器上使用 OpenWrt 的用户",
  "angle": "按真实设备与固件版本验证的 OpenWrt 操作文档",
  "minPages": 8,
  "approvalMode": "solo",
  "deploy": {
    "enabled": false,
    "project": "router-homes",
    "domainStatus": "unbound"
  }
}
```

**域名状态**：

| 状态 | 允许行为 |
|---|---|
| `unbound` | 本地构建；指定 preview 分支部署；禁止正式内容生产部署 |
| `binding` | 配置 DNS/Custom Domain；允许一次**无内容、noindex 的占位生产部署**验证路由 |
| `verified` | DNS/TLS/域名路由验收通过；允许首批正式内容部署 |
| `live` | 正式内容 smoke 通过；提交 sitemap，开始观察 |

`deploy.enabled=false` 只表示“未批准正式内容生产部署”，不阻止 preview；CLI 必须显式 `--target preview` 或 `--target production`，生产分支必须与 Pages 项目设置一致。

### 2.4 字段唯一来源

| 字段 | 唯一来源 |
|---|---|
| id、domain、title、description、locale | `fleet.config.json` |
| deploy.enabled/project/domainStatus、minPages、approvalMode | `fleet.config.json` |
| audience、angle、primaryTopics | `fleet.config.json` |
| sidebar、首页、栏目、主题、插件 | `sites/<id>/site.meta.ts` |
| 正文、frontmatter、claims | `sites/<id>/src/content/docs/` |

`site.meta.ts` 通过 `getSite(id)` 读注册表，不复制 title/domain。

### 2.5 docs-kit、schema 与构建

- `docs-kit` 用 `tsc` 构建到 `dist/`；站点 `astro.config.ts` 导入构建产物。
- 每站显式依赖 `@fleet/docs-kit: workspace:*`。
- 自定义 frontmatter 通过 `docsSchema({ extend })` 接入。
- v1 不重写 Starlight 的 Header/Breadcrumbs/SEOHead；先保留原生能力。
- Sitemap：先确认 Starlight 内置行为，再决定是否额外注册 `@astrojs/sitemap`。
- Turbo：`build` 声明 `dependsOn: ["^build"]`、`outputs: ["dist/**"]`；deploy/在线来源检查 `cache:false`；stamp 在缓存恢复后执行，绑定输入摘要与产物 digest；digest 排除 stamp 自身。

---

## 3. 内容系统

### 3.1 写作、导入与批准流程

1. **Brief**：`content/briefs/<site>/<slug>.yaml`，写目标查询、意图、读者、uniqueAngle、大纲、来源、内链、版本范围。
2. **Draft**：DeepSeek Harness 生成，存 `content/drafts/<site>/<slug>.mdx` + `claims.json`。
3. **Import**：`pnpm fleet content import --site router-homes --slug <slug> --file <path>`：
   - 规范 frontmatter/编码/路径；
   - **剥离**外部自带的 `verifiedBy`、`human_verified`、部署状态、批准字段；
   - 记录 `importedBy`、`importedAt`、`originalFileSha256`、生成工具/模型标识；
   - 路径归一化，拒绝越界与 symlink 越界；
   - MDX 可执行内容检查在首次编译前完成。
4. **Check → Approve → Promote**：见 §3.4。

仓库不调用模型 API，不保存 provider key；外部工具产出视为不可信输入。

### 3.2 每站独立内容

- `sites/<id>/src/content/docs/**` 是唯一正文来源。
- 每站独立 sidebar/首页/栏目；手写页面同样需要批准与 `contentRevision`。
- v1 不做跨站内容包；没有真实复用页之前，不引入分发、锁文件、canonical 例外。

### 3.3 Claims、evidence 与 OpenWrt 版本口径

**Claim** 字段：`id、bodyLocator、claimType、text、product、version、region、observedAt、validUntil、evidenceIds、verificationStatus、verifiedBy`。

**Evidence** 字段：`id、sourceUrl、finalUrl、publisher、retrievedAt、locator、excerpt、contentHash、testEnvironment、testRecipe、rights、licenseId、licenseUrl、attribution、modified、access`。

**证据适配**：

| 内容 | 最低证据 | 说明 |
|---|---|---|
| 规格、标准、协议 | E1 | 官方文档/标准文本 |
| 配置步骤、命令 | E1 + E2 | E2 = OpenWrt x86 VM/固定测试配方可重放；真实 Web UI 用截图 + 固件版本 + 日期 |
| 吞吐、覆盖、稳定性、“我们实测” | **E3** | 真实设备/真实网络；无 E3 写“厂商标称/未实测”，不能用第一人称实测口吻 |
| 版本/兼容性 | E1 | 30 天新鲜度 |
| 稳定标准/长期政策 | E1 | 180 天新鲜度 |

**OpenWrt 版本口径**：

- 首站以一个已验证的 **25.12.x 稳定版**为主；24.10.x 只写明确标识的差异段，不复制双套文章。
- 页面 frontmatter 增加 `testedVersions`、`testedTargets`、`lastVerifiedAt`、`knownLimitations`。
- 包管理页覆盖 `update/add|install/remove`、空间、签名、源版本匹配；明确不能混用 Alpine 软件源或跨 OpenWrt 版本换源。
- 不把 `apk upgrade` / `opkg upgrade` 批量升级作为推荐维护路径；系统维护指向受支持的固件升级流程。
- DSA 依据设备/target 判断，不按版本一刀切；设备是 swconfig 时明确退出本教程。

**刷机/恢复边界**：

- 第 3 页只写**一个已验证型号与硬件修订**的操作案例；通用前置检查另列。
- 强制记录：型号/修订、target/subtarget/profile、当前固件、目标版本、镜像 URL/类型/SHA-256、设备官方安装页。
- 分开写 failsafe、factory reset、bootloader/TFTP recovery；不能把 failsafe 当任意砖机恢复工具。
- 第 9 页改名“备份、升级与恢复路径”；区分配置备份、完整固件、设备校准数据。
- 默认不保留配置跨版本降级；DSA 等迁移单独核实。
- 操作前必须有有线管理路径、离线恢复说明和备份；不提供 `sysupgrade -F` 绕过校验的常规步骤。
- 操作型刷机案例必须有该硬件的 E3；`tested:false` 只能支持概览或官方指引。

### 3.4 contentRevision 与批准

```text
contentRevision = SHA256(canonicalJson({
  briefHash,
  pageHash,
  claimsHash,
  evidenceManifestHash,   // 来源、定位、摘录、等级、测试环境、原始产物、许可、权利
  assets: [{ path, hash }]
}))
```

`evidenceManifestHash` 必须覆盖证据语义，而不只是源文件哈希。排除字段明确列出（生命周期、部署状态、`contentRevision/reviewedRevision` 等派生值），避免循环。

**批准模式**：

- **第二人模式**：受保护 PR 上由非作者的 reviewer 批准；修改 brief/draft/claims/evidence/asset 后自动撤销。
- **solo 模式**：GitHub 不允许作者自批，因此用受信 `workflow_dispatch`（`approve-production.yml`，受 GitHub Environment 保护）记录：
  - `actor`（GitHub 身份认证）、`siteId`、`pageId`、`contentRevision`、`policyVersion`、`commit`、`approvedAt`；
  - 内容变化后重新批准；部署前验证批准覆盖最终构建输入；
  - 明确承认 solo 只提供身份与可追溯性，不提供独立复核。
- **破坏性页面**（刷机、恢复、破坏性网络配置）：必须有第二人 reviewer；没有第二人时，降级为“官方来源整理 + 兼容性检查”，不写第一人称操作步骤，不声称已刷机。

Review 文件只是审计记录，不是发布授权；批准记录写 `ops/approvals.json`，由受信 workflow 生成，内容脚本不能写。

**状态机**：

```
planned → drafted → sourced → reviewed → ready
                    ↘ rejected / blocked
ready → deployed → refreshed / retired
```

| 状态 | 条件 |
|---|---|
| planned | brief schema 通过；站点/查询已登记 |
| drafted | 草稿 + claims + meta 存在；结构 schema 通过 |
| sourced | claims/evidence 完整；来源/证据检查通过 |
| reviewed | 第二人 PR 或受信 solo 批准；revision 匹配 |
| ready | promote 到站点内容；构建/门禁通过 |
| deployed | 部署成功；写 `activeDeployment`/`lastHealthyDeployment` |
| refreshed/retired | 新 revision 替换 / 下线并登记 404 |

**反例验收**：伪造 reviewer、改 claims、改正文、改图片、只改证据定位/测试设备/许可、直接新增未登记页面 → 均不能上线或使批准失效。

### 3.5 导入与内容安全

- 默认 `.md`；MDX 只允许固定组件/属性，拒绝任意 `import/export`、表达式、`<script>`、事件处理器、危险 URL。
- `check-mdx.ts` 用 AST 检查，且在首次 MDX 编译前运行。
- DeepSeek Harness 的提示词/来源视为不可信输入；不上传仓库、其他站点内容、配置备份、密码、私钥、PPPoE 凭据、客户网络拓扑、未脱敏日志。
- 来源抓取：仅 HTTPS；逐跳检查重定向与解析地址；拒绝 localhost、RFC1918、链路本地、云元数据；限制大小/超时/MIME。
- 构建产物扫描：`_worker.js`、Functions 目录、异常脚本、意外公开文件。
- `.github/workflows/**`、`scripts/**`、`pnpm-lock.yaml`、`packages/docs-kit/**`、`fleet.config.json`、`content/policies/**` 用 CODEOWNERS 保护；生产部署只消费可信 main workflow 的 artifact。
- 禁止带 secrets 的 `pull_request_target` 执行 PR 代码。

### 3.6 页面级索引策略与 preview/production 矩阵

v1 只支持 `primary`：

| 页面类型 | canonical | robots | sitemap |
|---|---|---|---|
| 原创、可索引 | 自引用完整 URL | index | 收录 |
| 明确不参与搜索 | 按既定策略 | noindex | 排除 |
| 重复副本/翻译（v1.1+） | 指向 primary/同语言页 | index | 排除/含 hreflang |

**canonical 始终是完整生产路径**，例如 `https://router.homes/guides/packages/`，不能只写域名或指向首页。

| 环境 | 索引 | canonical 校验 |
|---|---|---|
| 本地/`wrangler pages dev` | noindex（或本地不校验） | 对照本地路由清单，目标页存在 |
| hash preview | `X-Robots-Tag: noindex` + HTML noindex | 完整生产路径；不要求生产 URL 在线 |
| branch alias / `project.pages.dev` | 实际验收 noindex；不能假设默认保护 | 同上 |
| 自定义域名 `verified/live` | index | 目标 200、可索引、无跳转链；自引用一致 |

- 不用 `robots.txt: Disallow: /` 替代 noindex（爬虫可能读不到指令）。
- 预览产物不得原样上生产；生产必须重新构建并验证 noindex 已移除。
- 验收命令：`curl -sS -D - -o /dev/null "$URL"` + HTML 解析 canonical/meta robots；错误 canonical、意外生产 noindex 均为 **0**。

### 3.7 去重与站点独立性

**算法**：中文 5-gram；英文词 5-gram；正文去导航/页脚/模板；代码块与引用单独比较；记录 `algorithmVersion`。

| 情况 | 处理 |
|---|---|
| 规范化正文哈希完全相同 | 未登记复用 → 直接阻断 |
| Jaccard ≥ 0.30 | 人工复核 |
| containment ≥ 0.80 | 人工复核 |
| 正文 < 300 字符 | 人工判断 |

- 50 对样本校准，包含正常同主题、合法引用、整页复制、语义改写。
- `unique ratio = 某页独有 shingle 数 / 该页 shingle 总数`；0.8 只作观察线。
- 新站必须有独立用户任务、维护负责人、实际资料增量；换品牌/sidebar/措辞不算。

### 3.8 首站页面与 canary

**最终 8–10 页**（先发 4–6 页）：

1. OpenWrt 是什么、适合谁、版本选择（25.12.x 主；24.10 差异段）
2. 设备兼容性与刷机前检查（Table of Hardware、闪存/内存、恢复方式）
3. 刷机案例（**限一个已验证型号/修订**；E3；官方安装页；恢复另列）
4. 首次登录与上网：LuCI/SSH、WAN/LAN、PPPoE/DHCP、DNS（WAN 不开放 LuCI/SSH；LAN 网段冲突）
5. Wi-Fi：国家码、信道/频宽、WPA2/WPA3；漫游/802.11s 延后
6. 包管理：`apk`/`opkg` update/add/remove、空间、签名、源版本；不做 `upgrade` 维护
7. 防火墙：input/forward、IPv4 DNAT 与 IPv6 放行、CGNAT 前置判断
8. VLAN/访客/IoT：DSA 端口标记/PVID/管理端口；VLAN 本身不等于隔离；IPv4+IPv6 负向测试
9. 备份、升级与恢复路径：配置备份 vs 完整固件；不保留配置跨不兼容降级；不用 `sysupgrade -F`
10. 故障排查：链路→地址→路由→DNS→服务；先采集再改配置

**E3 页**：第 3 页（刷机/恢复）、第 5 页（Wi-Fi 吞吐/覆盖）、第 8 页（VLAN/隔离真实链路）；至少 2 页。

**流程**：

- 先写第 1、2、4、6 页 + 至少 1 页 E3（4–6 页）作为首批生产；技术/内容稳定后补到 8–10 页。
- 技术 canary：本地 + preview，验证审核/构建/链接/SEO/回滚；不观察收录。
- 域名未绑定时不做生产 canary；Phase 5 绑定并验收后发布首批。
- 生产 canary 观察 2–4 周；GSC 只做诊断，不设曝光 KPI。
- 审阅批次 3–5 页；待审 >10 页暂停新稿。
- `minPages` 不参与首批部署授权；关于/隐私等辅助页不计入 8–10 页。

### 3.9 发布、监控与撤稿

- `content promote` 写入站点；只有 `reviewed` 可 promote；批准覆盖最终构建输入。
- 构建 → 门禁 → stamp → artifact → deploy → 线上 smoke；成功后才写 `activeDeployment` 与 `lastHealthyDeployment`。
- 未绑定：只 preview，确认 noindex、canonical 完整路径、sitemap 不提交。
- 绑定后：DNS/TLS/Custom Domain/apex-www、GSC、sitemap、生产 smoke；再做 2–4 周 canary。
- 撤稿：同步清理 sidebar、sitemap、Pagefind、内链；未知路径真实 404；不把下线页全 301 到首页。
- 无曝光分流：未发现 / 未抓取 / noindex / canonical 重复 / 已抓取未索引；不同原因不同处理，不一律改稿。
- 月度轻审计、季度深审计。

---

## 4. 构建、CI 与部署

### 4.1 工具链

- Node 24.x（Astro 7 要求 `>=22.22`）；pnpm workspace + catalog；Astro 7.x + Starlight 0.42.x；Turbo 2.x；TypeScript + zod；`@astrojs/mdx`（按需）。
- 脚本统一 `tsx`；根 `package.json` 定义 `"fleet": "tsx scripts/fleet.ts"`；CI 用 `pnpm exec tsx`，不要用 `node scripts/*.ts`。
- 生产部署步骤只装 `wrangler`/最小依赖，不跑内容构建或安装脚本。

### 4.2 CI

```yaml
env:
  BASE: ${{ github.event.pull_request.base.sha || github.event.before }}
jobs:
  plan:
    outputs:
      matrix: ${{ steps.plan.outputs.matrix }}
      has_sites: ${{ steps.plan.outputs.has_sites }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - id: plan
        run: pnpm exec tsx scripts/ci-matrix.ts --event "$GITHUB_EVENT_NAME" --base "$BASE" --head "$GITHUB_SHA"
  policy:
    needs: plan
    steps:
      - uses: actions/checkout@v4
      - run: corepack enable && pnpm install --frozen-lockfile
      - run: pnpm exec tsx scripts/checks/global.ts
  build:
    needs: [plan, policy]
    if: needs.plan.outputs.has_sites == 'true'
    strategy:
      fail-fast: false
      max-parallel: 3
      matrix:
        site: ${{ fromJSON(needs.plan.outputs.matrix) }}
    steps:
      - uses: actions/checkout@v4
      - run: corepack enable && pnpm install --frozen-lockfile
      - run: pnpm exec turbo run build --filter=@fleet/site-${{ matrix.site }}
      - run: pnpm exec tsx scripts/checks/site.ts --site ${{ matrix.site }}
      - run: pnpm exec tsx scripts/stamp.ts --site ${{ matrix.site }}
      - uses: actions/upload-artifact@v4
        with: { name: dist-${{ matrix.site }}, path: sites/${{ matrix.site }}/dist }
  deploy:
    needs: [plan, build]
    if: always() && needs.plan.outputs.has_sites == 'true' && github.ref == 'refs/heads/main'
    strategy:
      fail-fast: false
      matrix:
        site: ${{ fromJSON(needs.plan.outputs.matrix) }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { name: dist-${{ matrix.site }}, path: sites/${{ matrix.site }}/dist }
      - run: npx wrangler pages deploy sites/${{ matrix.site }}/dist --project-name ... --branch main
```

**生产资格**必须同时满足：

1. 全局 `policy` 成功；
2. 该站 `checks/site` 成功；
3. artifact 来自同一可信 run/commit；
4. digest 匹配，stamp 的 site/commit/mode 正确；
5. `ops/approvals.json` 有覆盖该 revision/policy 的批准；
6. `domainStatus` 为 `verified`/`live`。

- artifact 下载到明确 `sites/<id>/dist`；部署前核对路径、site、commit、mode。
- 凭据只进部署步骤；部署步骤不跑安装/构建。
- 每站 concurrency；拿到执行权后再次确认目标 revision，防止旧任务覆盖新发布。
- 记录 `activeDeployment`（上传成功）与 `lastHealthyDeployment`（smoke 成功）；smoke 失败也要记录远端已变化。
- 首次生产发布没有旧版本可回滚：预先准备 noindex 占位产物或停服处置。
- 失败站即使下次无内容变化，也必须能补部署；`ops/deployments.json` 对账。

### 4.3 构建策略与 SLO

- 3–5 站：逐站矩阵，`max-parallel: 2–3`，缓存 pnpm store。
- 10–20 站：先维持矩阵；有瓶颈再按 4–5 站分片；部署 >5 站用单 job 循环或轻量镜像，避免重复 install。
- nightly 全量检查；Phase 0 记录冷/热构建、RSS、artifact 大小、上传耗时。
- SLO：单站变更反馈 p95 ≤10 分钟；20 站全量 ≤30 分钟；超标再优化。

### 4.4 部署、域名状态与回滚

- `fleet deploy --target preview|production`；`domainStatus=unbound` 只允许 preview；`binding` 允许一次无内容 noindex 占位生产部署；`verified/live` 允许正式内容。
- stamp：`site、commit、inputDigest、policyVersion、artifactDigest、runId、mode、builtAt`；digest 排除 stamp 自身。
- 部署前校验 site/commit/mode、`index.html`、candidate/rehearsal、digest、批准、域名状态。
- Pages 配额：Free 每月 500 次构建、1 并发；100 项目/账号；20,000 文件/站、25 MiB/文件；direct upload 不消耗构建次数，但受文件/API 限流。
- 回滚优先用已有成功 production deployment；不要用 `wrangler pages deployment` 当完整回滚命令。API：
  ```text
  POST /accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/rollback
  ```
  preview 不能作为回滚目标。
- artifact 保留最近 5 个成功生产版本或 30 天；回滚不重跑内容生成。
- 首次生产失败：停留占位/旧版；记录补部署；不把“上传成功”当“发布成功”。
- 纯静态 `_redirects` 不支持任意 410：无替代页返回真实 404；确需 410 再引入 Function/Worker。

---

## 5. 质量门禁

| 门禁 | 内容 | 阶段 | 处理 |
|---|---|---|---|
| G0a | brief schema、站点/查询登记、slug/路径 | 写作前 | 硬阻断 |
| G0b | draft/claims/evidence schema、结构、MDX 首次编译前检查 | import 后 | 硬阻断 |
| G1 | 来源绑定、证据适配、时效、`highRisk`、许可 | sourced | 硬阻断 |
| G2 | 第二人或受信 solo 批准；`contentRevision` + `policyVersion` 匹配 | ready 前 | 硬阻断 |
| G3 | 精确复制阻断；近似重复人工复核 | 发布前 | 硬阻断/复核 |
| G4 | 独立定位、查询归属人工批准；0.8 观察 | 发布前 | 人工 |
| G5 | build、链接/资源/锚点、孤立页、sitemap、canonical（完整路径）、preview/production 索引矩阵 | 部署前 | 硬阻断 |
| G6 | 安全 headers、关键重定向；Lighthouse 后置 | 生产前/周期性 | 硬阻断/告警 |
| G7 | 产物 stamp/digest、可信 run/commit、批准、域名状态 | 部署前 | 硬阻断 |
| G8 | 索引/曝光采集、负责人、刷新/撤稿 | 发布后 | 运营 |

**阈值**：

- 错误 canonical、意外生产 noindex、错误站点/commit、无批准部署 = **0**。
- 精确复制 = 0；近似重复 ≥0.30 必须复核并记录结论。
- 死链 = 0；外链超时先重试并人工核实。
- 危险操作错误确认后 **24 小时内**纠正或撤稿。
- 版本安全信息每周检查；普通版本步骤每 30 天复核；证书剩余 <14 天告警。
- 备份初始目标：RPO ≤24 小时、RTO ≤4 小时；首发前完成一次异地恢复演练。

---

## 6. 工作分解与工期

**完整工程范围 20–30 人日**；另计 **8–15 内容/测试人日**（设备齐备时）。若坚持 15–21 工程人日，必须砍掉：第二套主题、共享组件覆盖、完整多命令 CLI；第二站只做不公开的隔离夹具。

| 范围 | 人日 |
|---|---:|
| 两站竖切、模板、registry、docs-kit | 3–4 |
| 内容 import/check/approve/promote + revision/证据哈希 | 4–6 |
| CI/CD、可信 artifact、部署状态、回滚 | 5–7 |
| SEO/索引矩阵/MDX/SSRF/去重/独立性 | 5–7 |
| 运维、监控、文档与缓冲 | 3–6 |
| **合计** | **20–30** |

### Phase 0：竖切与校准（1–2 天）

- 两站（`router-homes` + 一个不公开夹具）跑通 registry/docs-kit/构建。
- 域名未绑定：本地 `pnpm build` + `wrangler pages dev` 或 Pages preview；不配置 Custom Domain。
- 用两篇样稿（一篇 E1/E2、一篇 E3）校准 brief/claims/evidence/review。
- 确认：OpenWrt 8–10 页清单、验证型号/版本、第二评审人、域名绑定时间。
- 产出 `docs/adr/0002-content-review.md`、`0003-openwrt-version-policy.md`。

**验收**：两站独立 dist；preview noindex；canonical 完整路径；样稿通过 check。

### Phase 1：骨架（3–4 天）

- pnpm/Turbo/catalog、`fleet.config.json` + zod、`new-site`、`docs-kit`、`site.meta`、`templates/site`。
- 一套主题 + 原生 Starlight 外观；共享 Header/Footer/SEOHead 先不覆盖。
- `validate`、`build`、`dev --filter`。

**验收**：`new-site` 生成可运行站；重复域名/缺目录被拦截；两站构建通过；docs-kit 升级触发依赖站。

### Phase 2：内容 QA 与批准（4–6 天）

- brief/claims/evidence schema；import 剥离信任字段；`evidenceManifestHash`；MDX 编译前检查。
- `approve-production.yml` + `ops/approvals.json`；solo/第二人模式；破坏性页面第二人或降级。
- 首站首批 4–6 页走完 drafted→sourced→reviewed→ready。

**验收**：伪造 reviewer、改 claims、改正文、改图片、只改证据定位/设备/许可 → 不能上线或批准失效；无来源页被拒。

### Phase 3：CI/CD 与部署（5–7 天）

- `ci-matrix`（merge-base/事件范围/空矩阵/删除重命名）、全局 policy、可信 artifact、stamp、部署状态、回滚。
- `active/lastHealthy` 对账；preview 重部署/旧产物恢复；生产回滚演练放 Phase 5。

**验收**：只改一站只构建/部署该站；改 docs-kit 触发依赖站；某站失败不阻塞其他站；错误 digest/commit/无批准被拒；首次发布占位可用。

### Phase 4：SEO/质量/安全（5–7 天）

- `indexPolicy`、preview/production 矩阵、canonical 完整路径、sitemap/robots、dedup、independence、MDX/SSRF/secret 扫描、链接/孤立页。
- 50 对样本校准；首站监控、GSC 准备、备份。

**验收**：跨站复制被阻断/复核；canonical 链/环/首页误指被发现；preview 泄漏被拦；MDX/SSRF 样例被拒。

### Phase 5：域名绑定与首批生产（编辑 + 日历）

- 绑定域名：Cloudflare zone/NS、DNS/MX/TXT 备份、Custom Domain、TLS、apex/www、DNSSEC/CAA、GSC。
- `binding`：无内容 noindex 占位部署验证路由；`verified`：首批 4–6 页（含至少 2 页 E3）。
- smoke、sitemap、canary 2–4 周；再补到 8–10 页。
- 生产回滚演练；危险内容事故演练。

**验收**：域名/TLS/路由通过；首批页面 canonical/index/sitemap 正确；回滚可用；无未解决事实/合规事故。

### Phase 6：扩到 10–20 站（1–2 周工程 + 持续内容）

- CI 分片、nightly 全量、监控、审计、站点生命周期。
- 每站 owner、复核日、下线/404 流程。

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 外部 AI 幻觉/无来源断言 | 信任与 SEO 受损 | claims/evidence；人工批准；E0 拒绝 |
| solo 批准不是独立复核 | 质量盲区 | 明确边界；破坏性页面第二人或降级；高风险阻断 |
| 刷机/恢复误导 | 设备变砖、法律/信任风险 | 单型号/修订、E3、官方安装页、三类恢复分开、禁用 `-F` |
| 版本口径过宽 | 命令失效、误导 | 一个 25.12.x 主版本 + 24.10 差异段；`testedVersions` |
| preview 被索引 | 重复/错误收录 | noindex 头 + HTML 双检；不提交 sitemap；生产重建 |
| canonical 指错 | 权重损失 | 完整生产路径；本地/绑定分阶段校验；0 容忍 |
| 首次生产无可回滚 | 事故无法恢复 | noindex 占位、停服处置、lastHealthy 记录 |
| 审核/部署被绕过 | 未批准内容上线 | 受信 workflow、批准绑定 revision、CI 校验、CODEOWNERS |
| MDX/内容执行代码 | 供应链风险 | 默认 `.md`；AST 白名单；编译前检查；权限隔离 |
| SSRF/数据外泄 | 内网/隐私风险 | HTTPS、私网/元数据阻断；不上传配置/凭据 |
| 许可/商标 | 法律风险 | license/attribution 字段；独立站声明；不复刻官方标识 |
| Pages 配额/文件限制 | 部署失败 | 20k/25MiB 检查；接近 100 项目转 VPS/分账号 |
| 域名/DNS/TLS | 上线延迟 | 绑定清单；DNS/MX/TXT 备份；证书告警 |
| Astro/Starlight 升级 | 全站回归 | catalog 锁版本；夹具站 canary；分批部署 |

---

## 8. 运营、合规与上线验收

| 项目 | 验收 | 负责人 |
|---|---|---|
| 责任 | 站点 owner、编辑、部署操作者、告警接收者落实到账号；solo 可同一人 | owner |
| 独立声明 | 首页/关于页声明独立社区文档，与 OpenWrt 项目及设备厂商无隶属/授权；商标按权利方规则 | editor |
| 许可 | 来源记录 `licenseId/licenseUrl/attribution/modified`；OpenWrt Wiki 通常 CC BY-SA 4.0，逐项核查例外 | editor |
| 外部 AI | 只输入经许可、脱敏的 brief/材料；禁止配置备份、密码、私钥、PPPoE 凭据、客户拓扑、未脱敏日志 | operator |
| DNS/TLS | **未绑定**；Phase 5：Cloudflare zone/NS、DNS/MX/TXT 备份、Pages Custom Domain、TLS、apex/www、DNSSEC/CAA | operator |
| GSC | 有 DNS 控制权可提前验证 Domain Property；sitemap 在正式验收后提交 | operator |
| 分析/隐私 | 每站独立 ID；排除 preview/内网；隐私页先于分析脚本上线；事件不带 PII | operator |
| URL 生命周期 | 稳定 pageId；旧→新登记；未知 404；撤稿同步 sidebar/sitemap/Pagefind/内链 | operator |
| 备份 | Git 外保存证据/批准/许可/生产 artifact/域名部署映射；RPO≤24h、RTO≤4h；首发前异地恢复演练 | operator |
| 监控 | 每 5 分钟首页 + 1 关键页；连续 3 次失败告警；每日证书/索引指令检查；证书 <14 天告警 | operator |
| 内容维护 | 每页 owner、下次复核日；安全/版本信息每周、普通步骤每 30 天；危险错误 24h 纠正/撤稿 | editor |

- 月度轻审计、季度深审计。
- 生产成本按编辑/测试人时记录，不引入模型 API 预算。
- 2–4 周 canary 是诊断窗口，不承诺收录或曝光。

---

## 9. 延后项与下一步

### 9.1 明确延后

1. 跨站内容包（出现真实复用页后再评估）。
2. `mirror`/`localized`、hreflang、文档版本化、完整双版本教程。
3. 802.11r/802.11s/多 AP 漫游、复杂 Wi-Fi 性能专题。
4. 仓库内 AI 生成/provider/自动批量。
5. 第二套主题、大范围 Starlight 组件覆盖、embedding 去重、Lighthouse 硬阈值。
6. 50 站编排、自动账号拆分、VPS 替代部署。
7. `llms.txt`/FAQ schema、自动刷新/下线。

### 9.2 Phase 0 必须确认

1. 最终 8–10 页清单；首批 4–6 页选哪几篇。
2. 验证型号/硬件修订；哪台设备做刷机、Wi-Fi、VLAN/PPPoE 的 E3。
3. OpenWrt 主版本（建议一个 25.12.x 稳定版）与 24.10 差异段范围。
4. 第二评审人是否可用；不可用时，刷机页降级为来源整理。
5. 域名注册商/DNS 控制权、绑定时间、Pages 项目是否已建。

### 9.3 下一步

1. Phase 0：两站竖切 + 两篇样稿校准。
2. 确认 §9.2 五项。
3. 进入 Phase 1；Phase 2 前写 `docs/adr/0002-content-review.md` 与 `0003-openwrt-version-policy.md`。

---

## 10. 评审记录

- v0.2 经 Codex CLI 只读评审（`codex exec -s read-only`）；10 条 P0/P1 纳入 v0.3。
- v0.4 收敛：移除自动 AI 生成/provider/批量/内容包；首站 8–10 页；E3 推荐策略。
- v0.5 首站定为 Router.Homes（router.homes）OpenWrt 中文文档；域名未绑定，Phase 0–4 只做本地/预览。
- v0.5 再经 Codex 只读复审；发现 10 条 P0/P1（solo 批准不可实现、域名状态死锁、preview canonical 冲突、CI 可信边界、刷机通用化、版本口径过宽、Wi-Fi/隔离负向测试、证据哈希、工期、合规责任）；v0.6 已纳入。
- v0.6 未执行代码/构建验证；Phase 0 用两站竖切与两篇样稿验证假设。
