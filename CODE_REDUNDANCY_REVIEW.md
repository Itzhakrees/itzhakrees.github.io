# 仓库冗余代码审查报告

审查日期：2026-07-20  
审查范围：HTML、CSS、JavaScript、内容构建脚本、内容元数据、静态资源和 GitHub Pages 工作流。  
审查方式：静态引用检索、生成链路追踪、CSS 类名使用扫描、项目图片引用核对。本报告只提出建议，没有修改业务代码。

## 结论摘要

当前仓库的内容组织和构建链路总体清晰，主要冗余来自早期模板/旧版实现残留，以及同一规则同时存在于构建端和浏览器端。

建议优先处理：

1. 删除未被任何页面加载的旧版 `js/content.js`。
2. 让“已发布项目筛选与排序”只在构建阶段执行，删除浏览器端的重复逻辑和生成数据中的 `status`。
3. 删除详情页中永远不会启用的 `marked + DOMPurify` 分支，或真正引入这两个依赖；不要维持当前的半接入状态。
4. 清理没有消费者的生成字段、站点字段和旧模板样式。
5. 将中英文 Markdown 中重复的项目级 frontmatter 改为单一数据源，避免两份元数据漂移。

## 建议清单

### R1（高）：删除未加载的旧版内容数据文件

- 位置：`js/content.js:1-217`
- 证据：首页只加载 `js/content.generated.js` 和 `js/script.js`（`index.html:111-112`）；项目页模板只加载 `js/content.generated.js` 和 `js/project.js`（`templates/project.html:67-68`）。全仓库没有对 `js/content.js` 的脚本引用。
- 影响：该文件保留了一套已经过期的 UI、项目、研究和设计文档数据，与 `data/site.json`、项目 Markdown 及生成文件形成第二套事实来源；继续维护容易误改。
- 建议：直接删除 `js/content.js`。删除前只需确认没有仓库外页面手动引用它。
- 验证：本地打开首页和任一项目页，确认内容仍由 `js/content.generated.js` 正常提供。

### R2（高）：移除浏览器端重复的发布筛选和排序

- 位置：`scripts/build-content.mjs:259-269`、`scripts/build-content.mjs:185`、`js/script.js:149-156`
- 证据：构建脚本只把 `status === "published"` 的项目加入输出，并已按 `order`、`date` 排序；首页收到生成数据后又检查一次 `status` 并再次执行同样的排序。
- 影响：同一业务规则维护两份；以后修改排序规则时可能出现构建结果与浏览器显示逻辑不一致。
- 建议：保留构建阶段的筛选和排序，删除 `js/script.js:150` 的 `status` 过滤和 `js/script.js:152-156` 的排序；同时不再向生成对象写入 `status`（`scripts/build-content.mjs:185`）。`featured` 过滤仍可保留，或也移到构建阶段，但应只选择一处负责。
- 验证：执行 `npm run build` 后，比较首页项目顺序和筛选结果。

### R3（高）：处理永远不会启用的 Markdown 库分支

- 位置：`js/project.js:280-285`
- 证据：代码检查 `window.marked` 和 `window.DOMPurify`，但首页、项目模板、包依赖和仓库其他文件都没有加载 `marked` 或 `DOMPurify`，因此当前始终进入 `renderBasicMarkdown` 分支。
- 影响：形成不可测试的死分支，阅读代码时会误以为站点使用第三方解析与净化库。
- 建议（二选一）：
  1. 如果自有解析器满足内容需求，删除 `canUseMarkdownLibrary` 分支，直接调用 `renderBasicMarkdown`；这是当前最小改动。
  2. 如果需要完整 Markdown 语法和更成熟的净化能力，正式安装/加载并固定版本，然后删除自有解析器。此方案改动和验证范围更大。
- 验证：覆盖标题、列表、表格、图片、`[TOC]`、视频短代码和允许的内嵌 HTML。

### R4（高）：清理无消费者和可派生的生成字段

- 位置：`scripts/build-content.mjs:166-176`、`scripts/build-content.mjs:183-200`、`js/script.js:51-101`、`js/project.js:304-312`
- 明确未使用：`contentBase`（`scripts/build-content.mjs:190`）生成后没有任何运行时代码读取。
- 可直接派生：
  - `ariaLabel` 等于 `title + summary`，设计文档卡片已经在浏览器端采用这种计算方式（`js/script.js:111`）。
  - `assetBase` 等于 `content/projects/{id}/`，`js/project.js:309` 已有完全相同的回退计算。
  - `markdownBase` 也可由 `id` 推导为 `content/projects/{id}/index`。
