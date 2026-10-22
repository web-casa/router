# OpenWrt 文章写作规范（v0.1）

每篇操作页按八段组织；所有已开放语言成对发布，单语页只放 `content/drafts/`，翻译中的页放 `content/translations/`。

1. **完成后你能确认什么**：读者完成后的可观察结果，不写“已配置”。
2. **适用环境**：固件项目/版本、设备修订、包管理器、已有网络；未知保持未知。
3. **DNS/接线/职责**：谁负责网关、DHCP、DNS、IPv6；画清物理口/接口/终端路径。
4. **改动前准备**：管理入口、备份、恢复方式和回滚命令。
5. **最小步骤**：每个 `<Step>` 标执行位置（路由器 Shell / LuCI / 电脑 / 手机）和预期结果。
6. **终端验证**：路由器 + 客户端分别验证；允许/阻断、IPv4/IPv6、应用启停/重启按需测试。
7. **失败分支与恢复**：错误原文、最小联网回退、管理入口恢复；不能只链接未发布页面。
8. **来源与复核**：官方链接、社区证据层级、实测环境/日期、修改原因。

## 证据等级

- E1：官方规格/文档，未在本站环境执行。
- E2：按固定配方在 OpenWrt x86 VM 复现。
- E3：真实设备/真实网络的实测结论；吞吐/覆盖/“我们实测”必须有 E3。
- `tested: false` 时不得写“已验证/已实测”；`TestRecord` 状态用 planned/partial/verified。

## 发布前检查

- 各语言文件与英文同名成对；`pnpm validate` 通过。
- `pnpm check` 通过；canonical/hreflang/sitemap 正确。
- 操作步骤有执行位置与预期结果；有恢复路径。
- 事实断言有来源；社区 index-only 不能当证据；无来源写“未核实/未实测”。

## 翻译规范（ADR-019）

适用于 `zh-hant`、`ja`、`es`、`de`、`fr`。**英文是唯一翻译源**，繁体中文也从英文翻，不从简体转换；`zh` 是历史语言，不要求 `sourceHash`。

**目录与状态**

- 翻译中：`content/translations/<locale>/<与英文相同的相对路径>`，不要放进 `src/content/docs`（会让 Starlight 生成 fallback 页）。
- 查看进度：`pnpm i18n status [locale]`；翻完或重译后：`pnpm i18n stamp <locale> [文件…]` 写入 `sourceHash`。
- 一种语言所有页面都 `fresh` 才能 `pnpm i18n promote <locale>`；该命令还会检查侧边栏翻译。

**翻译前**

1. 读 `docs/i18n/glossary/<locale>.json`。`official: true` 的词必须照用；`verify: true` 的词在 LuCI 里核对一次；`official: false` 的词保留英文，首次出现可附括号注释。
2. 术语表由 `pnpm i18n glossary <locale>` 从 LuCI `.po` 重新生成，词表在 `docs/i18n/luci-terms.json`；正文出现新的 LuCI 菜单/按钮名时先补进词表。

**不翻译**：代码块、命令、路径、配置键、包名、MDX 组件名和属性名、`sources` 的 URL、`testRecipe`、版本号、`evidenceLevel`、`testedVersions`。
**要翻译**：`title`、`description`、`aliases`、`symptoms`、`sources[].label`、`testEnvironment`、正文、组件中的文字属性。

**质量**

- 不增删事实断言，不改证据等级；英文写“未实测”的，译文也必须是“未实测”。
- 每种语言抽检：R1/R2 页和含恢复命令的页面（`recovery/*`、`troubleshooting/*`）由母语者或第二次独立审读。
- 英文源页一改，`sourceHash` 就失效：同一批改动里重译并 stamp，否则 `pnpm check` 失败（已开放语言）或在 `translations` 检查里告警（翻译中语言）。

**开放新语言前还要做**：`Home`/`Hero`/`Footer`/`Step`/`TestRecord`/`EnvCard`/`PageSources`/`TerminalCast`/`Search` 及 `download/devices.ts` 目前只有英文和简体中文两套文案；补全该语言文案、`site.meta.ts` 侧边栏 `translations`、`tests/search/queries.<locale>.json` 后才能 promote。
