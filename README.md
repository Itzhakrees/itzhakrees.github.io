# AI-Driven GitHub Portfolio System

一个基于 YAML 数据驱动的个人作品集网站。通过维护 `data/projects.yml`，即可在构建期自动生成项目分区与卡片展示页面。

## 项目简介

- 数据源：`data/projects.yml`（单一数据源）
- 渲染方式：Next.js SSG（静态生成）
- 展示能力：按 `category` 分区、按 `featured/date` 排序、卡片展示 `thumbnail/tech/github/demo`
- 图片资源：`public/img/`

## 使用技术栈

- Next.js 16（Pages Router）
- React
- TypeScript（严格模式）
- Node.js 18+
- YAML（`js-yaml` 解析）
- CSS Modules

## 全 AI 生成说明

本项目当前版本为**全 AI 生成与迭代**，包括需求拆解、实现、测试与文档整理。

## 生成所用 Plan 文档路径

- `Plan.md`
- `.trae/documents/ReqPlan0.1.md`
- `.trae/documents/ReqPlan0.2.md`

## 本地运行

```bash
npm.cmd install
npm.cmd run dev
```

打开 [http://localhost:3000](http://localhost:3000) 进行预览。
