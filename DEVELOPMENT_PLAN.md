# 文档站群开发方案（v0.5 · OpenWrt 首站版）

> 状态：方向与范围已确认；首站定为 **Router.Homes（https://router.homes）**，内容为 **OpenWrt 中文文档**；域名尚未绑定，Phase 0–4 先本地构建 + Pages 预览，Phase 5 绑定后再做生产验收。
> 参考：`~/centosfan`（生产多站系统）、`starlight-multi-site`（原型，不采用）、`astro-fleet`（monorepo 工程参考，非 Starlight）。
> 变更摘要：**DeepSeek Harness 外部写作；v1 不做内容包；首站 8–10 页 OpenWrt 文档；E3 按“规格 E1 / 步骤 E2 / 实测 E3”执行；域名未绑定，生产部署门禁到绑定后再开。**

---

## 0. 已确认决策

| ID | 决策 | 选择 |
|---|---|---|
| ADR-001 | 架构 | Monorepo，每站独立 Astro/Starlight 项目 |
| ADR-002 | 内容模型 | 每站独立内容；v1 不做跨站内容包 |
| ADR-003 | 站点差异 | 结构差异：每站独立 sidebar/首页/栏目 |
| ADR-004 | 部署 | Cloudflare Pages 每站一项目 + Actions 直传 |
| ADR-005 | 规模 | 首发 3–5 站，12 个月 10–20 站 |
| ADR-006 | 内容生产 | DeepSeek Harness 外部产出 + 人工审核 + 严格门禁，**不做自动化 AI 生成流水线** |
| ADR-007 | 首站内容 | **Router.Homes（router.homes）OpenWrt 中文文档**，直接 8–10 页，走完整生产内容 canary |
| ADR-008 | 证据策略 | 规格 E1；可复现步骤 E2；吞吐/覆盖/“我们实测” E3；首站至少 2–3 页有 E3 |
| ADR-009 | 跨站分发 | v1 不做；出现真实复用页后再评估 v1.1 |
| ADR-010 | 域名状态 | `router.homes` **尚未绑定**；Phase 0–4 只做本地构建与 Pages 预览，生产部署在绑定并验收后开启 |

**Codex review 处置**：v0.2 的 10 条 P0/P1 仍保留（审核绑定、MDX/执行安全、claims/evidence、CI、隔离边界、页面级索引、dedup 校准、canary、部署回滚、门禁/工期）。v0.4 只移除“provider 适配、自动批量生成、provider 预算、内容包”相关工程，不降低审核与发布门禁。

---

## 1. 目标与非目标

### 1.1 目标

1. 首发 3–5 站，设计容量 20（硬上限 50）；每站独立域名、内容、sidebar/首页、品牌。
2. 单站可独立开发、构建、预览、部署；单站故障不阻塞其他站。
3. 一条命令构建全部；一条命令构建指定站；CI 只构建受影响站点，但跨站检查全库运行。
4. 内容由 DeepSeek Harness 在仓库外生成，进入 `content/drafts/` 后走统一的检查、评审、promote。
5. 首站 `router.homes`（Router.Homes）写 8–10 页 OpenWrt 中文文档，全部人工审核；域名暂未绑定，先预览验证，绑定后再做生产 canary 并观察 2–4 周。
6. 每站门禁可测量：schema、claims/evidence、revision 绑定、dedup、独立性、链接、sitemap、canonical、产物。
7. 生产可运维：部署可追溯、可回滚；每站独立 Pages 项目；密钥最小权限。

### 1.2 非目标（v1 不做）

- 仓库内调用模型 API、自动批量生成、provider 适配/切换。
- 跨站内容包 `add/sync/check/prune`；v1 每站独立写。
- `mirror`、`localized`、多语言、文档版本化。
- CMS、跨站统一搜索。
- 无人值守的自动发布。
- 50 站编排、自动账号拆分、VPS 替代部署。

---

## 2. 架构

### 2.1 选型与隔离边界

选 **Monorepo，每站独立 Astro/Starlight 项目**。内容、路由、产物、部署、回滚独立；依赖版本（catalog + 单 lockfile）、docs-kit、CI 工作流、共享门禁仍耦合。

因此：

