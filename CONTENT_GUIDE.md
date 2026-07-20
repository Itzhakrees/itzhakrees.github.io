# 作品集内容维护指南

本文档用于指导新成员向作品集添加真实项目内容，包括 Markdown、图片及项目路径。通常不需要修改 `templates/` 中的模板文件。

## 1. 项目内容放在哪里

每个项目都应在 `content/projects/` 下拥有独立目录：

```text
content/projects/{project-id}/
|-- index.en.md
|-- index.zh.md
`-- img/
    |-- cover.webp
    `-- example.webp
```

其中：

- `{project-id}` 是项目的唯一英文标识，例如 `combat-loop`。
- `index.en.md` 是英文内容。
- `index.zh.md` 是中文内容。
- `img/` 存放该项目专用的封面、截图、流程图等图片。

目录名应使用简短、稳定的小写英文，并用连字符分隔单词。

## 2. Markdown 的 frontmatter

每个项目 Markdown 文件开头必须包含 frontmatter：

```yaml
---
id: "project-id"
lang: "zh"
status: "published"
featured: true
order: 1
title: "项目标题"
role: "你的职责"
summary: "首页项目卡片上的短摘要"
description: "项目详情页简介"
cover: "./img/cover.webp"
visualClass: ""
coverClass: ""
tags: ["Level Design", "Systems Design"]
filters: ["Game", "White Box"]
tools: ["Unity", "C#"]
date: "2026-06-21"
---
```

字段说明：

- `id`：必须与项目文件夹名称一致。
- `lang`：英文文件使用 `en`，中文文件使用 `zh`。
- `status`：可填写 `published`、`draft` 或 `archived`。只有 `published` 会显示在网站上。
- `featured`：是否作为重点项目展示。
- `order`：项目排序编号，数字越小越靠前。
- `title`：项目标题。
- `role`：你在项目中的职责。
- `summary`：首页项目卡片使用的简短摘要。
- `description`：项目详情页及页面描述使用的内容。
- `cover`：项目封面路径，建议使用项目目录内的图片。
- `tags`：项目类型或设计方向。
- `filters`：首页筛选分类，可使用 `Game`、`White Box`、`Document`、`Other`，并可为同一项目填写多个分类。
- `tools`：使用的软件、引擎或技术。
- `date`：项目日期，格式为 `YYYY-MM-DD`。

中文和英文文件的 `id`、`status`、`order` 等项目级字段应保持一致。

### order 如何排序

构建脚本首先按照 `order` 从小到大排列项目：

```yaml
order: 1 # 第一个项目
order: 2 # 第二个项目
order: 3 # 第三个项目
```

如果两个项目的 `order` 相同，则日期较新的项目排在前面。

字段名是 `order`，不是 `orders`。

## 3. 编写项目正文

frontmatter 后使用普通 Markdown 编写项目案例：

```md
# 项目标题

## 项目概述

介绍项目背景、目标和最终成果。

## 我的职责

- 负责核心系统设计
- 搭建关卡流程
- 组织测试并根据反馈迭代

## 设计过程

![设计流程](./img/process-01.webp)

## 结果与反思

记录项目结果、测试数据、设计取舍和后续改进方向。
```

建议正文重点回答：项目是什么、你负责什么、为什么这样设计、如何迭代，以及最终产生了什么结果。

## 4. 图片放置规则

项目专用图片应放在对应项目的 `img/` 目录：

```text
content/projects/{project-id}/img/
```

Markdown 中使用相对路径引用：

```md
![图片说明](./img/example.webp)
```

仓库根目录的 `img/` 用于全站通用图片，例如头像、首页背景、个人照片、Logo 或全局装饰图片。

```text
img/                          全站通用图片
content/projects/.../img/     单个项目的案例图片
```

不要把项目案例图片混放到根目录的 `img/` 中。图片和 Markdown 文件应使用 UTF-8 编码。

## 5. 添加新项目

1. 在 `content/projects/` 下创建项目目录。
2. 添加 `index.en.md` 和 `index.zh.md`。
3. 在项目的 `img/` 目录中加入封面及正文图片。
4. 检查 frontmatter 中的 `id` 是否与目录名一致。
5. 根据完成状态设置 `status`。
6. 运行构建命令。
7. 启动本地服务器并检查首页及项目详情页。

内容未完成时可以先使用：

```yaml
status: "draft"
```

草稿不会出现在生成的网站中。

## 6. 构建网站

每次新增或修改项目内容后运行：

```bash
npm run build
```

构建会自动生成：

```text
js/content.generated.js
projects/{project-id}/index.html
```

不要手动编辑这些生成文件。它们会在下一次构建时被覆盖。

## 7. 本地预览

运行：

```bash
npm run dev
```

该命令会先构建内容，再启动本地静态服务器。终端会显示访问地址，通常类似：

```text
http://localhost:3000
```

在浏览器中打开该地址即可预览。修改 Markdown 后重新运行 `npm run build`，然后刷新页面。

不要直接双击 `index.html` 使用 `file://` 预览，因为项目详情页需要通过 HTTP 加载 Markdown 文件。

## 8. 提交前检查

- 项目中英文文件是否齐全。
- `id` 是否与目录名一致。
- 中英文文件的 `status` 是否一致。
- `order` 是否符合预期顺序。
- 图片是否位于项目自己的 `img/` 目录。
- 所有图片路径是否能够正常显示。
- `npm run build` 是否成功。
- 首页和项目详情页是否都已通过本地服务器检查。
- Markdown、图片和构建生成文件是否一起纳入提交。
