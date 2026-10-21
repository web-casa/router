# Router.Homes Pages 部署记录

## 当前状态

- 状态：`placeholder-deployed`
- Cloudflare Pages 项目：`router-homes`
- 账号：项目所属的 Cloudflare 账号
- 首次生产部署：`212fc100-eb06-45d4-b0bb-d88e52f515e7`
- 生产别名：https://router-homes.pages.dev/
- 部署别名：https://212fc100.router-homes.pages.dev/
- 域名：`router.homes` 仍在 Spaceship NS（`launch1/2.spaceship.net`），**未绑定 Cloudflare Pages**
- 生产内容：仅 noindex golden placeholder；没有部署 `sites/router-homes/dist`

## 产物

- 目录：`deploy/golden-placeholder/`
- 文件：`index.html`、`404.html`、`_headers`、`robots.txt`、`favicon.svg`
- 文件摘要（对 `sha256sum` 列表再取 SHA-256）：
  `852fc3a43e9996f7e1224505cbd6595311b7259eac0e54a2b3dd1fa403dc54d4`
- 首屏为占位说明；无站点导航、无文章内容。

## 验收

使用固定解析（本机 `curl` 对该域名的系统 DNS 不可用，`dig @1.1.1.1` 正常）：

```bash
curl -sSI --resolve router-homes.pages.dev:443:172.66.44.156 \
  https://router-homes.pages.dev/
```

结果：

- `/`：HTTP/2 200
- `x-robots-tag: noindex, nofollow`
- `cache-control: no-store`
- `/robots.txt`：`User-agent: *` / `Disallow: /`
- `/en/`：HTTP 404，`x-robots-tag: noindex, nofollow`
- `/zh/`、`/network/dns/`：404；没有内容泄漏

注意：部署别名 `212fc100.router-homes.pages.dev` 在本机测试时出现 TLS handshake failure，但生产别名验收正常；绑定域名后用正式主机重新验收。

## GitHub Actions

- `.github/workflows/pages-placeholder.yml`：手动重发 noindex placeholder，使用 `cloudflare/wrangler-action@v3`。
- `.github/workflows/pages-content.yml`：手动、二次确认、受仓库变量 `PAGES_CONTENT_ENABLED=true` 保护；仅在域名绑定并验收后使用。
- 需要的仓库 secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。
- 需要的手动变量：`PAGES_CONTENT_ENABLED`（默认不设置）。
- 当前仓库没有配置 git remote，因此 workflow 文件已写入但还没有推送到 GitHub。

## 回滚

- 回滚到本次 placeholder：Cloudflare Pages 项目 → Deployments → `212fc100-...` → Rollback；或手动重跑 `pages-placeholder.yml`。
- 不要用 `sites/router-homes/dist` 覆盖生产，直到域名绑定、TLS/apex/www/根 301 验收完成。

## 下一步：绑定

1. 在 Cloudflare 添加 `router.homes` zone（把 Spaceship NS 改为 Cloudflare NS，先备份现有 DNS/MX/TXT）。
2. Pages 项目 → Custom domains → 添加 apex `router.homes` 和 `www.router.homes`（明确唯一 canonical 主机）。
3. 验证 TLS、apex/www、`/` 根 301、`/en/`、`/zh/`、404、`x-robots-tag`。
4. 绑定验收后，才设置 `PAGES_CONTENT_ENABLED=true` 并手动跑 `pages-content.yml`；首次内容部署前保留 placeholder 作为回滚目标。
5. live 后把 `router-homes.pages.dev/*` 301 到正式域名，避免双主机收录。