- 共享依赖升级默认触发**全站验证**，生产部署可分批。
- 不要把“单站发布”说成“单站升级完全不影响别人”。
- centosfan 的单项目多载体不混入本仓库；若未来出现“同一知识网络、70% 共享”的站群，单独建 B 仓。

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
│  ├─ briefs/<site>/<slug>.yaml    # 写作前的查询/意图/大纲/来源计划
│  ├─ drafts/<site>/<slug>.mdx     # DeepSeek Harness 产出或手写草稿
│  ├─ drafts/<site>/<slug>.claims.json
│  ├─ evidence/<site>/<slug>/      # 证据清单、哈希、截图/日志
│  ├─ reviews/<site>/<slug>.md     # 审计记录（不是发布授权）
│  ├─ query-registry.json          # 查询→primary 页面归属
│  └─ policies/                    # 来源白名单、证据等级、审核清单
├─ sites/
│  └─ router-homes/
│     ├─ astro.config.ts
│     ├─ site.meta.ts
│     ├─ package.json
│     ├─ src/content.config.ts     # docsSchema({ extend })
│     ├─ src/content/docs/
│     ├─ src/styles/theme.css
│     └─ public/
├─ scripts/
│  ├─ fleet.ts                     # CLI 入口：content / deploy / validate
│  ├─ new-site.ts
│  ├─ validate.ts
│  ├─ content/{import,check,review,promote}.ts
│  ├─ deploy.ts
│  ├─ stamp.ts
│  ├─ ci-matrix.ts
│  └─ checks/{claims,mdx,security,dedup,independence,links,smoke,canonical,global,site,review}.ts
├─ ops/deployments.json            # 每站已部署 revision/deploymentId
├─ templates/site/
└─ .github/workflows/{ci,deploy}.yml
```

**注册表用 JSON**：`new-site` 直接追加，不需要 AST 改写；类型由 `packages/docs-kit/src/registry.ts` 的 zod schema 推导。

### 2.3 字段唯一来源

| 字段 | 唯一来源 |
|---|---|
| id、domain、title、description、locale | `fleet.config.json` |
| deploy.enabled、deploy.project、minPages | `fleet.config.json` |
| audience、angle、primaryTopics | `fleet.config.json` |
| sidebar、首页、栏目、主题、插件 | `sites/<id>/site.meta.ts` |
| 正文、frontmatter、claims | `sites/<id>/src/content/docs/` |

`site.meta.ts` 通过 `getSite(id)` 读注册表，不复制 title/domain。

首站注册表示例：

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
  "deploy": {
    "enabled": false,
    "project": "router-homes",
    "domainStatus": "unbound"
  }
}
```

`deploy.enabled=false` 直到域名绑定并验收；Phase 0–4 只允许 preview 分支部署。

### 2.4 docs-kit、schema 与构建

- `docs-kit` 用 `tsc` 构建到 `dist/`；站点 `astro.config.ts` 导入构建产物。
- 站点用 `astro.config.ts`，让 Astro 配置加载器处理 `site.meta.ts`。
- 每站显式依赖 `@fleet/docs-kit: workspace:*`，不要只用相对路径 import。
- 自定义 frontmatter 通过 `docsSchema({ extend: ... })` 接入。
- v1 不重写 Starlight 的 Header/Breadcrumbs/SEOHead；先保留原生能力。
- Sitemap：先确认 Starlight 内置行为，再决定是否额外注册 `@astrojs/sitemap`。
- Turbo：`build` 声明 `dependsOn: ["^build"]`、`outputs: ["dist/**"]`；deploy/在线来源检查 `cache:false`；stamp 在缓存恢复后执行，绑定输入摘要与产物 digest。

---

## 3. 内容系统

### 3.1 写作流程（DeepSeek Harness 外部产出）

1. **Brief**：在 `content/briefs/<site>/<slug>.yaml` 写清目标查询、意图、读者、uniqueAngle、大纲、来源、内链。
2. **Draft**：在 DeepSeek Harness 中生成，保存到 `content/drafts/<site>/<slug>.mdx`；同目录放 `claims.json`。
3. **Import**：`pnpm fleet content import --site router-homes --slug <slug> --file <path>` 规范 frontmatter、检查编码/路径、生成 claims 模板。
4. **Check → Review → Promote**：见 §3.4、§3.5。

仓库不调用模型 API，不保存 provider key，不做自动批量生成。生成工具在仓库外，产出视为不可信输入。

### 3.2 每站独立内容

- `sites/<id>/src/content/docs/**` 是唯一正文来源。
- 每站独立 sidebar/首页/栏目，`site.meta.ts` 显式声明。
- 写作规范 `docs/writing-guide.md`；站内相对链接，跨站绝对 URL。
- 手写页面同样需要 review 与 `contentRevision`。
- **v1 不做跨站内容包**；没有真实复用页之前，不引入分发、锁文件、canonical 例外。

