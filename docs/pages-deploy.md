# Router.Homes Pages 部署记录

## 当前状态

- 状态：`content-deployed-pages-dev`
- Cloudflare Pages 项目：`router-homes`
- 账号：项目所属的 Cloudflare 账号
- 当前生产部署：`b03da577-df0a-4a3c-a32f-0b42b4e27aef`（source `bee9a95`）
- 生产别名：https://router-homes.pages.dev/
- 部署别名：https://b03da577.router-homes.pages.dev/（Cloudflare 会给该别名加 `x-robots-tag: noindex`）
- 当前 preview：`2e2e18f3-6a3c-4681-bed9-8ff61b210c1f` → https://preview.router-homes.pages.dev/（preview 自动 noindex）
- 域名：`router.homes` 仍未绑定 Cloudflare Pages；DNS 仍解析到 `54.149.79.189`，TLS 不通过
- 生产内容：`sites/router-homes/dist`，75 个页面索引 + 404；`/` 301 `/en/`
- 生产别名 HTTP 响应没有 `x-robots-tag: noindex`；canonical 仍指向 `https://router.homes/...`

## 历史 placeholder

- 目录：`deploy/golden-placeholder/`
- 文件：`index.html`、`404.html`、`_headers`、`robots.txt`、`favicon.svg`
- 文件摘要（对 `sha256sum` 列表再取 SHA-256）：
  `852fc3a43e9996f7e1224505cbd6595311b7259eac0e54a2b3dd1fa403dc54d4`
- 首次 placeholder 生产部署：`212fc100-eb06-45d4-b0bb-d88e52f515e7`
- 保留用于回滚；已不是当前生产内容。

## 验收

2026-10-22 直接使用 Wrangler OAuth 部署（无 git remote）：

```bash
pnpm exec wrangler pages deploy sites/router-homes/dist \
  --project-name router-homes --branch main --commit-dirty=true
```

生产结果：

- `/`：HTTP 301 → `/en/`
- `/en/`：200
- `/zh/`：200
- `/zh/network/dns/`：200
- `/zh/download/`：200
- `/zh/features/openwrt-25-12/`：200
- 生产别名 `router-homes.pages.dev`：无 `x-robots-tag: noindex`
- preview 和 hash 部署别名：Cloudflare 自动返回 `x-robots-tag: noindex`
- `robots.txt`：当前是 Cloudflare 的默认 content-signals 文本，没有自定义规则；需要时再补正式 robots/sitemap
- canonical 仍指向 `https://router.homes/...`，在域名绑定前不要把 pages.dev 当作最终 SEO 主机

内容风险：feature/download 页是 E1 文档页，不是实测页；生产发布不等于 E2/E3 验收。

## GitHub Actions

- `.github/workflows/pages-placeholder.yml`：手动重发 noindex placeholder，使用 `cloudflare/wrangler-action@v3`。
- `.github/workflows/pages-content.yml`：手动、二次确认、受仓库变量 `PAGES_CONTENT_ENABLED=true` 保护；仅在域名绑定并验收后使用。
- 需要的仓库 secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。
- 需要的手动变量：`PAGES_CONTENT_ENABLED`（默认不设置）。
- 当前仓库没有配置 git remote，因此 workflow 文件已写入但还没有推送到 GitHub。

## 回滚

- 回滚到 placeholder：Cloudflare Pages 项目 → Deployments → `212fc100-...` → Rollback；或重跑 `pages-placeholder.yml`。
- 回滚到当前内容前的状态：当前生产部署 `b03da577-...` 之前是 placeholder。
- 不要删除 preview/placeholder 部署记录，保留验收和回滚证据。

## 下一步：绑定与收尾

1. 在 Cloudflare 添加 `router.homes` zone（把 Spaceship NS 改为 Cloudflare NS，先备份现有 DNS/MX/TXT）。
2. Pages 项目 → Custom domains → 添加 apex `router.homes` 和 `www.router.homes`；明确唯一 canonical 主机。
3. 验证 TLS、apex/www、`/` 根 301、`/en/`、`/zh/`、404、`x-robots-tag`。
4. 绑定后补正式 `robots.txt` 与 sitemap 指令，并重新验收 canonical。
5. 设置仓库变量 `PAGES_CONTENT_ENABLED=true`，推送 remote 后手动跑 `pages-content.yml`，把后续发布交给 CI。
6. live 后把 `router-homes.pages.dev/*` 301 到正式域名，避免双主机收录。
