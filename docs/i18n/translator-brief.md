# 翻译 brief（给翻译 agent / 会话）

源语言固定为英文：`sites/router-homes/src/content/docs/en/<path>`。译文写到 `content/translations/<locale>/<同路径>`（目录自行创建）。先读 `docs/writing-guide.md` 的“翻译规范（ADR-019）”和 `docs/i18n/glossary/<locale>.json`。

## 结构必须一致
- frontmatter 键与顺序、`import`、MDX 组件及属性名、标题（`##`）顺序、表格、代码块数量都与英文相同。不增删事实，不改证据等级、版本、日期、“未实测”之类的声明。
- 不要自己写 `sourceHash`；写完用 `pnpm i18n stamp <locale> <相对路径…>` 生成，再用 `pnpm i18n status <locale>` 确认这些文件是 fresh。

## 翻译
`title`、`description`、`aliases`、`symptoms`、`sources[].label`、`testEnvironment`、正文、表格文字、组件里给人看的文字属性（如 `<Step title expected>`、`TestRecord` 的 `environment`/`result`、`Figure` 的 `alt`/`caption`、`TerminalCast` 的 `title`/`caption`、`EnvCard` 里给人看的 `device`）。
`aliases` 要写目标语言用户真的会搜的说法（保留常见英文关键词，如 `openwrt dns`）。

## 不翻译
代码块与行内代码、命令、路径、配置键、包名、URL、`testRecipe`、版本号、`pageType`、`evidenceLevel`、`testedVersions`、`lastVerifiedAt`、`tested`、`Step` 的 `where`、`EnvCard` 的标识类属性。
LuCI 包名 `luci-i18n-base-zh-cn` 与 LuCI 里显示的语言名 `简体中文` 保持原样。

## 术语
0. 反引号里的 **LuCI 界面标签**（如 `Static address`）属于界面文字，按术语表翻译；反引号里的命令、路径、配置键、包名不翻。ASCII 示意图里的说明文字可以翻译。
1. 术语表中 `official: true`（含 `verify: true`）的词必须照用；`official: false` 的词保留英文，首次出现可加括号注释。
2. 菜单路径 `Network → Interfaces → LAN → Edit` 逐段按术语表翻译，保持 ` → ` 分隔和粗体样式；术语表没有的界面词保留英文并在最终回复里列出。
3. 参考同路径的简体中文页 `docs/zh/<路径>` 了解原作者如何处理菜单路径和概念，但必须从**英文**翻译，不要照搬中文。

## 链接
正文中指向站内页面的链接 `/en/...` 改成 `/<locale>/...`；外部链接不动。

## 风格
技术文档语气，简洁，命令式步骤；一致地使用同一种称呼（见各语言补充）。不要添加解释性内容或“译者注”。

## 不要动
不要修改 `content/translations/<locale>/` 之外的任何文件，不要运行 git。

## 最终回复
每个文件一行“done”，再列出不确定的术语（最多 10 行）。