### 3.3 Claims / evidence 契约

**Claim**：

```json
{
  "id": "c1",
  "bodyLocator": "h2:关键差异/p:2",
  "claimType": "spec|test|price|compatibility|policy",
  "text": "Wi-Fi 7 的 6 GHz 信道支持 320 MHz 频宽",
  "product": "Wi-Fi 7",
  "version": "802.11be",
  "region": "global",
  "observedAt": "2026-10-01",
  "validUntil": "2027-04-01",
  "evidenceIds": ["e1"],
  "verificationStatus": "machine_checked|human_verified|rejected",
  "verifiedBy": "human:<id>"
}
```

**Evidence**：

```json
{
  "id": "e1",
  "sourceUrl": "https://example.org/spec",
  "finalUrl": "https://example.org/spec",
  "publisher": "IEEE",
  "retrievedAt": "2026-10-01",
  "locator": "Table 3",
  "excerpt": "...",
  "contentHash": "sha256:...",
  "testEnvironment": null,
  "testRecipe": null,
  "rights": "quote-only|public-domain|licensed",
  "access": "public|licensed"
}
```

**证据适配**（ADR-008）：

| 内容 | 最低证据 | 说明 |
|---|---|---|
| 规格、标准、协议 | E1 | 官方文档/标准文本 |
| 配置步骤、命令 | E1 + E2 | E2 = VM/模拟器/固定测试配方可重放；路由 Web UI 用截图 + 固件版本 + 日期 |
| 吞吐、覆盖、稳定性、“我们实测” | **E3** | 真实设备/真实网络；无 E3 就写“厂商标称/未实测”，不能用第一人称实测口吻 |
| 价格、库存 | E1 + 日期 | 7 天新鲜度 |
| 版本/兼容性 | E1 | 30 天新鲜度 |
| 稳定标准/长期政策 | E1 | 180 天新鲜度 |

`router.homes` 首站建议：至少 2–3 页有 E3（刷机与恢复、Wi-Fi 吞吐/覆盖、VLAN/PPPoE 之一），其余用 E1/E2；没有实测设备的页面明确标 `tested: false`，避免“我们测试了”的表述。

**OpenWrt 版本口径**：OpenWrt 25.12+ 使用 `apk`，24.10 使用 `opkg`；同一命令页必须标注适用版本，不能混写。E2 优先用 OpenWrt x86 VM（可重放 `apk/opkg`、LuCI、fw4 操作）；真实路由 Web UI 用截图 + 固件版本 + 日期。E3 只用于真实设备上的刷机/启动、Wi-Fi 吞吐/覆盖、VLAN/PPPoE 等结论。刷机页必须包含设备兼容性、精确镜像、校验和、恢复方式（TFTP/failsafe）与断电风险；没有真实设备就标注“未实测”，不能写“我们已刷机验证”。

**规则**：

- `verificationStatus` 由工具/人工写入，模型不能自填 `human_verified`。
- 站点 frontmatter 通过 `docsSchema({ extend })` 增加 `tested`、`evidenceLevel`、`claims`、`reviewedRevision` 等字段；不能直接写未注册字段。
- 正文 claim 标记与 claims 双向校验：悬空/未使用均报错；自动断言识别只做提示，事实支持由人确认。
- `highRisk=true`（医疗/金融/法律）v1 阻断生成与发布；以后开放必须先有第二评审人。
- “可重放”= 输入、参数、环境、原始输出可追溯，不承诺同输入同文本。

### 3.4 contentRevision 与可信审核

**contentRevision**：

```text
SHA256(canonicalJson({
  briefHash,
  pageHash,              // frontmatter + body
  claimsHash,
  evidence: [{ id, contentHash }],
  assets: [{ path, hash }]
}))
```

生命周期/部署字段不参与哈希。

**Review 绑定** `siteId + pageId + contentRevision + policyVersion`。review 文件只是审计记录，不能自行授予发布权。发布批准来自：

- 受保护 PR 上的 review（solo 模式下允许本人 review，但必须留下 checklist + 时间 + revision）；
- 修改 brief/draft/claims/evidence/asset 后自动撤销批准；
- CI 校验站点正文 revision 与被批准 revision 一致；
- 生成模型不能签 review；`highRisk` 需要第二人，否则阻断。

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
| reviewed | 受保护 PR 批准；revision 匹配 |
| ready | promote 到站点内容；构建/门禁通过 |
| deployed | 部署成功；写入 `ops/deployments.json` |
| refreshed / retired | 新 revision 替换 / 下线并登记 404/301 |

