# Itzhak Rees Portfolio

Static bilingual portfolio for game systems, gameplay, and level design work.

## Content Workflow

Project content is maintained through self-contained project folders under:

```txt
content/projects/
```

Each project should use this structure:

```txt
content/projects/{project-id}/
├─ index.en.md
├─ index.zh.md
└─ img/
   ├─ cover.webp
   └─ example.webp
```

Each Markdown file must include frontmatter:

```yaml
---
id: "project-id"
lang: "en"
status: "published"
featured: true
order: 1
title: ""
role: ""
summary: ""
description: ""
# Add a real project cover at ./img/cover.webp, then set cover to "./img/cover.webp".
cover: ""
visualClass: ""
coverClass: ""
tags: []
tools: []
date: "2026-01-01"
---
```

Project images belong inside the project folder:

```txt
content/projects/{project-id}/img/
```

Markdown should reference project images with local relative paths:

```md
![Example](./img/example.webp)
```

Do not reference project case-study images from the global root `img/` folder.

## Build

Run the build after changing project content:

```bash
npm run build
```

The build generates:

```txt
js/content.generated.js
projects/{project-id}/index.html
```

Do not manually edit generated files. If `npm` is unavailable in a constrained environment, run the same build script with any Node.js executable:

```bash
node scripts/build-content.mjs
```

## Add a New Project

1. Add a new folder under `content/projects/`.
2. Add `index.en.md` and `index.zh.md`.
3. Add project images under `img/`.
4. Use local image paths such as `./img/process-01.webp`.
5. Run `npm run build`.
6. Preview through a local HTTP server, not `file://`, because project pages fetch Markdown files.
7. Commit the Markdown, images, and generated files.

## Draft Projects

Use:

```yaml
status: "draft"
```

Draft and archived projects are ignored by the generated site content.
