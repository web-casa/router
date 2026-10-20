# 40 查询搜索验收（Pagefind UI）

日期：2026-10-20
状态：通过（40/40，Top 5）

## 环境

- OpenWrt 文档站：Starlight 0.42.6，Pagefind 1.5.2，23 个 HTML 页面（11 个中文 + 11 个英文 + 404）。
- Node 24.21.0；Chromium 149.0.7827.102；`playwright-core 1.64.1`。
- 本地静态服务器 + 真实浏览器；不是只测 JSON 索引文件。

## 方法

1. `pnpm build` 生成 `sites/router-homes/dist` 和 Pagefind 双语索引。
2. 启动本地静态服务器，Chromium 打开 `/zh/` 或 `/en/`。
3. 打开 Starlight 搜索弹窗，向 Pagefind UI 输入查询，等待防抖/结果。
4. 取前 5 个唯一页面链接（去掉重复子结果/锚点），检查预期 URL 是否在 Top 5。
5. 40 条查询：20 中文 + 20 英文；21 条标记为 alias/symptom 场景。
6. 结果写入 `tests/search/last-run.json`；失败时退出码非 0。

## 结果

- 40/40 通过，0 失败。
- 20/20 中文、20/20 英文。
- 21/21 alias 场景通过。
- 所有查询均通过真实 Pagefind UI，包含自定义 `processTerm` 查询扩展。

## 已知分词限制与处理

Pagefind 1.5.2 的 `zh-cn` 分词器对部分双字词不稳定：`国内` 可搜，但 `镜像`、`国内镜像`、`镜像站` 直接搜索会返回 0。内容里即使有这些词也一样。

处理：

- `src/components/Search.astro` 覆盖 Starlight 内置搜索，给 Pagefind UI 加 `processTerm`：
  - `国内镜像` → `mirror`
  - `镜像站` → `mirror`
- 页面正文加入可见的 `mirror` 解释，保证扩展后的词能命中。
- 这不等于修好分词；`镜像` 单独搜索仍可能为 0。后续应：
  - 给 `镜像` 做上下文判断（系统镜像 vs 软件源镜像），或
  - 升级 Pagefind 后重测，或
  - 增加同义词/查询扩展表。

## 变更

- `tests/search/queries.json`：40 条查询契约。
- `scripts/checks/search.ts`：Playwright + Pagefind UI 验收。
- `sites/router-homes/src/components/Search.astro`：Starlight Search 覆盖 + `processTerm`。
- `sites/router-homes/site.meta.ts`：`components.Search` 指向覆盖组件。
- 依赖：`playwright-core`（根）、`@pagefind/default-ui`（站点，提供 UI/CSS）。

## 运行

```sh
# 构建并跑 40 条
pnpm test:search

# 已有 dist 时只跑测试
pnpm test:search:only
```

`CHROME_PATH=/path/to/chrome` 可覆盖浏览器路径。

## 限制

- 只测搜索弹窗和 Top 5 命中，不测排序质量、搜索性能、键盘可访问性。
- 40 条是人工契约，不是全站查询日志；没有负样本/无结果断言。
- 覆盖组件复制自 Starlight 0.42.6；升级 Starlight 时需要重新对比 `Search.astro`，避免丢失上游修复。
- 查询扩展只覆盖 `国内镜像`/`镜像站`，不是通用同义词系统。