**反例验收**：伪造 reviewer、改 claims、改线上正文、改图片、直接新增未登记页面 → 都不能上线；review 后改一个标点 → review 失效。

### 3.5 MDX 与内容安全

- 默认 `.md`；需要 MDX 时只允许固定组件/属性（`Aside`、`Card` 等），拒绝任意 `import/export`、表达式、`<script>`、事件处理器、危险 URL。
- `check-mdx.ts` 用 AST 检查，不靠正则。
- DeepSeek Harness 的提示词/来源视为不可信输入；不把仓库、其他站点内容、密钥上传给外部工具。
- 来源抓取：仅 HTTPS；逐跳检查重定向与解析地址；拒绝 localhost、RFC1918、链路本地、云元数据；限制大小/超时/MIME（SSRF 防护）。
- 构建产物扫描：`_worker.js`、Functions 目录、异常脚本、意外公开文件。
- `.github/workflows/**`、`scripts/**`、`pnpm-lock.yaml`、`packages/docs-kit/**`、`fleet.config.json`、`content/policies/**` 用 CODEOWNERS 保护；生产部署只消费可信 main workflow 的 artifact。
- 禁止带 secrets 的 `pull_request_target` 执行 PR 代码。

### 3.6 页面级索引策略与 SEO/AEO

v1 只支持 `primary`，删除站级 `mode`，改为页面级 `indexPolicy`：

| 页面类型 | canonical | robots | sitemap |
|---|---|---|---|
| 原创、可索引 | 自引用 | index | 收录 |
| 明确不参与搜索 | 按既定策略 | noindex | 排除 |
| 重复副本/翻译（v1.1+） | 指向 primary/同语言页 | index | 排除/含 hreflang |

- canonical 与 noindex 是不同用途；不能把 noindex 当 canonical 的强化开关。
- 校验**渲染后 HTML**：canonical 恰好一个、robots 有效、`lang` 正确；sitemap/Pagefind/llms.txt 无草稿。
- canonical 目标必须是正确页面、200、可索引，无链、无环；不能只检查域名在注册表。
- 查询注册表以 `语言 + 地区 + 用户任务/意图 + 查询簇` 为键，分配 primary **页面**。
- `llms.txt`、FAQ schema 是增强项，不作为收录/AI 引用门禁；answer-first 是编辑规范，不强制所有 H2 写成问题。

### 3.7 去重与站点独立性

**算法**：中文用字符 5-gram；英文用词 5-gram；正文去导航/页脚/模板；代码块与引用单独比较；记录 `algorithmVersion`。

| 情况 | 处理 |
|---|---|
| 规范化正文哈希完全相同 | 未登记复用 → 直接阻断 |
| Jaccard ≥ 0.30 | 人工复核，不强制“改写” |
| containment ≥ 0.80 | 人工复核（短文被长文整体包含） |
| 正文 < 300 字符 | 人工判断 |
| 已批准复用（v1.1） | 按路径 + revision + 目标站 + 索引策略登记，不能整站豁免 |

- 用至少 50 对已标注页面校准误报/漏报，再决定是否收紧。
- `unique ratio = 某页独有 shingle 数 / 该页 shingle 总数`；站级统计公开聚合方式，**0.8 只作观察线**。
- 新站启动必须有人工确认的独立用户任务、维护负责人、实际资料增量；换品牌/sidebar/措辞不算。
- 多域名同质化属于 scaled content / doorway 高风险；低文本相似度不能排除风险。

### 3.8 首站 8–10 页内容 canary

**首站建议查询簇**（可调整）：

1. OpenWrt 是什么、适合谁、版本选择（24.10 `opkg` vs 25.12+ `apk`）
2. 设备兼容性与刷机前检查（Table of Hardware、闪存/内存、恢复方式）
3. 刷入 OpenWrt：factory/sysupgrade、镜像校验、TFTP/failsafe 恢复
4. 首次登录与上网：LuCI/SSH、WAN/LAN、PPPoE/DHCP、DNS
5. Wi-Fi 配置：信道/频宽/加密/漫游/802.11s
6. 软件包管理：`apk`/`opkg`、软件源、依赖与空间
7. 防火墙与端口转发：fw4/nftables、zone、DNAT
8. VLAN 与访客/IoT 隔离：DSA、bridge-vlan
9. 备份、升级与回滚：`sysupgrade -b`、keep settings、failsafe
10. 常见故障排查：无法上网、LuCI 打不开、DNS、bootloop

