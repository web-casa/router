# 文档站群开发方案（v0.2 执行版）

> 状态：6 项方向已确认；待 Codex review 后出 v0.3。
> 已确认决策：**A. Monorepo（每站独立 Astro 项目）｜每站独立内容 + 按需内容包｜结构差异｜Cloudflare Pages 每站一项目 + Actions 直传｜首发 3–5 站、12 个月 10–20 站｜AI 批量生成 + 人工审核 + centosfan 式 dedup/独立性门禁**。
> 参考：`~/centosfan`（生产多站系统）、`starlight-multi-site`（原型，不采用）、`astro-fleet`（monorepo 工程参考，非 Starlight）。

---

## 0. 决策记录（ADR 摘要）

| ID | 决策 | 选择 | 主要影响 |
|---|---|---|---|
| ADR-001 | 架构底座 | Monorepo，每站独立 Astro 项目 | 内容/配置/缓存隔离；50 站可控 |
| ADR-002 | 内容模型 | 每站独立内容 + 按需内容包 | 默认不共享；共享必须显式登记 |
| ADR-003 | 站点差异 | 结构差异（sidebar/首页/栏目） | `site.meta.ts` 每站独立；docs-kit 只共享机制 |
| ADR-004 | 部署 | Cloudflare Pages，每站一项目，Actions 直传 | `deploy.enabled` + 产物盖章；100 项目上限 |
| ADR-005 | 规模 | 首发 3–5，12 个月 10–20 | v1 不按 50 站过度设计，但保留扩展点 |
| ADR-006 | 内容生产 | AI 批量草稿 + 人工审核 + 严格门禁 | 内容流水线是 v1 的核心工程，不是附属功能 |

**决策变更**：任何一项改变，先在 `docs/adr/` 写变更记录，再改本方案；不在代码里静默漂移。

---

## 1. 目标与非目标

### 1.1 目标

1. 一个仓库管理 3–20 个（上限 50）独立域名文档站；每站独立内容、独立 sidebar/首页、独立品牌。
2. 单站可独立开发、构建、预览、部署；单站故障不阻塞其他站。
3. 一条命令构建全部；一条命令构建指定几个站；CI 只构建受影响站点。
4. 内容包可幂等分发到指定站点，带漂移检查与生成标记。
5. AI 内容流水线：brief → 生成 → 来源/证据校验 → 人工审核 → promote → 发布；**没有人工审核不得上线**。
6. 每站有可测量的质量门禁：schema、claims/evidence、dedup、站点独立性、链接、sitemap、canonical、构建产物。
7. 生产可运维：部署可追溯、可回滚；每站独立 Pages 项目；密钥最小权限。

### 1.2 非目标（v1 不做）

- 跨站统一搜索（各站 Pagefind 独立）。
- 文档版本化（Starlight 无内置；后续用插件或目录）。
- 多语言站点（除非单站明确需要；centosfan 的 zh/en 镜像可后移植）。
- 非技术编辑的 CMS（v1 是 Git + Markdown/MDX + 人工 review）。
- 无人值守的 AI 自动发布（明确禁止）。
- 50 站以上的 Pages 项目编排（先按 20 站设计，50 站作为扩展点）。

---

## 2. 架构

### 2.1 选型结论

选 **A. Monorepo，每站独立 Astro/Starlight 项目**。理由：

- 各站内容独立，单项目多载体（centosfan B 方案）会强迫所有站共享路由空间和装配器，50 个不同主题的站会变得难以维护。
- 每站独立项目可以有不同的 Starlight 插件、sidebar、首页、主题，天然满足 ADR-003。
- Turso/Turbo 按包过滤和缓存，选择性构建/部署更直接。
- 单站故障、单站升级、单站回滚互不影响。

centosfan 的单项目模式不废弃：如果未来出现“同一知识网络、70% 共享内容”的一组站，可作为 B 方案单独建仓；不混入本仓库。

### 2.2 目录结构

