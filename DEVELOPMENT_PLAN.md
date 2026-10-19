# 文档站群开发方案（v0.3 · Codex review 修订版）

> 状态：6 项方向已确认；Codex review 已完成并纳入修订。本版为执行方案，下一步是 Phase 0 竖切。
> 评审对象：v0.2（commit `00f960f`）。评审方式：Codex CLI `exec -s read-only`（`review` 子命令不允许自定义提示词），只读、未改文件。
> 评审结论：**保留 monorepo + 每站独立 Astro 项目的方向**；v0.2 的主要问题是审核与产物缺少可信绑定、门禁未完整接入 CI、canary 条件矛盾、把未校准的内容指标当成了发布保证。
> 已确认方向：Monorepo｜每站独立内容 + 最小内容分发｜结构差异｜Cloudflare Pages 每站一项目 + Actions 直传｜1→3→5 首发、12 个月 10–20 站｜AI 草稿 + 强制人工审核 + centosfan 式 dedup/独立性门禁。

---

## 0. Codex review 处置

| # | 级别 | 评审问题 | 处置 | 落点 |
|---|---|---|---|---|
| 1 | P0 | 人工审核可伪造，状态机未绑定实际发布内容 | 采纳：`contentRevision` + 受保护 PR review + 部署事实分离 | §3.4 |
| 2 | P0 | 提示注入只停留在提示词层；MDX/命令执行有风险 | 采纳：默认 `.md`、MDX 白名单、生成/部署权限隔离、SSRF 防护、产物扫描 | §3.5 |
| 3 | P1 | claims/evidence 无法证明“来源支持结论” | 采纳：字段扩充、证据适配矩阵、按类型新鲜度、双向 claim 校验 | §3.3 |
| 4 | P0 | CI 示例没有完整门禁；变更检测/故障隔离不成立 | 采纳：修正 matrix、merge-base、全局检查、按站故障隔离、revision 对账 | §4.2 |
| 5 | P1 | 架构隔离承诺过强；catalog/docs-kit/缓存仍耦合 | 采纳：收窄隔离声明；依赖升级全站验证；`cache:false`；stamp 绑定输入/产物 | §2.1、§2.4 |
| 6 | P1 | canonical/mirror/localized 应按页面建模 | 采纳：页面级 `indexPolicy`；v1 只允许 primary | §3.6 |
| 7 | P1 | Jaccard 0.30 / unique ratio 0.8 不能直接当硬标准 | 采纳：精确复制硬阻断；近似重复转人工；阈值先校准；0.8 只作观察线 | §3.7 |
| 8 | P1 | canary、预算、扩站条件没有闭环 | 采纳：技术 canary / 生产内容 canary 分离；1→3→5；集中账本与预算 | §3.8 |
| 9 | P1 | 部署、回滚、Pages 限制有误 | 采纳：更正配额；部署 ID/回滚 API/产物保留/404-410 路径 | §4.4 |
| 10 | P1 | 门禁分级与工期不现实 | 采纳：硬阻断/人工复核/运营指标三分；工期改为 19–27 人日 | §5、§6 |
| P2 | — | 运维清单、构建策略、provider/成本、SEO 测量边界 | 纳入 §4.3、§4.5、§8 | — |

**本版关键变化**

1. 审核不再由 `review` 文件自证；改为 `contentRevision` + 受保护 PR 批准 + CI 校验线上正文与被批准 revision 一致。
2. 内容状态与部署事实分离：`planned → drafted → sourced → reviewed → ready`；部署另记 `deploymentId/revision/deployedAt/smokeResult`。
3. AI 生成默认输出 `.md`；MDX 仅允许固定组件/属性；生成 job 不持有部署密钥；E2 只跑人工批准的测试配方。
4. claims/evidence 增加定位、版本、地区、时效、证据哈希、权利信息；`verified` 不能由模型填写。
5. CI 增加 merge-base/事件范围、全局跨站检查、按站故障隔离、目标 revision 与已部署 revision 对账。
6. 索引策略改为页面级；v1 明确只接受 `primary`，mirror/localized 延后。
7. 去重：规范化哈希完全相同直接阻断；Jaccard ≥0.30 与 containment ≥0.80 转人工复核；50 对标注样本校准后再收紧。
8. 首发改为 1→3→5；技术 canary 用 preview，生产内容 canary 用正式域名。
9. Pages 免费配额更正；回滚优先用已有 production deployment 的 rollback API。
10. 工期从 10–12 人日修正为 **19–27 工程人日**，另计编辑人时与 2–4 周日历观察。