建议 E3 页：第 3 页（真实设备刷机/恢复）、第 5 页（Wi-Fi 吞吐/覆盖）、第 8 页（VLAN/PPPoE 真实链路）。其余用 E1/E2；版本相关命令必须同时给出 24.10 与 25.12+ 的写法或明确适用范围。

**流程**：

- 首站直接写 8–10 页，不做 1→3→5 页数爬坡；先写第 1–4 页做一次评审校准，再补齐。
- 技术 canary：本地构建 + Pages preview，验证审核、构建、链接、SEO、回滚；preview 默认 noindex，不观察收录。
- **域名未绑定期间不做生产 canary**；Phase 5 完成 DNS/Custom Domain/TLS 后，再发布 8–10 页并观察 2–4 周。
- 审阅批次控制在 3–5 页，避免疲劳；待审 >10 页暂停新稿。
- 不设“4 周必须有曝光”的 KPI；GSC 只用于诊断索引/抓取原因。

**扩站条件**：

- 技术：关键页 200、canonical 正确、无意外 noindex、sitemap 有效、无草稿泄漏、回滚演练通过。
- 内容：100% 人工审核；事实/合规事故为 0；重复复核完成。
- 搜索：GSC 已验证、sitemap 已提交、抓取/索引原因可查。

### 3.9 发布与监控

- `content promote` 写入站点内容并更新 revision；只有 `reviewed` 可 promote。
- 构建 → 门禁 → stamp → artifact → deploy → 线上 smoke；成功后才写 `deployed`。
- **域名未绑定期间**：只部署 preview 分支，确认 preview 为 noindex、canonical 指向 `https://router.homes`、sitemap 不提交；不创建 GSC 生产属性。
- **绑定后**：验证 Custom Domain/TLS/apex-www、GSC、sitemap、生产 smoke；再做 2–4 周内容 canary。
- 发布后 4 周看 GSC；无曝光只生成人工 `refresh` 任务，不自动改写/下线。
- 每月轻审计（重复/过期/断链），每季度深审计（版本/合规/内容组合）。

---

## 4. 构建、CI 与部署

### 4.1 工具链

- Node 24.x（Astro 7 要求 `>=22.22`）。
- pnpm workspace + catalog；`packageManager` 固定 pnpm 版本。
- Astro 7.x + Starlight 0.42.x。
- Turbo 2.x；TypeScript + zod；`@astrojs/mdx`（按需）。
- 脚本统一用 `tsx` 运行；根 `package.json` 定义 `"fleet": "tsx scripts/fleet.ts"`，CI 用 `pnpm exec tsx ...`。不要依赖 Node 原生 TS 类型剥离处理复杂语法。

```yaml
# pnpm-workspace.yaml
packages:
  - 'sites/*'
  - 'packages/*'
catalog:
  astro: ^7.4.1
  '@astrojs/starlight': ^0.42.6
```

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
        run: node scripts/ci-matrix.ts --event "$GITHUB_EVENT_NAME" --base "$BASE" --head "$GITHUB_SHA"
  policy:
    needs: plan
    steps:
      - uses: actions/checkout@v4
      - run: corepack enable && pnpm install --frozen-lockfile
      - run: node scripts/checks/global.ts   # dedup、查询归属、registry、review revision
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
      - run: node scripts/checks/site.ts --site ${{ matrix.site }}
      - run: node scripts/stamp.ts --site ${{ matrix.site }}
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
      - run: corepack enable && pnpm install --frozen-lockfile
      - uses: actions/download-artifact@v4
        with: { name: dist-${{ matrix.site }} }
      - run: pnpm fleet deploy --site ${{ matrix.site }}
