# Router.Homes

[English](#english) · [简体中文](#简体中文)

## English

OpenWrt documentation for real home networks: DNS, Proxmox, IPv6, VLAN, WireGuard, SQM, recovery and troubleshooting. Each page states the firmware, device, package manager and the way back, and carries an evidence level (E1 official docs, E2 reproduced in a lab VM, E3 real device).

The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build) and published to Cloudflare Pages.

**Languages:** English (`/en/`, source), 简体中文 (`/zh/`), 繁體中文 (`/zh-hant/`), Español (`/es/`), Deutsch (`/de/`), Français (`/fr/`), 日本語 (`/ja/`). English is the only translation source. A language is published only when every page is translated; there is no fallback to English.

### Quick start

Requires Node.js 22.22+ and pnpm 9.

```sh
pnpm install
pnpm dev        # local dev server
pnpm check      # validate, type-check, build and run the i18n checks
pnpm test:search  # Pagefind acceptance tests in a real browser (needs Chromium)
```

### Layout

| Path | What it is |
|---|---|
| `sites/router-homes/` | The Astro/Starlight site: content in `src/content/docs/<locale>/`, components, theme |
| `packages/docs-kit/` | Shared config: locale catalog, fleet config schema, Starlight setup |
| `fleet.config.json` | Site and locale configuration (`locales` lists published languages only) |
| `content/translations/` | Translations in progress, kept out of the build until a language is complete |
| `docs/` | Writing guide, translator brief, LuCI glossaries, test and deployment notes |
| `tests/` | Lab test recipes and search acceptance queries |
| `scripts/` | Validation, i18n tooling and checks |

### Translating

Design: ADR-019 in [`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md). Read [`docs/i18n/translator-brief.md`](docs/i18n/translator-brief.md) and the language's glossary in `docs/i18n/glossary/` first. UI terms follow LuCI's official translations.

```sh
pnpm i18n status [locale]            # per-page state: fresh / stale / unstamped / missing
pnpm i18n stamp <locale> [files…]    # record the source hash after translating
pnpm i18n glossary [locale]          # rebuild a glossary from LuCI .po files
pnpm i18n promote <locale>           # publish a locale once every page is fresh
```

When an English page changes, its translations become stale and `pnpm check` fails until they are retranslated and stamped.

### Writing

See [`docs/writing-guide.md`](docs/writing-guide.md) for the page structure, evidence levels and pre-publish checks.

### License

No license has been chosen yet, so all rights are reserved by default. Please open an issue before reusing the content.

## 简体中文

面向真实家庭网络的 OpenWrt 文档：DNS、Proxmox、IPv6、VLAN、WireGuard、SQM、恢复与故障排查。每页写明固件、设备、包管理器和恢复路径，并标注证据等级（E1 官方文档、E2 实验室虚拟机复现、E3 真实设备）。

站点使用 [Astro](https://astro.build) 与 [Starlight](https://starlight.astro.build) 构建，发布到 Cloudflare Pages。

**语言：** English（`/en/`，翻译源）、简体中文（`/zh/`）、繁體中文（`/zh-hant/`）、Español（`/es/`）、Deutsch（`/de/`）、Français（`/fr/`）、日本語（`/ja/`）。英文是唯一翻译源。一种语言所有页面都翻译完才会开放，不做英文回退。

### 快速开始

需要 Node.js 22.22+ 和 pnpm 9。

```sh
pnpm install
pnpm dev          # 本地开发服务器
pnpm check        # 校验、类型检查、构建并运行 i18n 检查
pnpm test:search  # 在真实浏览器里跑 Pagefind 搜索验收（需要 Chromium）
```

### 翻译

设计见 [`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md) 的 ADR-019。翻译前先读 [`docs/i18n/translator-brief.md`](docs/i18n/translator-brief.md) 和 `docs/i18n/glossary/` 里对应语言的术语表；界面用词对齐 LuCI 官方译名。

英文源页一改，译文就会过期，`pnpm check` 会失败，直到重译并执行 `pnpm i18n stamp`。

### 许可证

尚未选定许可证，因此默认保留所有权利。如需复用内容，请先提 issue。