```
docs-fleet/
├─ pnpm-workspace.yaml
├─ turbo.json
├─ fleet.config.ts                 # 站点注册表（唯一事实来源）
├─ packages/
│  ├─ docs-kit/                    # createDocsConfig、主题令牌、共享组件
│  └─ content-kit/                 # 共享 MDX 片段/组件（可选）
├─ content/
│  ├─ briefs/<site>/<slug>.yaml    # AI 页面 brief
│  ├─ drafts/<site>/<slug>.mdx     # AI 草稿（不进站点内容）
│  ├─ drafts/<site>/<slug>.claims.json
│  ├─ drafts/<site>/<slug>.meta.json
│  ├─ reviews/<site>/<slug>.md     # 人工评审记录
│  ├─ packs/<pack>/                # 跨站共享内容包
│  └─ .fleet/content.lock.json
├─ sites/
│  └─ router-homes/
│     ├─ astro.config.mjs
│     ├─ site.meta.ts
│     ├─ package.json
│     ├─ src/content/docs/
│     ├─ src/styles/theme.css
│     └─ public/
├─ scripts/
│  ├─ new-site.ts
│  ├─ validate.ts
│  ├─ content/{generate,check,review,promote,sync}.ts
│  ├─ deploy.ts
│  ├─ ci-matrix.ts
│  └─ checks/{claims,dedup,independence,links,smoke,canonical}.ts
├─ templates/site/
└─ .github/workflows/{ci,deploy}.yml
```

### 2.3 站点注册表

```ts
export type SiteMode = 'primary' | 'mirror' | 'localized';

export interface SiteConfig {
  id: string;
  domain: string;
  title: string;
  description: string;
  locale: 'zh-CN' | 'en';
  mode: SiteMode;
  canonical?: string;
  theme: string;
  audience: string;              // 该站读者（用于独立性检查）
  angle: string;                 // 该站独特视角/数据（用于独立性检查）
  minPages: number;
  deploy: { enabled: boolean; project: string };
  contentPacks?: string[];
}

export const sites: SiteConfig[] = [
  {
    id: 'router-homes',
    domain: 'router.homes',
    title: 'Router Homes',
    description: '家用路由器与家庭网络中文文档',
    locale: 'zh-CN',
    mode: 'primary',
    theme: 'clean',
    audience: '家庭用户与小型办公室',
    angle: '按户型和带宽选型，附实测数据',
    minPages: 12,
    deploy: { enabled: true, project: 'router-homes' },
  },
];
```

`scripts/validate.ts` 用 zod 校验：id/domain 唯一、目录存在、canonical 目标在注册表、deploy.project 唯一、`minPages > 0`、`audience/angle` 非空。

### 2.4 docs-kit