```

- `ci-matrix.ts`：PR 用 `git merge-base origin/main HEAD`；push 用 `event.before → github.sha`；无有效 base、首次运行、检测失败 → 全量。处理删除/重命名/空矩阵。
- 影响规则：单站正文 → 构建该站 + **全库跨站检查**；docs-kit → 所有依赖站；registry/门禁脚本/共享配置/lockfile → 明确规则扩展，无法判断则全量。
- `policy` 全局跑 dedup、查询归属、registry、review revision，不随单站 build 跳过。
- `deploy` 用 `if: always()` + 每站 artifact 存在性检查；某站 build 失败只阻塞该站。
- 失败站即使下次没有内容变化，也必须能补部署；`ops/deployments.json` 对账目标/已部署 revision。
- 生产顺序：内容批准/证据/去重 → build → HTML/链接/SEO 校验 → stamp → artifact → deploy → 线上 smoke。

### 4.3 构建策略与 SLO

- 3–5 站：逐站矩阵，`max-parallel: 2–3`，缓存 pnpm store。
- 10–20 站：先维持逐站矩阵；有瓶颈再按 4–5 站分片，不直接改成一个大 build job。
- 部署超过 5 站时，避免矩阵重复 `pnpm install`：用单个 deploy job 循环 + 每站结果记录，或只含 `wrangler` 的轻量镜像。
- nightly 全量检查，发现变更检测遗漏。
- Phase 0 记录冷/热构建、RSS、artifact 大小、上传耗时。
- 初始 SLO：单站变更反馈 p95 ≤10 分钟；20 站全量 ≤30 分钟；超标再优化。

### 4.4 部署与回滚

- Cloudflare Pages，每站一项目；direct upload。
- `deploy.enabled=false` 可构建不部署。
- `domainStatus=unbound` 时，`deploy.ts` 只允许 preview 分支部署；生产部署直接非零退出。绑定并验收后把 `enabled` 改为 true。
- stamp：`site、commit、inputDigest、policyVersion、artifactDigest、runId、mode、builtAt`。
- 部署前校验 site/commit/mode；缺 `index.html`、candidate/rehearsal、digest 不匹配 → 拒绝。
- 记录 deployment ID；未绑定时验证 `*.pages.dev` 预览的 stamp + noindex；绑定后验证自定义域名上的 stamp。
- **Pages 配额**：Free 每月 500 次构建、1 个同时构建；100 个项目/账号；每站 20,000 文件、单文件 25 MiB。direct upload 不消耗构建次数，但仍受文件/大小/API 限流约束。
- 回滚：优先回滚已有成功 production deployment；不要用 `wrangler pages deployment` 当完整回滚命令。使用已核验 API：
  ```text
  POST /accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/rollback
  ```
  或 Pages 控制台；preview 不能作为回滚目标。
- artifact 保留最近 5 个成功生产版本或 30 天；回滚不重跑内容生成。
- 部署前检查是否已被较新发布取代；生产部署中途不随意取消。
- canary 失败停止扩散；非 canary 单站失败只停该站并记录补部署。
- 纯静态 `_redirects` 不支持任意 410：无替代页返回真实 404；确需 410 再引入 Function/Worker；不要把下线页全 301 到首页。

---

## 5. 质量门禁

| 门禁 | 内容 | 阶段 | 处理 |
|---|---|---|---|
| G0a | brief schema、站点/查询登记、slug/路径 | 写作前 | 硬阻断 |
| G0b | draft/claims/evidence schema、结构 | import 后 | 硬阻断 |
| G1 | 来源绑定、证据类型适配、时效、`highRisk` | sourced | 硬阻断 |
| G2 | 可信 review + `contentRevision` 匹配 | ready 前 | 硬阻断 |
| G3 | 精确复制阻断；近似重复人工复核 | 发布前 | 硬阻断/复核 |
| G4 | 独立定位、查询归属人工批准；0.8 观察 | 发布前 | 人工 |
| G5 | build、链接/资源/锚点、孤立页、sitemap、canonical、渲染 HTML | 部署前 | 硬阻断 |
| G6 | 安全 headers、关键重定向；Lighthouse 后置 | 生产前/周期性 | 硬阻断/告警 |
| G7 | 产物 stamp、digest、site/commit/mode | 部署前 | 硬阻断 |
| G8 | 索引/曝光采集、负责人、刷新队列 | 发布后 | 运营 |

**v1 保留**：C1–C10 中，C2 的“首段 2–3 句”降为编辑建议；C8 的“3–8 条内链”改建议；C9 独立为 secret/PII 扫描 + 人工权利审核；C7 的 0.8 只作观察。

**阈值**：

- `minPages` 是上线内容计划，不是质量分；首站 8–10 页。
- 精确复制 = 0；近似重复 ≥0.30 必须复核并记录结论。
- 死链 = 0；外链超时先重试并人工核实，不因来源站临时故障硬阻断。
- sitemap 只含本站 URL；canonical 自引用（v1）。
- 渲染后 HTML 检查，不只查 frontmatter。

---

## 6. 工作分解

**工程 15–21 人日**（不含正式内容制作与评审）。

| 范围 | 人日 |
|---|---:|
| 两站竖切、模板、registry、docs-kit | 3–4 |
| 内容 draft/import/check/review/promote + revision 绑定 | 3–4 |
| CI/CD、artifact、安全与回滚 | 4–5 |
| 内容/SEO/安全门禁及故障场景验证 | 4–6 |
| 上线运营、监控、文档及缓冲 | 1–2 |
| **合计** | **15–21** |

### Phase 0：竖切与决策（1–2 天）

- 两站（`router-homes` + 一个）跑通 registry/docs-kit/构建/预览。
- 域名未绑定：用本地 `pnpm build` + `wrangler pages dev` 或 Pages preview 验证；不配置 Custom Domain。
- 实测冷/热构建、预览、内容隔离。
- 确认 OpenWrt 8–10 页清单、版本口径（25.12+ 主、24.10 差异）、E3 设备型号、评审人。
- 产出 `docs/adr/0001-architecture.md`、`0002-content-review.md`、`0003-openwrt-version-policy.md`。

**验收**：两站独立 dist；互不含对方页面；单站 dev 正常；preview 可访问且 noindex。

### Phase 1：骨架（3–4 天）

- pnpm/Turbo/catalog、`fleet.config.json` + zod、`new-site`、`docs-kit`、`site.meta`、`templates/site`。
- 2 套主题、共享 Header/Footer/SEOHead/Compliance（先不覆盖 Starlight 原生）。
- `validate`、`build`、`dev --filter`。

**验收**：`new-site` 生成可运行站；重复域名/缺目录被拦截；两站构建通过；docs-kit 升级触发依赖站。

### Phase 2：内容 QA 流水线（3–4 天）

- brief/claims/evidence schema；`content import/check/review/promote`。
- `contentRevision`；受保护 PR review 绑定；solo review 模式（checklist + 时间 + revision）。
- 首站 3–4 页走完 drafted→sourced→reviewed→ready。

**验收**：伪造 reviewer/改 claims/改正文/改图片均不能上线；review 后改标点失效；无来源页被拒；MDX 恶意样例被拒。

### Phase 3：CI/CD 与部署（4–5 天）

- `ci-matrix`（merge-base/事件范围/空矩阵/删除重命名）、全局 policy、按站 build/deploy、artifact、stamp、回滚。
- `ops/deployments.json` 对账。

**验收**：只改一站只构建/部署该站；改 docs-kit 触发依赖站；某站失败不阻塞其他站；错误 digest/commit 被拒；回滚演练成功。

### Phase 4：SEO/质量/安全（4–6 天）

- `indexPolicy`、canonical 渲染校验、sitemap/robots、dedup、independence、MDX/SSRF/secret 扫描、链接/孤立页。
- 50 对样本校准 dedup；首站监控、GSC、备份。

**验收**：跨站复制被阻断/复核；canonical 链/环被发现；MDX/SSRF 样例被拒；首站 sitemap 正确。

### Phase 5：首站 8–10 页上线（编辑 + 日历）

- 首站 8–10 页 OpenWrt 文档；先第 1–4 页校准评审，再补齐。
- **先绑定域名**：DNS、Pages Custom Domain、TLS、apex/www、GSC 验证、sitemap 提交。
- 生产内容 canary：正式域名发布，观察 2–4 周。
- 技术硬条件 + 内容硬条件全过后，再开第二站（目标 3–5 站）。

**验收**：8–10 页全部人工审核；技术/内容硬条件全过；GSC 可查；回滚可用；无 dedup 阻断。

### Phase 6：扩到 10–20 站（1–2 周工程 + 持续内容）

- CI 分片（按实测）、nightly 全量、监控、审计、站点生命周期。
- 每站 owner、复核日、下线/301 流程。

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 外部 AI 幻觉/无来源断言 | 信任与 SEO 受损 | claims/evidence；人工 review；E0 拒绝 |
| 多站同质化/doorway | 不收录、拖累主站 | 精确复制阻断；近似重复复核；一查询一 primary 页面；canary |
| 审核被绕过/伪造 | 未审核内容上线 | contentRevision + 受保护 PR + CI 校验 + 反例测试 |
| solo review 独立性不足 | 质量盲区 | 强制 checklist + 时间 + revision；高风险主题第二人或阻断 |
| MDX/内容执行代码 | 供应链/服务器风险 | 默认 `.md`；MDX AST 白名单；部署权限隔离 |
| SSRF/来源抓取 | 内网探测 | HTTPS、重定向/解析检查、私网/元数据阻断、大小/超时限制 |
| 缓存污染/旧 stamp | 错误产物上线 | `cache:false`；stamp 绑定 inputDigest/artifactDigest；部署前校验 |
| 旧部署覆盖新版本 | 回退 | 部署 ID/目标 revision 对账；生产部署不随意取消 |
| 评审瓶颈 | 发布停滞 | 每批 3–5 页；待审 >10 页暂停新稿 |
| 来源版权/引用 | 法律风险 | 权利字段；短引用；不复制全文；不上传他人内容到外部工具 |
| Pages 配额/文件限制 | 部署失败 | 20k 文件/25 MiB 检查；接近 100 项目转 VPS/分账号 |
| 域名/DNS/TLS | 上线延迟 | 上线验收表；负责人；证书/重定向检查 |
| Astro/Starlight 升级 | 全站回归 | catalog 锁版本；staging canary；分批部署 |

---

## 8. 运营与上线验收

| 项目 | 验收 | 负责人 |
|---|---|---|
| DNS/TLS | **目前未绑定**；Phase 5 绑定：注册商/续费、apex/www、CNAME→Pages、Custom Domain、TLS、CAA、GSC 验证 | operator |
| GSC | 绑定后每域 Domain Property、DNS 验证、sitemap 提交时间、账号恢复路径；绑定前不创建生产属性 | operator |
| 分析 | 每站独立 ID；排除 preview/内网；事件不带 PII | operator |
| 编辑透明度 | 关于、纠错政策、联系、隐私页；商业关系披露 | editor |
| URL 生命周期 | 稳定 pageId；旧→新登记；无链无环；无替代内容 404 | operator |
| 备份 | Git 外保存证据/审核记录/媒体权利/生产 artifact/域名部署映射；定期恢复演练 | operator |
| 监控 | 每 5 分钟首页 + 1 关键页；连续 3 次失败告警；每日证书/索引指令检查 | operator |
| 内容维护 | 每页 owner、下次复核日；按过期风险刷新 | editor |

- 月度轻审计、季度深审计。
- SLO 见 §4.3；生产部署成功率、回滚次数纳入月度复盘。
- 内容生产成本按**编辑人时**记录，不引入模型 API 预算。

---

## 9. 延后项与下一步

### 9.1 明确延后

1. 跨站内容包 `add/sync/check/prune`（出现真实复用页后再评估 v1.1）。
2. `mirror`/`localized`、hreflang（v1 只 primary）。
3. 仓库内 AI 生成/provider 适配/自动批量（v1 由 DeepSeek Harness 外部生产）。
4. embedding 去重、复杂独立性评分（v1 精确哈希 + 5-gram + containment + 人工）。
5. 50 站编排、自动账号拆分、VPS 替代部署。
6. 大范围 Starlight 组件覆盖、第二套主题、Lighthouse 硬阈值。
7. 按曝光自动刷新/下线。

### 9.2 仍需在 Phase 0 确认

1. OpenWrt 8–10 页最终清单（建议见 §3.8）；是否 10 页全做，还是先 8 页。
2. 版本口径：以 25.12+（`apk`）为主、24.10（`opkg`）只做差异段，还是两者各写一套。
3. 评审人：solo review 还是第二人；高风险主题（刷机/安全）如何处理。
4. E3 设备：手上有哪些可刷 OpenWrt 的路由器/软路由；刷机、Wi-Fi 吞吐、VLAN/PPPoE 各由哪台设备验证。
5. 域名：注册商/DNS 控制权是否在手；预计何时绑定；Pages 项目是否已创建。

### 9.3 下一步

1. Phase 0：两站竖切 + 构建/预览实测。
2. 确认 §9.2 四项。
3. 进入 Phase 1；Phase 2 前写 `docs/adr/0002-content-review.md`，把 revision/review/部署状态机定死。

---

## 10. 评审记录

- v0.2 经 Codex CLI 只读评审（`codex exec -s read-only`）；10 条 P0/P1 已纳入 v0.3。
- v0.4 根据最新决策收敛：移除自动 AI 生成/provider/批量/内容包；首站直接 8–10 页；E3 采用推荐策略。审核绑定、MDX 安全、CI、页面级索引、dedup、部署回滚等 P0/P1 保留。
- v0.5 首站定为 Router.Homes（router.homes）OpenWrt 中文文档；域名未绑定，Phase 0–4 只做本地/预览，Phase 5 绑定后再做生产 canary；补充 OpenWrt 25.12+ `apk` / 24.10 `opkg` 版本口径与 E3 设备建议。
- v0.5 待 Codex 复审；复审结论与修订将写入 v0.6。
- v0.4 未执行代码/构建验证；Phase 0 的首要任务是用两站竖切验证假设。