- 影响：生成数据体积虽不大，但字段越多，构建端与消费端的契约越复杂。
- 建议：先删除完全未使用的 `contentBase`；再决定路径和无障碍标签统一在构建端还是消费端计算，避免同时保留“字段 + 同值回退逻辑”。
- 验证：重新构建后检查项目卡片 `aria-label`、中英文 Markdown 请求地址和正文内相对资源链接。

### R5（中）：合并首页与详情页重复的公共交互代码

- 位置：`js/script.js:1-18`、`js/script.js:223-252`、`js/script.js:270-280`；`js/project.js:1-18`、`js/project.js:408-435`、`js/project.js:437-447`
- 重复内容：DOM 查询、`currentLanguage` 初始化、`getLocalizedContent`、普通文本和 ARIA 文案应用、语言按钮状态、本地存储、移动导航开关与关闭逻辑。
- 影响：语言或导航行为修复时需要同步修改两个入口。例如两份 `applyLanguage` 已经存在细微差异，后续更容易继续分叉。
- 建议：抽出一个小型 `js/common.js`，负责语言状态、通用文案和导航；页面脚本只注册各自的渲染回调。不要为了复用引入大型框架。
- 验证：首页和项目页分别测试首次加载、语言切换、移动菜单打开/关闭，以及语言偏好的跨页保持。

### R6（中）：删除或接通未使用的站点数据

- 位置：`data/site.json:2-7`、`data/site.json:13`、`data/site.json:36-38`、`data/site.json:50`、`data/site.json:73-75`、`scripts/build-content.mjs:274`
- 未使用字段：
  - `profile` 被复制进生成文件，但没有任何浏览器代码读取；首页联系方式仍硬编码在 `index.html:68-70`。
  - `navHome` 没有对应的 `data-i18n` 节点。
  - `docsEyebrow`、`docsTitle`、`docsIntro` 没有对应的首页区块；设计文档目前已经合并进项目网格。
- 建议：
  - 若联系方式准备数据驱动，则补全 `profile` 并让首页读取；否则删除 `profile` 及生成逻辑。
  - 删除没有消费者的 UI 键。
  - 项目页的 `navDesignDocs` 链接目前指向不存在的 `#design-docs`（`templates/project.html:44`）；应删除该导航项，或改为真实存在的入口，而不是继续保留失效锚点。
- 验证：中英文首页和项目页逐个检查导航文字、链接目标和联系方式。

### R7（中）：移除无效果的 `visualClass` 元数据层

- 位置：`scripts/build-content.mjs:81`、`scripts/build-content.mjs:186`、`js/script.js:55`、全部 `content/projects/*/index.*.md` 的 `visualClass`
- 证据：当前值为 `systems-card`、`level-card`、`puzzle-card`，但 CSS 中没有这些类的规则；把它们加到卡片元素上不会产生任何样式。
- 影响：每个语言文件都必须填写一个没有效果的字段，构建脚本还会验证、生成并消费它，形成“看似可配置、实际无作用”的接口。
- 建议：若没有按卡片类型定制整体样式的计划，删除 `visualClass` 的必填校验、生成字段、客户端拼接和全部 frontmatter 值。若确实需要该能力，则先添加明确样式并记录允许值。
- 关联问题：`25Tencent-Training` 的 `coverClass` 当前也是 `level-card`，而现有背景类名为 `.level-cover`（`css/style.css:277-283`）。这是命名漂移；应改为 `level-cover`，或删除不用的 `.level-cover`。
- 验证：对比三类项目卡片的封面图与无图回退背景。

### R8（中）：合并和删除 CSS 中的重复/模板残留规则

- 重复声明：
  - `.project-visual` 分散在 `css/style.css:243-250` 与 `css/style.css:327-331`，其中 `background-position`、`background-size` 重复；应合并为一个规则块。
  - `.text-link` 在 `css/utilities.css:134-142` 和 `css/style.css:149-160` 重复定义相同的颜色、字重、下划线行为；保留一处即可。
- 无引用模板规则：
  - `css/utilities.css:67-80` 中的 `.about-grid`、`.about-copy`、`.contact-panel`。
  - `css/utilities.css:91-132` 中整组 `.btn`、`.btn.primary`、`.btn.secondary`、`.btn.compact`。
  - `css/utilities.css:13` 的 `--clay` 变量当前没有引用。
