两点你必须守住：

1. **结构不能被 UI 反向绑死（数据必须主导分区）**
2. **图片不能破坏性能（否则你前面的极简性能目标会崩）**

---

# 1. 目标概述（新增能力）

**新增功能：**

* 支持“子标题 + 分区展示”（如 Featured / Tools / Experiments）
* 每个 Project 显示缩略图（thumbnail）
* 图片统一存储于 `/data/img`

---

# 2. 输入与输出（I/O Specs 升级）

## ✅ 更新后的 `projects.yml`

```yaml
- id: project-1
  title: "Procedural Level Generator"
  description: "A tool for generating roguelike dungeon layouts."
  tech:
    - Godot
    - GDScript
  github: "https://github.com/yourname/project"
  demo: ""
  featured: true
  category: "Tools"
  thumbnail: "procedural.png"
  date: 2026-03-01
```

---

## 新增字段说明（关键）

* `category` → 控制分区（子标题来源）
* `thumbnail` → 对应 `/data/img/xxx.png`

核心设计点：

> 不要在代码里写死分类
> 分类必须由 YAML 决定（AI 才能安全修改）

---

## 页面输出结构（目标 UI）

```html
<h2>Featured</h2>
<div class="grid">
  [ProjectCard...]
</div>

<h2>Tools</h2>
<div class="grid">
  [ProjectCard...]
</div>
```

---

# 3. 逻辑细节（核心升级）

## 步骤 A：分组（Group By Category）

```ts
function groupByCategory(projects) {
  const map = {}

  projects.forEach(p => {
    const key = p.category || "Other"
    if (!map[key]) map[key] = []
    map[key].push(p)
  })

  return map
}
```

---

## 步骤 B：分类排序

你控制展示顺序：

```ts
const CATEGORY_ORDER = ["Featured", "Tools", "Games", "Experiments"]

const sortedCategories = Object.keys(grouped).sort(
  (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
)
```

如果 category 不在列表里 → 自动排后面

---

## 步骤 C：渲染结构

```tsx
{sortedCategories.map(category => (
  <section key={category}>
    <h2>{category}</h2>

    <div className="grid">
      {grouped[category].map(p => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  </section>
))}
```

---

# 4. 缩略图系统（重点）

## 文件结构

```plaintext
/public
  /img
    procedural.png
    ai-tool.png
```

---

## ProjectCard 图片实现

```tsx
<img
  src={`/img/${project.thumbnail}`}
  alt={project.title}
  className="thumbnail"
/>
```

---

## 样式（符合极简要求）

```css
.thumbnail {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
}
```

---

## 性能约束（必须遵守）


* 图片尺寸统一（例如 400x300）
* 使用压缩（<100KB）
* 不用懒加载库（保持简单）
* 可选：用 Next.js `<Image>`（自动优化）

---

# 5. 组件升级（ProjectCard）

## 新结构

```html
<div class="card">
  <img class="thumbnail" />

  <div class="content">
    <h3>Title</h3>
    <p>Description</p>

    <div class="tags">...</div>

    <div class="links">
      <a>GitHub</a>
      <a>Demo</a>
    </div>
  </div>
</div>
```

---

# 6. AI 可维护性（你必须锁死这部分）

## ✅ YAML 修改规则（更新版）

```plaintext
AI Editing Rules:
- ONLY edit /data/projects.yml
- thumbnail must match file in /public/img
- category must be a string
- DO NOT modify component structure
```

---


### 加一个约束说明：

```yaml
# Allowed categories:
# - Featured
# - Tools
# - Games
# - Experiments
```

---

# 7. Definition of Done（更新）

```plaintext
[ ] 页面按 category 正确分区显示
[ ] 每个 project 显示缩略图
[ ] 图片路径正确，无 404
[ ] 修改 YAML 可新增分类和项目
[ ] 分类顺序稳定（不混乱）
[ ] 无 layout shift（图片加载不跳动）
[ ] Lighthouse 性能 ≥ 90
```

---