---

## 1. 目标与非目标

### 1.1 目标

1. 首发 3–5 站，设计容量 20（硬上限 50）；每站独立域名、独立内容、sidebar/首页、品牌。
2. 单站可独立开发、构建、预览、部署；单站故障不阻塞其他站。
3. 一条命令构建全部；一条命令构建指定站；CI 只构建受影响站点，但跨站检查必须全库运行。
4. 指定几个站加内容：v1 提供最小 `content add`；完整 `sync/check/prune` 延后到 v1.1。
5. AI 内容流水线：brief → 生成 → 来源/证据校验 → 人工审核 → ready → 部署；**没有可信人工批准不得上线**。
6. 每站有可测量的门禁：schema、claims/evidence、revision 绑定、dedup、独立性、链接、sitemap、canonical、产物。
7. 生产可运维：部署可追溯、可回滚；每站独立 Pages 项目；密钥最小权限；首站上线即有监控与备份。

### 1.2 非目标（v1 不做）

- 跨站统一搜索（各站 Pagefind 独立）。
- 文档版本化。
- 多语言站点、`mirror`、`localized`：v1 schema 只接受 `primary`，避免“类型允许、实现未完成”。
- 非技术编辑的 CMS。
- 无人值守的 AI 自动发布（明确禁止）。
- 多 provider 自动切换：v1 只接一个 provider，保留窄接口。
- 完整内容包 `sync/check/prune`：v1 只做最小 `add`。
- 50 站编排、自动账号拆分、VPS 替代部署：20 站内不实现，只保留映射。

---

## 2. 架构

### 2.1 选型与隔离边界

选 **Monorepo，每站独立 Astro/Starlight 项目**。理由：内容独立、站点结构差异大、每站可用不同插件/主题、单站发布与回滚。

**隔离边界要说清楚**：

- 独立的是：内容、路由、构建产物、部署、回滚。
- 不独立的是：依赖版本（catalog + 单 lockfile）、docs-kit、CI 工作流、共享门禁脚本。
- 因此：**共享依赖升级默认触发全站验证**，生产部署可分批；不要把“单站发布”说成“单站升级完全不影响别人”。
- centosfan 的单项目多载体不混入本仓库；若未来出现“同一知识网络、70% 共享”的一组站，单独建 B 仓。

### 2.2 目录结构

```
docs-fleet/
├─ pnpm-workspace.yaml
├─ turbo.json
├─ fleet.config.json               # 站点注册表（机器可编辑，zod 校验）
├─ packages/
│  ├─ docs-kit/                    # createDocsConfig、主题、共享组件；构建到 dist
│  └─ content-kit/                 # 共享 MDX 片段（可选）
├─ content/
│  ├─ briefs/<site>/<slug>.yaml
│  ├─ drafts/<site>/<slug>.mdx
│  ├─ drafts/<site>/<slug>.claims.json
│  ├─ drafts/<site>/<slug>.meta.json
│  ├─ evidence/<site>/<slug>/      # 证据清单与哈希
│  ├─ reviews/<site>/<slug>.md     # 审计记录（不是发布授权）
│  ├─ packs/<pack>/                # 最小共享页
│  ├─ packs.lock.json              # 源 revision / 目标站 / draft 状态
│  └─ policies/                    # 来源白名单、证据等级、审核清单
├─ sites/
│  └─ router-homes/
│     ├─ astro.config.ts
│     ├─ site.meta.ts
│     ├─ package.json
│     ├─ src/content.config.ts     # docsSchema({ extend }) 接入自定义字段
│     ├─ src/content/docs/
│     ├─ src/styles/theme.css
│     └─ public/
├─ scripts/
│  ├─ new-site.ts
│  ├─ validate.ts
│  ├─ content/{generate,check,review,promote,add}.ts
│  ├─ deploy.ts
│  ├─ stamp.ts
│  ├─ ci-matrix.ts
│  └─ checks/{claims,mdx,security,dedup,independence,links,smoke,canonical,global,site,review}.ts
├─ ops/deployments.json            # 每站已部署 revision/deploymentId
├─ templates/site/
└─ .github/workflows/{ci,deploy}.yml
```

**注册表用 JSON 而不是 TS**：`new-site` 可直接追加，不需要 AST 改写；TypeScript 类型由 `packages/docs-kit/src/registry.ts` 的 zod schema 推导。

