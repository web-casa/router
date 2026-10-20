# Phase 0 验收报告（2026-10-20）

## 范围

- pnpm workspace + `fleet.config.json` + `@fleet/docs-kit` 配置工厂。
- `sites/router-homes`：Starlight 0.42 / Astro 7，无 `root` locale，显式 `/en/` + `/zh/`。
- 双语页面：首页、Overview、DNS、PVE（4 对 / 8 页）。
- 组件：`EnvCard`、`Step`、`TopologyTable`。
- 校验：`scripts/validate.ts`、`scripts/checks/i18n.ts`。

## 已通过

| 检查 | 结果 |
|---|---|
| `pnpm validate` | ✓ fleet 配置、站点目录、中英配对 |
| `pnpm check` | ✓ 构建 9 页；Pagefind 索引 9 个 HTML；sitemap 生成 |
| 根 `/` | ✓ `301 Location: /en/`（Wrangler Pages dev 实测） |
| `/en/`、`/zh/` | ✓ 200 |
| `/zh/only-en/` | ✓ 404（单语夹具已移出 `src/content/docs`） |
| 配对负例 | ✓ 临时加入 `en/only-en` 后 `pnpm validate` 退出 1；移除后通过 |
| canonical | ✓ EN `https://router.homes/en/network/dns/`；ZH `.../zh/network/dns/` |
| hreflang | ✓ `en`、`zh-CN`、`x-default`；成对页面双向 |
| sitemap | ✓ 只含成对页面，无 `only-en` |
| Pagefind | ✓ 生成 `zh-cn` 与 `en` 两个索引，各 4 页 |
| 构建耗时 | ~1.5s（9 页，Phase 0 规模） |

## 关键发现

1. **Starlight 无 root locale 可以显式 `/en/` + `/zh/`**。生成的 Astro i18n 为 `prefixDefaultLocale: true`；根路径不会自动跳转，`public/_redirects` 的 `/ /en/ 301` 在 Pages dev 下实测生效。
2. **Starlight 会为缺译内容生成 fallback**。把 `en/only-en/` 留在 `src/content/docs` 时，构建生成了 `/zh/only-en/`，并写入 canonical、hreflang、sitemap。因此 v1 规则改为：**单语页面只放 `content/drafts/`，不进入 `src/content/docs`**；`scripts/validate.ts` 在构建前强制中英文件配对。
3. **canonical/hreflang/sitemap 在成对页面上正确**。`x-default` 指向英文；中文 canonical 不指向英文。
4. **MDX 组件可用**，不需要在 Starlight 之前显式加 `mdx()` 集成；Starlight 自带 expressive-code/集成顺序，手动加 `mdx()` 会报 integration order 错误。
5. **Pagefind 生成双语索引**，但中文分词/召回尚未做查询级验收；40 条查询的浏览器/Playwright 测试留到 Phase 1。
6. Hero action 的 `icon` 必须是 SVG 字符串，不能用 `right-arrow` 名称；Phase 0 先移除以保证构建。

## 尚未完成

- DNS 已补成完整 E1 草稿（八段、`TestRecord`、来源、配方法）；PVE 已完成单网口 E2 实验（见 `docs/pve-e2-run.md`）；OpenClash、AdGuard Home、SQM 尚未创建。
- 40 条搜索查询的浏览器测试与阈值（40/40 非空、语种、别名 Top 1、预期 Top 3 ≥95%）。
- Pagefind extended 中文分词配置与查询扩展层。
- 域名绑定、golden placeholder、Pages 生产部署与回滚。
- 真实设备 E3 测试。
- `16 + 8` 第 2 周 gate 的耗时统计。

## 复现命令

```bash
pnpm install
pnpm validate
pnpm check
# 可选：Pages 本地路由/404
XDG_CONFIG_HOME=$PWD/.wrangler/config WRANGLER_HOME=$PWD/.wrangler \
  pnpm exec wrangler pages dev sites/router-homes/dist --port 8788
```

## 已知警告

- Starlight 构建提示 `i18n` collection 为空、`docs → 404` entry 未找到；`404.html` 仍正常生成，Phase 1 清理。
- `astro check` 已通过：0 errors / 0 warnings / 19 个 `z` 弃用 hints。pnpm isolated 下需在根 devDependencies 保留 `@emnapi/core`、`@emnapi/runtime`，否则 `@astrojs/check` 启动时会报缺包。
- 当前 Phase 1 的 DNS 页是 E1 草稿（`tested: false`），不是 E2/E3 结论；下一步按 `tests/recipes/dns-25.12-x86.md` 复现。
