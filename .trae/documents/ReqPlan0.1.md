<br />

***

# 1. 目标概述 (Overview)

**功能名称：**
AI-Driven GitHub Portfolio System（数据驱动个人作品集系统）

**核心目标：**
构建一个基于 YAML 数据驱动的静态作品集网站，实现以下能力：

- 通过修改 `projects.yml` 自动更新项目展示
- 页面结构组件化，支持长期扩展
- 满足极简视觉规范（高对比 + 无冗余交互）
- 支持 CI/CD 自动部署（GitHub Actions）
- 对 AI 编辑友好（可安全追加/修改项目数据）

👉 最终用途：
作为**长期维护的个人技术展示平台 + AI 可协作编辑的工程样板**

***

# 2. 技术上下文 (Context & Environment)

**编程语言/版本：**

- TypeScript (ES2022)
- Node.js 18+

**框架/引擎：**

- Next.js（使用 SSG 静态生成）
- React
- 可选：Tailwind CSS（或纯 CSS Variables）

**部署环境：**

- Vercel 或 GitHub Pages

**现有结构：**

```plaintext
/components
  Header.tsx
  ProjectCard.tsx
  TechBadge.tsx
  Footer.tsx

/data
  projects.yml

/lib
  parser.ts

/pages
  index.tsx
```

***

# 3. 输入与输出 (I/O Specs)

## 输入数据（projects.yml）

```yaml
- id: project-1
  title: "Procedural Level Generator"
  description: "A tool for generating roguelike dungeon layouts."
  tech:
    - Test
    - GDScript
  github: "https://github.com/itzhakrees/itzhakrees.github.io"
  demo: "https://itzhakrees.github.io"
  featured: true
  date: 2026-03-01
```

***

## 预期输出

- 自动渲染为项目卡片列表（HTML + CSS）
- 按 `date` 或 `featured` 排序
- 每个项目展示：
  - 标题
  - 描述
  - 技术标签
  - GitHub 链接
  - Demo（可选）

***

## 调用示例

```ts
const projects = getProjects()
```

```tsx
<ProjectCard project={project} />
```

***

# 4. 逻辑细节与算法 (Logic & Requirements)

## 步骤 A：读取 YAML

- 使用 `fs` + `js-yaml` 解析 `projects.yml`
- 转换为 JS 对象数组

***

## 步骤 B：数据预处理

- 按 `featured` 优先排序
- 再按 `date` 降序排序

```ts
projects.sort((a, b) => {
  if (a.featured !== b.featured) return b.featured - a.featured
  return new Date(b.date) - new Date(a.date)
})
```

***

## 步骤 C：组件渲染

- 遍历 projects
- 渲染 `<ProjectCard />`

***

## 步骤 D：样式应用

使用 CSS Variables：

```css
:root {
  --bg: #ffffff;
  --text: #21262d;
  --accent: #58a6ff;
}
```

***

## 特殊情况处理

- 如果 `demo` 为空 → 不渲染按钮
- 如果 `tech` 为空 → 隐藏标签区域
- 如果 `date` 无效 → fallback 到最后
- 如果 YAML 解析失败 → fallback 空数组（避免 build 崩溃）

***

# 5. 约束与偏好 (Constraints)

## 性能

- 必须使用 SSG（Static Generation）
- 禁止客户端 fetch 项目数据
- 页面必须在 100ms 内完成首屏渲染（无 JS 阻塞）

***

## 代码风格

- TypeScript 严格模式开启
- 命名规范：
  - 组件：PascalCase
  - 变量：camelCase
- 禁止 any 类型

***

## UI / UX 限制（强约束）

- 极简主义（无多余装饰）
- 禁止：
  - loading 动画
  - 重 JS 动效
- 仅允许：
  - hover scale
  - fade-in

***

## 设计模式

- 数据驱动（Data-Driven UI）
- 组件化（Atomic Design）
- 单一数据源（Single Source of Truth = YAML）

***

## AI 修改约束（关键）

```plaintext
AI Editing Rules:
- ONLY edit /data/projects.yml
- DO NOT modify components
- DO NOT change layout structure
- Follow schema strictly
```

***

# 6. 定义“完成” (Definition of Done)

```
[ ] 项目可成功 build（Next.js build 通过）
[ ] 页面在本地与线上均可正常访问
[ ] 修改 projects.yml 可自动更新 UI
[ ] 所有组件解耦，无硬编码项目数据
[ ] 样式符合极简设计规范
[ ] GitHub Actions 自动部署成功
[ ] 无 console error / warning
[ ] TypeScript 无类型错误
[ ] YAML 格式错误不会导致 build 崩溃
```