### 2.3 字段唯一来源

| 字段 | 唯一来源 | 说明 |
|---|---|---|
| id、domain、title、description、locale | `fleet.config.json` | 站点身份 |
| deploy.enabled、deploy.project、minPages | `fleet.config.json` | 构建/部署 |
| audience、angle、primaryTopics | `fleet.config.json` | 独立性与查询归属 |
| sidebar、首页、栏目、主题、插件 | `sites/<id>/site.meta.ts` | 结构差异 |
| 正文、frontmatter、claims | `sites/<id>/src/content/docs/` | 内容 |

`site.meta.ts` 通过 `getSite(id)` 读取注册表，不再复制 title/domain，避免两处漂移。

### 2.4 docs-kit、schema 与构建

- `docs-kit` 用 `tsc` 构建到 `dist/`；站点 `astro.config.ts` 导入构建产物，不直接导入 TS 源码。
- 站点用 `astro.config.ts`，让 Astro 的配置加载器处理 `site.meta.ts`。
- 每站显式依赖 `@fleet/docs-kit: workspace:*`，不要只用相对路径 import，否则 Turbo 任务图识别不到依赖。
- 自定义 frontmatter 必须通过 `docsSchema({ extend: ... })` 接入；不能假定 YAML 字段自动生效。
- **v1 不重写 Starlight 的 Header/Breadcrumbs/SEOHead**；先用原生能力，确有需求再覆盖。
- Sitemap：先确认 Starlight 内置 sitemap 行为，再决定是否额外注册 `@astrojs/sitemap`，避免重复。
- Turbo：`build` 声明 `dependsOn: ["^build"]`、`outputs: ["dist/**"]`；AI 生成、人工审核、deploy、在线来源检查设 `cache: false`；stamp 在缓存恢复之后执行，并绑定输入摘要与产物 digest。

---

## 3. 内容系统

### 3.1 每站独立内容

- `sites/<id>/src/content/docs/**` 是唯一正文来源。
- 每站独立 sidebar/首页/栏目，`site.meta.ts` 显式声明。
- 写作规范 `docs/writing-guide.md`；站内相对链接，跨站绝对 URL。
- 手写页面同样需要 review 与 `contentRevision`，不能绕过 AI 页面的门禁。

### 3.2 内容分发（v1 最小版）

用户需要“指定几个站加内容”，v1 保留最小能力，但**不允许绕过审核**：

- `pnpm fleet content add <pack/page> --sites router-homes,x` 只为每个目标站创建 `content/drafts/<site>/<slug>.mdx`（`origin: pack:<id>@<revision>`），**不直接写站点内容**。
- 每个目标页独立走 `drafted → sourced → reviewed → ready → promote`；源页的审核结果不继承。
- 每个目标页独立 `indexPolicy`；v1 默认 primary，重复副本 v1.1 才支持。
- `content/packs.lock.json` 记录源 revision、目标站、draft revision、状态。
- 完整 `sync/check/prune`、内容包版本升级、自动漂移检测延后到 v1.1；v1 不用 symlink。
- 共享页只用于确实需要复用的参考页；**不得作为 AI 批量复制到多站的通道**。

### 3.3 Claims / evidence 契约

**Claim 字段**：

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
  "verifiedBy": "human:alice"
}
```

**Evidence 字段**：

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

**规则**：

- `verificationStatus` 由工具/人工写入，模型不能自填 `human_verified`。
- 正文 claim 标记与 claims 双向校验：悬空标记、未使用 claim 均报错；自动断言识别只做提示，逐项事实支持由人确认。
- **证据适配**，不是简单递增等级：
  - 规格/标准说明：E1。
  - 软件操作：E1 + 关键步骤 E2。
  - 覆盖/吞吐/稳定性/“我们实测”：必须 E3。
  - “未实测”只能用于转述已注明来源的规格，不能支持本项目不存在的测试结果。
- **新鲜度按类型**：价格/库存 7 天；版本/兼容性 30 天；稳定标准 180 天。均为内部政策，不是 SEO 标准。
- `highRisk=true`（医疗/金融/法律等）v1 直接阻断生成与发布。
- “可重放”= 输入、模型标识、参数、请求 ID、原始输出可追溯；不承诺同输入必然同文本。

### 3.4 contentRevision 与可信审核

**contentRevision**：

```text
SHA256(canonicalJson({
  briefHash,
  pageHash,              // frontmatter + body
  claimsHash,
  evidence: [{ id, contentHash }],
  assets: [{ path, hash }],
  packSourceHash?        // 生成页才有
}))
```

生命周期状态、部署时间等派生字段不参与正文修订哈希。

**Review 记录**绑定 `siteId + pageId + contentRevision + policyVersion`。但 review 文件只是审计信息，**不能自行授予发布权**。人工批准来自：

- 受保护 PR 上的有效 review；
- reviewer 在 allowlist 内，排除生成机器人；
- 修改 brief/draft/claims/evidence/asset 后自动撤销批准；
- 生产 CI 校验 `sites/<id>/src/content/docs/` 的正文 revision 与被批准的 revision 一致。

**状态机**：

```
planned → drafted → sourced → reviewed → ready
                    ↘ rejected / blocked