- 证据：HTML、模板、JS 动态类名和内容元数据的静态扫描均没有发现上述模板类名的消费者。
- 建议：先删除无引用规则；如果近期确定会恢复 About/Contact/按钮区块，则建立对应任务而不是长期保留不可验证的预留 CSS。
- 验证：对首页和详情页做桌面、平板、手机三档视觉回归。

### R9（中）：消除中英文 frontmatter 的项目级元数据复制

- 位置：`scripts/build-content.mjs:69-87`、`scripts/build-content.mjs:179-200`、`scripts/build-content.mjs:251-257`，以及每个项目的 `index.en.md` / `index.zh.md` 开头。
- 现状：`status`、`featured`、`order`、`cover`、`visualClass`、`coverClass`、`tags`、`filters`、`tools`、`date` 等项目级字段在两个语言文件中各保存一份；输出却主要采用英文文件的值。构建只校验 `status` 和 `filters` 相等，其他字段发生漂移时不会报错。
- 影响：添加或调整项目时必须重复编辑；单边修改可能静默失效。
- 建议：把共享字段移到每个项目唯一的 `project.json`/`project.yaml`，语言 Markdown 仅保留 `lang`、`title`、`role`、`summary`、`description` 和正文。若暂不重构文件结构，至少集中声明共享字段清单，并逐项校验中英文一致。
- 验证：为任一共享字段制造不一致，确保构建失败；再恢复数据并确认生成结果一致。

### R10（低）：精简部署制品中的无用目录

- 位置：`.github/workflows/pages.yml:34-46`
- 现状：工作流尝试复制 `assets content css data img index js projects`。其中 `data/` 只在构建阶段读取，浏览器不读取；`index/` 没有受版本控制的文件；全局 `img/` 目前只有未引用的 `img/1.jpg`。
- 建议：在确认没有外部直链后，从发布列表移除 `data`、`index`；删除 `img/1.jpg` 后再移除 `img`。进一步可只发布已发布项目对应的 `content/projects/*`，避免草稿 Markdown 也进入公开制品，但这需要构建脚本生成发布清单，属于独立优化。
- 验证：从干净检出执行 Pages 构建，检查首页、项目 Markdown、项目图片、简历和设计文档 PDF。

### R11（低）：清理未引用资源和已经失去作用的占位文件

- 可删除候选：
  - `img/1.jpg`：27,438 字节，全仓库无引用。
  - `content/projects/25Tencent-Training/img/.gitkeep`
  - `content/projects/MPC/img/.gitkeep`
  - `content/projects/Slackoff/img/.gitkeep`
- 原因：后三个目录已经包含真实图片，`.gitkeep` 不再承担保留空目录的作用。`content/projects/Phobos/img/.gitkeep` 所在目录仍为空，可暂时保留。
- 说明：本次核对发现其余项目图片均至少被对应中英文 Markdown 或封面字段引用，没有把正常内容图片列为冗余。
- 验证：删除候选后运行构建并抽查项目图片；确认没有仓库外 URL 直接依赖 `img/1.jpg`。

### R12（低）：避免 README 与内容指南重复维护

- 位置：`README.md:5-101` 与 `CONTENT_GUIDE.md`
- 现状：目录结构、frontmatter、图片规则、构建命令、新增项目步骤和草稿规则在两份文档中重复。
- 影响：字段变更时需要同步修改两处；当前文档已容易与实际实现发生偏差，例如 `visualClass` 是否仍应存在。
- 建议：README 只保留项目简介、快速启动和指向 `CONTENT_GUIDE.md` 的链接；完整内容维护规范只放在指南中。

## 不建议当作冗余删除的内容

- `js/content.generated.js`：虽然内容来自 `data/site.json` 和 Markdown，但静态页面运行时直接依赖它。
- `projects/*/index.html`：虽然由模板生成，但它们提供静态托管所需的项目入口和可访问 URL。
- `content/projects/*/img/*`：除上文单列的占位文件外，现有真实图片均有内容引用。
- `templates/project.html`：它是项目页生成的唯一模板，不是生成页面的重复副本。

## 推荐执行顺序

1. 先做无行为变化的清理：R1、R4 中的 `contentBase`、R8、R11、R12。
2. 再统一构建/运行时职责：R2、R3、R6、R7。
3. 最后做结构性重构：R5、R9、R10 中的“只发布已发布内容”。
4. 每一批修改后执行 `npm run build`，再通过本地 HTTP 服务检查首页和至少一个中英文项目页。