```ts
// packages/docs-kit/src/config.ts
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import type { SiteMeta } from './types';

export function createDocsConfig(meta: SiteMeta) {
  return defineConfig({
    site: `https://${meta.domain}`,
    integrations: [
      starlight({
        title: meta.title,
        description: meta.description,
        logo: meta.logo,
        locales: meta.locales,
        defaultLocale: meta.defaultLocale ?? 'root',
        sidebar: meta.sidebar,
        social: meta.social,
        customCss: meta.customCss ?? [],
        plugins: meta.plugins ?? [],
        components: meta.components,
        head: meta.head,
      }),
    ],
  });
}
```

- `sites/<id>/site.meta.ts` 每站一个，类型由 docs-kit 提供。
- 主题：`docs-kit/styles/themes/<id>.css`；每站 `src/styles/theme.css` 用 `@import` 引入，避免依赖未验证的包路径解析。
- 共享组件：Header、Footer、SEOHead、Compliance、Breadcrumbs；每站可覆盖。
- docs-kit 不硬编码任何域名/品牌/业务字段。

---

## 3. 内容系统

### 3.1 每站独立内容

- `sites/<id>/src/content/docs/**` 是站点正文的唯一来源。
- 每站独立 `sidebar`/首页/栏目；`site.meta.ts` 显式声明，不用跨站推断。
- 内容写作规范：`docs/writing-guide.md`；每站可有补充规范。
- 站内链接用相对路径；跨站链接用绝对 URL（由 `check-links` 校验）。

### 3.2 内容包（按需共享）

用于“确实需要多站复用”的页面，不是 AI 批量复制的通道。

```
content/packs/<pack>/
├─ pack.ts          # slug、源文件、默认 frontmatter、目标站点
└─ pages/*.mdx
```

- `pnpm fleet content add <pack> --sites a,b`：写入目标站，带 `<!-- generated from ... -->`。
- `pnpm fleet content sync --check`：源哈希 vs 生成文件；漂移即 CI 失败。
- `pnpm fleet content sync --prune`：只删带生成标记的文件。
- `.fleet/content.lock.json`：来源哈希、目标、时间、操作者。
- 共享内容必须显式登记 canonical 策略；默认 `primary` 站拥有索引权。

### 3.3 AI 内容流水线（v1 核心）

#### 3.3.1 原则

1. **AI 只产出草稿，人负责发布**。
2. **每个事实型断言必须有来源或可重放证据**；无来源 = 拒绝。
3. **一页只属于一个 primary 站**；跨站复用必须 canonical/noindex + 审批。
4. **批量有上限**：先 canary，再扩站；不一次性生成 20 个站。
5. **提示词、模型、输出全部版本化**；同一 brief + 模型版本应可重放。

#### 3.3.2 状态机

```
planned → drafted → sourced → reviewed → published
                         ↘ blocked / rejected
published → refreshed / retired
```

| 状态 | 进入条件 | 谁推进 |
|---|---|---|
| planned | brief 通过 schema；目标站点/查询已登记 | operator |
| drafted | AI 草稿 + claims + meta 生成；MDX schema 通过 | operator |
| sourced | claims 全部有来源/证据；自动检查通过 | 工具 |
| reviewed | 人工评审通过；review 文件哈希与当前 draft 一致 | reviewer |
| published | promote 到站点内容；L1/L2 门禁通过；部署成功 | operator |
| retired | 页面下线；301/410 已登记 | operator |

任何内容改动（正文/claims/frontmatter）都会使 review 失效，必须重新评审。

#### 3.3.3 产物与契约

```
content/briefs/<site>/<slug>.yaml
content/drafts/<site>/<slug>.mdx
content/drafts/<site>/<slug>.claims.json
content/drafts/<site>/<slug>.meta.json
content/reviews/<site>/<slug>.md
```

**Brief（zod 校验）**：

```yaml
id: router-homes-wifi-6-vs-7
site: router-homes
slug: wifi-6-vs-7
title: Wi-Fi 6 与 Wi-Fi 7 家用路由器怎么选
description: 从户型、带宽、终端数量三个维度给出选型结论与实测数据。
intent: informational
audience: 准备换路由器的家庭用户
primaryQuery: wifi6 和 wifi7 区别 家用
secondaryQueries: [wifi7 有必要吗, 路由器 160mhz]
uniqueAngle: 同一户型下的实测吞吐与覆盖对比，给出价格分档建议
outline:
  - 一句话结论
  - 关键差异（频宽、MCS、MLO、6GHz）
  - 什么情况下值得升级
  - 按预算的型号建议
  - 验证方法
sources:
  - url: https://example.org/spec
    kind: official
    locator: section 2
internalLinks:
  - /wifi-channel-guide/
constraints:
  wordCount: 1200-1800
  locale: zh-CN
  noClaimsWithoutSource: true
```

**Draft frontmatter**：

```yaml
title: ...
description: ...
status: drafted            # drafted|sourced|reviewed|published
ai:
  provider: openai
  model: gpt-5.1
  promptVersion: docs-v1
  generatedAt: 2026-10-20T00:00:00Z
sources: [...]
claims: ./wifi-6-vs-7.claims.json
canonical: ""              # primary 留空；mirror 指向 primary
robots: index,follow
lastUpdated: 2026-10-20
```

**Claims**：

```json
{
  "claims": [
    {
      "id": "c1",
      "text": "Wi-Fi 7 的 6 GHz 信道支持 320 MHz 频宽",
      "source": "https://example.org/spec",
      "locator": "Table 3",
      "quote": "...",
      "kind": "official",
      "verified": true
    }
  ]
}
```

#### 3.3.4 自动化检查

| 检查 | 规则 | 失败处理 |
|---|---|---|
| C1 schema | brief/draft/claims 符合 zod；slug 一致 | 拒绝生成 |
| C2 结构 | 唯一 H1；H2/H3 不跳级；首段 2–3 句给结论 | 自动修复或退回 |
| C3 事实断言 | 含版本/日期/命令/价格/兼容性断言的段落必须有 claim 标记；每个 claim 有来源 | 退回 |
| C4 来源质量 | 至少 1 个官方/一手来源；域名白名单；`checkedOn` ≤ 14 天 | 退回 |
| C5 证据等级 | how-to/troubleshooting 的命令需 E2（容器/VM 可重放）；硬件结论需 E3 或明确标注“未实测” | 降级或退回 |
| C6 去重 | 站内/跨站 shingle Jaccard < 0.30；超阈需改写/quarantine | 阻断 |
| C7 独立性 | 每站 unique ratio ≥ 0.8；与兄弟站无整页复制；audience/angle 有差异 | 阻断发布 |
| C8 内链 | 目标页面存在；每页 3–8 条相关内链 | 阻断 |
| C9 合规 | 无 PII、无版权长引用、无未授权商标使用、必要免责声明 | 阻断 |
| C10 审核 | review 文件存在且哈希匹配；reviewer 非 AI | 阻断发布 |

**证据等级**：

- `E1`：官方文档/厂商规格/标准文本。
- `E2`：可重放环境（容器/VM/脚本）中的实测输出。
- `E3`：真实硬件/真实网络/真实账户的实测记录（含日期、环境、日志）。
- `E0`：无来源 → 直接拒绝。

非技术主题可将 E2 解释为“可复核的一手数据/截图/日期”，但必须在 brief 中声明。

#### 3.3.5 人工审核

- 评审文件 `content/reviews/<site>/<slug>.md`，包含：
  - 结论（pass/fail）
  - 事实核对（逐 claim）
  - 独特性/搜索意图
  - 内链/结构
  - 合规/语气/AI 痕迹
  - reviewer、日期、draft 哈希
- `pnpm fleet content review --site ... --slug ...` 打印清单并写入记录。
- 高风险主题（医疗/金融/法律）要求第二评审人；v1 可先不做，但要在 brief 标记 `highRisk`。
- **AI 不能给自己签 review**；reviewer 必须是人类账号。

#### 3.3.6 批量与 canary

- `pnpm fleet content batch --site router-homes --limit 5 --concurrency 2`。
- 每站每日上限 10 页；全局每日上限 30 页；token 预算超限即停。
- 第一批只在 `router-homes` 生成 5 页；预览部署 + 人工评审 + 2–4 周索引观察；通过后再开第二站。
- `--dry-run`、`--resume`、`--stop-on-fail`；失败不自动重试超过 2 次。
- 模型/提示词版本写入 `meta.json`；升级模型先跑回归集（10 个固定 brief）。

#### 3.3.7 发布与监控

- `pnpm fleet content promote --site ... --slug ...`：写入 `sites/<id>/src/content/docs/`，加生成标记，更新 lockfile。
- 只有 `reviewed` 状态可 promote；`published` 必须经过构建门禁与部署。
- 发布后 4 周看 GSC：索引率、曝光、点击、查询匹配；无曝光页面进入 `refresh` 队列（改写/合并/下线），不继续堆量。
- 每季度做一次内容审计：重复、过期、断链、低质页面。

### 3.4 SEO / AEO 策略

- `primary`：原创、可索引、进 sitemap。
- `mirror`：canonical 指向 primary；必要时 noindex；不参与排名竞争。
- `localized`：hreflang 配对；不另起“站”。
- 每站独立 sitemap、robots、`llms.txt`、OG、JSON-LD。
- 查询簇登记：`content/query-registry.json`，每个 primary 查询只能有一个 primary 站；防止站间 cannibalization。
- 首段答案化（answer-first）；H2 用问题式；每页一个主查询 + 2–4 个相关问；必要时 FAQ schema。
- 内链 3–8 条；外链只引权威来源；不做无意义互链。
- 去重与独立性门禁是发布前置条件，不是事后报告。
- 禁止：50 站同文、 doorway、AI 批量灌水、无来源断言、关键词堆砌。

---

## 4. 构建、CI 与部署

### 4.1 工具链

- Node 24.x（Astro 7 要求 `>=22.22`）。
- pnpm workspace + catalog 锁 Astro/Starlight 版本。
- Astro 7.x + Starlight 0.42.x（新项目；centosfan 的 Astro 6/Starlight 0.40 不直接复用）。
- Turbo 2.x。
- TypeScript + zod。
- `@astrojs/sitemap`、`@astrojs/mdx`、`starlight-llms-txt`（或自写端点）。

```yaml
# pnpm-workspace.yaml
packages:
  - 'sites/*'
  - 'packages/*'
catalog:
  astro: ^7.4.1
  '@astrojs/starlight': ^0.42.6
```

### 4.2 命令

```bash
pnpm build                                                   # 全部
pnpm build --filter=./sites/router-homes                     # 单站
pnpm build --filter=./sites/router-homes --filter=./sites/x  # 指定几站
pnpm build --filter='...[origin/main]'                       # 受影响站点
pnpm fleet content add content/packs/security --sites router-homes,x
pnpm fleet content sync --check
pnpm fleet content batch --site router-homes --limit 5
pnpm fleet content review --site router-homes --slug wifi-6-vs-7
pnpm fleet content promote --site router-homes --slug wifi-6-vs-7
pnpm fleet deploy --all
```

### 4.3 CI

```yaml
jobs:
  changes:
    outputs: matrix
    steps:
      - run: node scripts/ci-matrix.ts --changed origin/main > matrix.json
  build:
    needs: changes
    strategy:
      fail-fast: false
      matrix: ${{ fromJSON(needs.changes.outputs.matrix) }}
    steps:
      - pnpm install --frozen-lockfile
      - pnpm --filter @fleet/site-${{ matrix.site }} build
      - node scripts/checks/links.ts --site ${{ matrix.site }}
      - node scripts/checks/smoke.ts --site ${{ matrix.site }}
      - node scripts/stamp.ts --site ${{ matrix.site }}
      - upload-artifact dist-${{ matrix.site }}
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - download-artifact
      - pnpm fleet deploy --site ${{ matrix.site }}
```

- 首发 3–5 站：矩阵逐站构建即可。
- 10–20 站：先一个 `turbo build` job，再按站部署产物；或按 5–10 站分片，避免 20 次 `pnpm install`。
- 每站 concurrency group；同一站不并发部署。
- Cloudflare secrets 只注入 deploy job；构建 job 不需要。

### 4.4 部署

- Cloudflare Pages，每站一个项目；`wrangler pages deploy` direct upload。
- `deploy.enabled=false` 的站可构建但不部署（灰度/候选）。
- 构建产物写 `_fleet-build.json`：`{ site, commit, mode: 'production', builtAt }`。
- 部署前校验：site/commit/mode 匹配；缺 `index.html` 拒绝；candidate/rehearsal 产物拒绝。
- 失败处理：中止剩余站；已上传站保留新版，按 runbook 回滚（重跑上一 commit 的构建或 `wrangler pages deployment` 回滚）。
- 自定义域名一次性在 Pages 控制台/API 配置；DNS 记录纳入上线清单。
- Pages 上限：100 项目/账号；免费版 500 构建分钟/月、1 并发。direct upload 不消耗构建分钟。
- 若未来接近上限：VPS + Caddy 按 Host 指 root，或分账号；不在 v1 实现。

---

## 5. 质量门禁

| 门禁 | 内容 | 阻断级别 |
|---|---|---|
| G0 | brief/draft/claims schema；slug/站点一致 | 生成前 |
| G1 | claims 有来源/证据；无 E0；来源新鲜度 | `sourced` 前 |
| G2 | 人工 review 哈希匹配；reviewer 存在 | 发布前 |
| G3 | 站内/跨站 dedup（Jaccard < 0.30） | 发布前 |
| G4 | 站点独立性（unique ratio、audience/angle、无整页复制） | 发布前 |
| G5 | build、链接、smoke、sitemap、canonical | 部署前 |
| G6 | a11y（axe）、Lighthouse、headers/redirects | 生产发布前（可配置为警告） |
| G7 | 产物盖章、site/commit 匹配、production mode | 部署前 |
| G8 | 发布后索引/曝光监控；无曝光页面进 refresh 队列 | 发布后 |

**分级**：

- L1（每次 PR/部署）：G0/G1/G5/G7。
- L2（发布前）：G2/G3/G4。
- L3（周期性）：G6/G8 + 内容审计。
- 生产部署要求 L1 + L2 全绿；预览可只跑 L1。

**阈值**：

- `minPages` 每站 ≥ 12（首发可 8，随内容增长上调）。
- site unique ratio ≥ 0.8；跨站整页复制 = 0。
- dedup Jaccard 阈值 0.30（与 centosfan 同尺）；超阈必须改写/canonical/noindex。
- 链接死链 = 0；sitemap 只含本站 URL；canonical 自引用或指向已登记 primary。

---

## 6. 工作分解

工程总量估计 **10–12 人日**（不含内容评审时间）。

### Phase 0：决策 + 竖切（0.5–1 天）

- 建 pnpm workspace、Turbo、docs-kit、registry、两个站（`router-homes` + 一个）。
- 实测单站冷/热构建、Pages 预览、内容隔离。
- 产出 `docs/adr/0001-architecture.md`。

**验收**：两站独立 dist；互不含对方页面；`pnpm build` 成功；单站 dev 正常。

### Phase 1：基础骨架（2 天）

- `fleet.config.ts` + zod 校验；`new-site.ts` + `templates/site`。
- docs-kit：createDocsConfig、主题 2 套、Header/Footer/SEOHead/Compliance。
- 每站 `site.meta.ts`、sidebar、首页。
- `pnpm validate`、`pnpm build`、`pnpm dev --filter`。

**验收**：`pnpm new-site` 生成可运行新站；重复域名/缺目录被拦截；两站构建通过。

### Phase 2：内容包（1 天）

- pack schema、add/sync/check/prune、lockfile、生成标记、canonical 策略。
- 用一个 pack 发到 3 站中的 2 站。

**验收**：幂等；`--check` 检测漂移；`--prune` 不误删手写；目标站构建通过。

### Phase 3：AI 内容流水线 MVP（3 天）

- brief/draft/claims schema；生成适配器（provider-agnostic）；`batch`/`--dry-run`/`--resume`。
- C1–C5 自动检查（schema、结构、claims、来源、证据等级）。
- `review` 记录 + 哈希绑定；`promote` + lockfile。
- 在 `router-homes` 生成 5 页，全部走完 review/promote。

**验收**：5 页中至少 3 页通过 review；1 页故意无来源被拒；review 后改正文会使 review 失效；promote 后构建通过。

### Phase 4：CI/CD + Pages（1.5 天）

- 变更检测/矩阵、产物 artifact、部署脚本、secrets、concurrency、回滚演练。
- 预览部署（可选）。

**验收**：只改一站只构建/部署该站；改 docs-kit 触发依赖站；未启用站不部署；产物校验拦截错误 commit/mode。

### Phase 5：SEO/质量门禁（1.5 天）

- dedup、independence、canonical、sitemap、robots、llms.txt、链接、smoke。
- GSC 验证清单、分析脚本、404、隐私/免责页面。

**验收**：每站 sitemap 只含本站；canonical 正确；dedup/独立性门禁可复现；链接 0 死链。

### Phase 6：首发 5 站（内容 + 评审，1–2 周）

- 每站 8–12 页，全部走 AI pipeline + 人工 review。
- canary 发布 1 站，观察 2–4 周；再扩到 5 站。

**验收**：5 站上线；每站 ≥ 8 页；review 覆盖率 100%；GSC 有索引；无 dedup 阻断。

### Phase 7：扩到 10–20 站（工程 1–2 天 + 持续内容）

- CI 分片、缓存、runbook、监控、内容审计。
- 站点生命周期（新增/下线/301）。

**验收**：10 站全量构建在目标时间内；部署矩阵全绿；回滚演练成功；内容审计有报告。

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| AI 幻觉/无来源断言 | 信任与 SEO 受损 | claims/证据门禁；人工 review；无来源拒绝 |
| 多站同质化/ doorway | 不收录、拖累主站 | dedup + 独立性门禁；一查询一 primary；canary |
| 评审瓶颈 | 发布停滞 | 每批评审上限；清单化；模板；先 5 页/站 |
| AI 成本/配额 | 预算超支 | 每站/每日 cap；token 预算；失败不无限重试 |
| 模型/提示词漂移 | 输出质量波动 | 版本固定；回归 brief 集；升级前对比 |
| 来源版权/引用 | 法律风险 | 只引短引用；标注来源；不复制全文；白名单 |
| 提示注入 | 生成被污染 | 来源视为数据；系统提示隔离；输出 schema 校验 |
| Astro/Starlight 升级 | 全站回归 | catalog 锁版本；staging 站 canary；逐站升级 |
| 构建扇出 | CI 超时/成本 | 受影响构建；Turbo 缓存；CI 分片 |
| Pages 100 项目上限 | 扩站受限 | 20 站内无碍；接近上限转 VPS/分账号 |
| 部署误发 | 候选/草稿上线 | 产物盖章 + mode/site/commit 校验 |
| 密钥泄露 | 供应链风险 | secrets 只给 deploy；最小权限 token |
| 域名/DNS/TLS 运维 | 上线延迟 | 上线清单；每站自定义域名验收；证书检查 |

---

## 8. 运营模型

### 8.1 角色

- **Operator**：写 brief、跑批量生成、跑检查、promote、部署。
- **Reviewer**：事实/来源/独特性/合规审核；不能由 AI 代签。
- **Deployer**：合并、部署、回滚；可兼 operator，但生产发布需 review 记录。

### 8.2 节奏

- 周一：确定本周 brief（每站 ≤ 5 页）。
- 周二–周四：生成 + 自动检查 + 人工 review。
- 周五：canary 发布 1 站；观察；下周扩站。
- 每月：内容审计（重复/过期/断链/低质）；GSC 复盘。
- 每季度：版本升级 + 全站回归。

### 8.3 指标

- 发布页数、review 通过率、平均 review 时间。
- 站点 unique ratio、跨站重复对数。
- GSC 索引率、曝光、点击、查询匹配。
- 构建时间、部署成功率、回滚次数。
- 404/死链数、Lighthouse/axe 分数。

### 8.4 Runbook

- 部署失败：停止剩余站；检查 artifact；重跑或回滚上一 deployment。
- 内容事故：git revert 页面 + 重新构建部署；必要时 410/301。
- 索引异常：检查 canonical/robots/sitemap；提交 GSC；暂停该站批量发布。
- 域名/TLS：检查 Pages custom domain/DNS；证书状态；回归检查。

---

## 9. Codex review 检查点

- 架构是否真的匹配“各站内容独立”；monorepo 的边界是否清晰。
- AI 流水线是否可执行、可审计；状态机/哈希/评审是否闭环。
- 去重与独立性阈值是否有依据；是否能防止跨站同质化。
- Phase 验收是否可测量；10–12 人日估算是否现实。
- CI 在 10–20 站时是否超时/超限；部署回滚是否完整。
- 安全/合规：secrets、版权、PII、提示注入、来源白名单。
- 是否过度设计：v1 是否需要全部 C1–C10、G0–G8；哪些可以延后。
- 是否遗漏：DNS/TLS、GSC、分析、隐私页、内容下线、备份。

---

## 10. 待 Codex review 后确认的开放点

1. AI 流水线 MVP 是否应再缩到“brief + 5 项检查 + review + promote”，把 dedup/independence 放到 Phase 5？
2. 首发 5 站是否太多；是否先 1 站 10 页跑通再复制？
3. 10–20 站 CI 用“单 turbo build + 按站部署”还是“矩阵逐站构建”，需要实测后定。
4. 是否需要为 `router.homes` 这类技术站引入 E2/E3 实测证据，还是先 E1 + 人工标注“未实测”。
5. 内容包在 AI 批量生成场景下是否会被滥用；是否需要默认禁用、逐页审批。