ready → deployed → refreshed / retired
```

| 状态 | 进入条件 | 谁推进 |
|---|---|---|
| planned | brief schema 通过；站点/查询已登记 | operator |
| drafted | AI 草稿 + claims + meta 生成；结构 schema 通过 | operator |
| sourced | claims/evidence 完整；来源/证据检查通过 | 工具 |
| reviewed | 受保护 PR 批准；revision 匹配 | reviewer |
| ready | promote 到站点内容；构建/门禁通过 | operator |
| deployed | 部署成功；记录 deploymentId/revision/smoke | deploy job |
| refreshed | 新 revision 替换旧版；旧版继续服务到切换 | operator |
| retired | 下线；404/301 已登记 | operator |

部署另记 `ops/deployments.json`：`{ site, revision, deploymentId, deployedAt, smokeResult, commit }`。`published` 是部署成功后的**事实**，不是内容状态。

**反例验收**（必须写成测试）：

- 伪造 reviewer / 改 claims / 改线上正文 / 改引用图片 / 直接新增未登记页面 → 均不能上线。
- review 后改一个标点 → revision 变化 → review 失效。

### 3.5 AI 安全与 MDX 边界

- **v1 默认生成 `.md`**。需要 MDX 时，只允许固定组件与属性（`Aside`、`Card` 等），拒绝任意 `import/export`、表达式、原始 `<script>`、事件处理器、危险 URL。
- 增加 `check-mdx.ts`：用 AST 检查，不靠正则。
- AI generation job 只持有 provider key；不持有 Cloudflare token，不具有合并或生产部署权限。
- E2 只运行**人工批准的测试配方**（recipeId → 固定脚本），禁止直接执行正文里的 shell。测试环境无生产凭据、无宿主机挂载，限制网络/时间/CPU/内存。
- 来源抓取：仅 HTTPS；逐跳检查重定向与解析地址；拒绝 localhost、RFC1918、链路本地、云元数据地址；限制大小/超时/MIME（SSRF 防护）。
- 构建产物扫描：除 HTML 外，检查 `_worker.js`、Functions 目录、异常脚本、意外公开文件。
- `.github/workflows/**`、`scripts/**`、`pnpm-lock.yaml`、`packages/docs-kit/**`、`fleet.config.json`、`content/policies/**` 用 CODEOWNERS 保护；生产部署只消费可信 main workflow 产生的 artifact。
- 禁止带 secrets 的 `pull_request_target` 执行 PR 代码。
- 生成内容视为不可信输入；promote 前必须过 schema、MDX 检查、claims、链接、合规。

### 3.6 页面级索引策略与 SEO/AEO

v1 只支持 `primary`；站级 `mode` 删除，改为页面级 `indexPolicy`：

| 页面类型 | canonical | robots | sitemap |
|---|---|---|---|
| 原创、可索引 | 自引用 | index | 收录 |
| 重复副本（v1.1） | 指向 primary 页面 | index | 排除 |
| 明确不参与搜索 | 按既定策略 | noindex | 排除 |
| 翻译页（v1 不做） | 同语言自引用 | index | 收录 + hreflang |

- canonical 与 noindex 是不同用途，不能把 noindex 当 canonical 的强化开关。
- 校验**渲染后 HTML**：canonical 恰好一个、robots 有效、`lang` 正确；sitemap/Pagefind/llms.txt 无草稿。
- canonical 目标必须是正确页面、200、可索引，无链、无环；不能只检查域名在注册表。
- 查询注册表以 `语言 + 地区 + 用户任务/意图 + 查询簇` 为键，分配 primary **页面**；只按关键词字符串分配拦不住同义词竞争。
- `llms.txt`、FAQ schema 是增强项，不作为收录/AI 引用门禁（Google 明确不要求）。
- answer-first 作为编辑规范，不强制所有 H2 写成问题。

### 3.7 去重与站点独立性

**算法固定**：中文用字符 5-gram；英文用词 5-gram；正文去导航/页脚/模板；代码块与引用单独比较归属。记录 `algorithmVersion`。

**v1 处理**：

| 情况 | 处理 |
|---|---|
| 规范化正文哈希完全相同 | 未登记复用 → 直接阻断 |
| Jaccard ≥ 0.30 | 进入人工复核，不强制“改写” |
| containment ≥ 0.80 | 进入人工复核（短文被长文整体包含） |
| 正文 < 300 字符 | 转人工判断 |
| 已批准的共享副本 | 按路径 + 源 revision + 目标站 + 索引策略登记豁免，不能整站豁免 |

- 用至少 50 对已标注页面（正常同主题、合法引用、整页复制、语义改写）校准误报/漏报，再决定是否收紧。
- `unique ratio` 定义：`某页独有 shingle 数 / 该页 shingle 总数`；站级统计公开聚合方式。**0.8 只作观察线**，不是搜索质量承诺。
- 新站启动必须有人工确认的独立用户任务、持续维护负责人、实际资料增量；换品牌/sidebar/措辞不算。
- Google 将“创建多个站点以隐藏规模化内容”列为 scaled content abuse 示例；低文本相似度不能排除 doorway 风险。

### 3.8 批量、canary 与预算

**两阶段 canary**：

1. **技术 canary**：受保护 preview，验证审核、构建、链接、SEO 输出、回滚；不观察收录。Pages preview 默认 noindex。
2. **生产内容 canary**：`router-homes` 正式域名发布一个完整查询簇（建议 8–10 篇），观察 2–4 周。

**扩站条件**：

- 技术硬条件：关键页 200、canonical 正确、无意外 noindex、sitemap 有效、无草稿泄漏、回滚演练通过。
- 内容硬条件：100% 人工审核；事实/合规事故为 0；重复复核完成。
- 搜索观察：GSC 已验证、sitemap 已提交、抓取/索引原因可查；曝光只作诊断，不设四周 KPI。

**首发节奏**：目标是首发 3–5 站；上线顺序为 **1 → 3 → 5**，第一站作为生产内容 canary。内容批次可看 48–72 小时技术指标；站点扩张仍按生产内容 canary 周期。

**批量控制**：

- `batch limit=5`、`concurrency=2`、每站每日 10 页、全局每日 30 页（最大值）。
- 集中任务账本 + 幂等键 + 预算预留；失败调用也计费。
- 待审核队列 >10 页暂停生成；来源抓取重试与模型重生成分开计数，后者最多 2 次。
- 单 provider；provider 选择、数据保留/训练/区域/删除策略写入 `content/policies/provider.md`。
- 成本按 `模型输入/输出 + 失败重生成 + 来源抓取 + Actions/存储 + 域名 + 监控/分析 + 人工评审` 登记；80% 告警，100% 停止新生成。

### 3.9 发布与监控

- `content promote` 写入站点内容并更新 `contentRevision`；只有 `reviewed` 可 promote。
- 构建 → 门禁 → stamp → artifact → deploy → 线上 smoke；成功后才写 `deployed`。
- 发布后 4 周看 GSC：索引率、曝光、点击、查询匹配；无曝光只生成人工 `refresh` 任务，不自动改写/下线。
- 每月轻审计（重复/过期/断链），每季度深审计（版本、合规、内容组合）。

---

## 4. 构建、CI 与部署

### 4.1 工具链

- Node 24.x（Astro 7 要求 `>=22.22`）。
- pnpm workspace + catalog；`packageManager` 固定 pnpm 版本。
- Astro 7.x + Starlight 0.42.x。
- Turbo 2.x；TypeScript + zod；`@astrojs/mdx`（按需）。
- 单 provider，接口窄；不自动切换。

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

**要点**：可执行 matrix、merge-base、全局检查、按站故障隔离、revision 对账。

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

- `ci-matrix.ts`：PR 用 `git merge-base origin/main HEAD`；push 用 `event.before → github.sha`；无有效 base、首次运行、检测失败 → 全量。显式处理删除/重命名/空矩阵。
- 影响规则：单站正文 → 构建该站 + **全库跨站检查**；docs-kit → 所有依赖站；registry/门禁脚本/共享配置/lockfile → 明确规则扩展，无法判断则全量。
- `policy` job 全局运行 dedup、查询归属、registry、review revision，不随单站 build 跳过。
- `deploy` 用 `if: always()` + 每站 artifact 存在性检查；某站 build 失败只阻塞该站，其他站继续部署。
- 失败站即使下次没有内容变化，也必须能补部署；`ops/deployments.json` 对账目标 revision 与已部署 revision。
- 生产顺序固定：内容批准/证据/去重 → build → HTML/链接/SEO 校验 → stamp → artifact → deploy → 线上 smoke。

### 4.3 构建策略与 SLO

- 3–5 站：逐站矩阵，`max-parallel: 2–3`，缓存 pnpm store。
- 10–20 站：先维持逐站矩阵；有瓶颈再按 4–5 站分片，不直接改成一个大 build job（内存/故障耦合）。
- 部署阶段超过 5 站时，矩阵部署会重复 `pnpm install`；改为单个 deploy job 循环 + 每站结果记录，或使用只含 `wrangler` 的轻量部署镜像，避免把部署成本放大。
- nightly 全量检查，发现变更检测遗漏。
- Phase 0 记录冷构建、热构建、RSS、artifact 大小、上传耗时。
- 初始 SLO：单站变更反馈 p95 ≤10 分钟；20 站全量 ≤30 分钟。超标再优化，不当作已验证能力。

### 4.4 部署与回滚

- Cloudflare Pages，每站一个项目；direct upload。
- `deploy.enabled=false` 可构建不部署。
- stamp 字段：`site、commit、inputDigest、policyVersion、artifactDigest、runId、mode、builtAt`。
- 部署前校验：site/commit/mode；缺 `index.html` 拒绝；candidate/rehearsal 拒绝；artifact digest 匹配。
- 每站记录 deployment ID；部署后验证自定义域名上的 stamp。
- **Pages 配额更正**：Free 每月 500 次构建、1 个同时构建；100 个项目/账号；每站 20,000 文件、单文件 25 MiB。direct upload 不消耗“构建次数”，但仍受文件数/大小/API 限流约束。
- 回滚：优先回滚已有成功 production deployment；**不要用 `wrangler pages deployment` 当完整回滚命令**。使用已核验 API：
  ```text
  POST /accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/rollback
  ```
  或在 Pages 控制台回滚。preview 不能作为回滚目标。
- artifact 至少保留最近 5 个成功生产版本或 30 天；回滚不重新执行 AI。
- 部署前检查是否已被较新发布取代；生产部署中途不随意取消。
- canary 失败停止扩散；非 canary 的单站失败只停该站并记录补部署任务。
- 纯静态 `_redirects` 不支持任意 410：无替代页时返回真实 404；确需 410 再引入 Function/Worker。禁止把所有下线页 301 到首页。

### 4.5 Provider 与成本边界

- v1 单 provider；`provider-policy` 记录允许的数据类型、保留政策、训练使用、区域、删除机制、预算。
- 只发送当前站点所需的已脱敏资料；不上传整个仓库或其他站点内容。
- 成本登记见 §3.8；token 上限不能替代货币预算。

---

## 5. 质量门禁

| 门禁 | 内容 | 阶段 | 处理 |
|---|---|---|---|
| G0a | brief schema、站点/查询登记、slug/路径 | 生成前 | 硬阻断 |
| G0b | draft/claims/evidence schema、结构 | 生成后 | 硬阻断 |
| G1 | 来源绑定、证据类型适配、时效、`highRisk` | sourced | 硬阻断 |
| G2 | 可信 review + `contentRevision` 匹配 | ready 前 | 硬阻断 |
| G3 | 精确复制阻断；近似重复人工复核 | 发布前 | 硬阻断/复核 |
| G4 | 独立定位、查询归属人工批准；0.8 观察 | 发布前 | 人工 |
| G5 | build、链接/资源/锚点、孤立页、sitemap、canonical、渲染 HTML | 部署前 | 硬阻断 |
| G6 | 安全 headers、关键重定向；Lighthouse 后置 | 生产前/周期性 | 硬阻断/告警 |
| G7 | 产物 stamp、digest、site/commit/mode | 部署前 | 硬阻断 |
| G8 | 索引/曝光采集、负责人、刷新队列 | 发布后 | 运营 |

**v1 保留范围**：C1–C10 中，C2 的“首段 2–3 句”降为编辑建议；C8 的“3–8 条内链”改建议；C9 独立为 secret/PII 扫描 + 人工权利审核；C7 的 0.8 只作观察。其余保留。

**阈值**：

- `minPages` 是上线内容计划，不是质量分；首发站建议 8–10 页。
- 精确复制 = 0；近似重复 ≥0.30 必须复核并记录结论。
- 死链 = 0；但外链超时先重试并人工核实，不因来源站临时故障硬阻断。
- sitemap 只含本站 URL；canonical 自引用（v1）。
- 渲染后 HTML 检查，不只查 frontmatter。

---

## 6. 工作分解

**工程 19–27 人日**（不含正式内容制作与评审）。

| 范围 | 人日 |
|---|---:|
| 两站竖切、模板、registry、docs-kit | 3–4 |
| 单 provider 草稿、证据契约、审核绑定 | 5–7 |
| CI/CD、artifact、安全与回滚 | 4–5 |
| 内容/SEO 检查及故障场景验证 | 4–6 |
| 上线运营、监控、文档及缓冲 | 3–5 |
| **合计** | **19–27** |

### Phase 0：竖切与决策（1–2 天）

- 两站（`router-homes` + 一个）跑通 registry/docs-kit/构建/预览。
- 实测冷/热构建、Pages 预览、内容隔离。
- 确认 provider、首站页数、E3 要求、预算。
- 产出 `docs/adr/0001-architecture.md`、`0002-content-review.md`。

**验收**：两站独立 dist；互不含对方页面；单站 dev 正常；preview 可访问。

### Phase 1：骨架（3–4 天）

- pnpm/Turbo/catalog、`fleet.config.json` + zod、`new-site`、`docs-kit`、`site.meta`、`templates/site`。
- 2 套主题、共享 Header/Footer/SEOHead/Compliance（先不覆盖 Starlight 原生）。
- `validate`、`build`、`dev --filter`。

**验收**：`new-site` 生成可运行站；重复域名/缺目录被拦截；两站构建通过；docs-kit 升级触发依赖站。

### Phase 2：最小内容分发（1 天）

- `content add --sites`、生成标记、每目标页 review/indexPolicy、锁记录。
- **不做** sync/check/prune（v1.1）。

**验收**：add 到 2 站；目标页均需独立 review；重复执行不重复写入；手写文件不被覆盖。

### Phase 3：AI 流水线 MVP（5–7 天）

- brief/draft/claims/evidence schema；单 provider；`batch`/`--dry-run`/`--resume`。
- G0a/G0b/G1 检查；`contentRevision`；受保护 PR review 绑定；`promote`。
- 首站 5 页走完生成→sourced→reviewed→ready。

**验收**：伪造 reviewer/改 claims/改正文/改图片均不能上线；review 后改标点失效；5 页中至少 3 页通过；1 页无来源被拒。

### Phase 4：CI/CD 与部署（4–5 天）

- `ci-matrix`（merge-base/事件范围/空矩阵/删除重命名）、全局 policy、按站 build/deploy、artifact、stamp、回滚。
- `ops/deployments.json` 对账。

**验收**：只改一站只构建/部署该站；改 docs-kit 触发依赖站；某站失败不阻塞其他站；错误 digest/commit 被拒；回滚演练成功。

### Phase 5：SEO/质量/安全（4–6 天）

- `indexPolicy`、canonical 渲染校验、sitemap/robots、dedup、independence、MDX/SSRF/secret 扫描、链接/孤立页。
- 50 对样本校准 dedup；首站监控、GSC、备份。

**验收**：跨站复制被阻断/复核；canonical 链/环被发现；MDX 恶意样例被拒；SSRF 样例被拒；首站 sitemap 正确。

### Phase 6：首站上线（编辑 + 日历）

- 生产内容 canary：8–10 页，正式域名，观察 2–4 周。
- 通过后 1 → 3 → 5 站；每站 8–10 页，全部人工 review。

**验收**：技术硬条件全过；内容硬条件全过；GSC 可查；回滚可用；无 dedup 阻断。

### Phase 7：扩到 10–20 站（1–2 周工程 + 持续内容）

- CI 分片（按实测）、nightly 全量、监控、审计、站点生命周期。
- 每站 owner、复核日、下线/301 流程。

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| AI 幻觉/无来源断言 | 信任与 SEO 受损 | claims/evidence；人工 review；E0 拒绝 |
| 多站同质化/doorway | 不收录、拖累主站 | 精确复制阻断；近似重复复核；一查询一 primary 页面；canary |
| 审核被绕过/伪造 | 未审核内容上线 | contentRevision + 受保护 PR + CI 校验 + 反例测试 |
| MDX/内容执行代码 | 供应链/服务器风险 | 默认 `.md`；MDX AST 白名单；生成/部署权限隔离 |
| SSRF/来源抓取 | 内网探测 | HTTPS、重定向/解析检查、私网/元数据阻断、大小/超时限制 |
| 缓存污染/旧 stamp | 错误产物上线 | `cache:false`；stamp 绑定 inputDigest/artifactDigest；部署前校验 |
| 旧部署覆盖新版本 | 回退 | 部署 ID/目标 revision 对账；生产部署不随意取消 |
| 评审瓶颈 | 发布停滞 | 每批上限；清单化；>10 页待审暂停生成 |
| AI 成本/配额 | 预算超支 | 货币预算；80% 告警/100% 停止；失败也计费 |
| 来源版权/引用 | 法律风险 | 权利字段；短引用；不复制全文；provider 数据边界 |
| Pages 配额/文件限制 | 部署失败 | 20k 文件/25 MiB 检查；接近 100 项目转 VPS/分账号 |
| 域名/DNS/TLS | 上线延迟 | 上线验收表；负责人；证书/重定向检查 |
| Astro/Starlight 升级 | 全站回归 | catalog 锁版本；staging canary；分批部署 |

---

## 8. 运营与上线验收

| 项目 | 验收 | 负责人 |
|---|---|---|
| DNS/TLS | 注册商/续费负责人；apex/www 主域；HTTPS/重定向；CAA/证书状态；上线前逐域验证 | operator |
| GSC | 每域 Domain Property、DNS 验证、sitemap 提交时间、账号恢复路径 | operator |
| 分析 | 每站独立 ID；排除 preview/内网；事件不带 PII | operator |
| 编辑透明度 | 关于、纠错政策、联系、隐私页；商业关系披露 | editor |
| URL 生命周期 | 稳定 pageId；旧→新登记；无链无环；无替代内容 404 | operator |
| 备份 | Git 外保存证据/审核记录/媒体权利/生产 artifact/域名部署映射；定期恢复演练 | operator |
| 监控 | 每 5 分钟首页 + 1 关键页；连续 3 次失败告警；每日证书/索引指令检查 | operator |
| 内容维护 | 每页 owner、下次复核日；按过期风险刷新 | editor |

- 月度轻审计、季度深审计。
- SLO 见 §4.3；生产部署成功率、回滚次数纳入月度复盘。

---

## 9. 延后项与开放决策

### 9.1 明确延后

1. 内容包完整 `sync/check/prune`、自动漂移检测（v1.1）。
2. `mirror`/`localized`、hreflang（v1 只 primary）。
3. 多 provider 抽象/自动切换（v1 单 provider）。
4. embedding 去重、复杂独立性评分（v1 精确哈希 + 5-gram + containment + 人工）。
5. 50 站编排、自动账号拆分、VPS 替代部署（20 站内不实现）。
6. 大范围 Starlight 组件覆盖、第二套主题、Lighthouse 硬阈值。
7. 按曝光自动刷新/下线（v1 只生成人工任务）。

### 9.2 开放决策（Phase 0 确认）

1. Provider 选型与预算：单 provider + 月度上限。
2. 首站页数：8–10 页（建议），还是先 5 页技术验证。
3. `router.homes` 是否需要 E3 实测；哪些结论必须实测，哪些可 E1 + 明确标注。
4. 内容包 `add` 的首次使用场景：是否真的有跨站复用页，还是 v1 直接不做。

### 9.3 下一步

1. Phase 0：两站竖切 + 构建/预览实测。
2. 确认 §9.2 四项。
3. 进入 Phase 1；Phase 3 前先写 `docs/adr/0002-content-review.md`，把 revision/review/部署状态机定死。

---

## 10. 评审记录

- 评审对象：`DEVELOPMENT_PLAN.md` v0.2，commit `00f960f`。
- 评审工具：Codex CLI 0.163.0，`codex exec -s read-only`（`review` 子命令在 `--commit`/`--uncommitted` 下不允许自定义提示词）。
- 评审结论：保留 monorepo 方向；10 条 P0/P1 已纳入本版；P2 纳入运维/成本/构建策略；部分范围延后。
- 本版未执行代码/构建验证；Phase 0 的首要任务是用两站竖切验证假设。
