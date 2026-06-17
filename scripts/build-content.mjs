import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(rootDir, "content", "projects");
const siteDataPath = path.join(rootDir, "data", "site.json");
const projectTemplatePath = path.join(rootDir, "templates", "project.html");
const outputJsPath = path.join(rootDir, "js", "content.generated.js");
const projectsOutputDir = path.join(rootDir, "projects");
const supportedLanguages = ["en", "zh"];
const statuses = new Set(["published", "draft", "archived"]);

function parseScalar(value, fileName, key) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  if (trimmed.startsWith('"') || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      throw new Error(`${fileName}: invalid JSON-style value for "${key}".`);
    }
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function parseFrontmatter(source, fileName) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    throw new Error(`${fileName}: missing frontmatter.`);
  }

  const data = {};

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`${fileName}: invalid frontmatter line "${line}".`);
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    data[key] = parseScalar(value, fileName, key);
  }

  return {
    data,
    body: source.slice(match[0].length)
  };
}

function validateProjectData(data, fileName, expectedProjectId, expectedLang) {
  const requiredFields = [
    "id",
    "lang",
    "status",
    "featured",
    "order",
    "title",
    "role",
    "summary",
    "description",
    "cover",
    "visualClass",
    "coverClass",
    "tags",
    "tools",
    "date"
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`${fileName}: missing required field "${field}".`);
    }
  }

  if (data.id !== expectedProjectId) {
    throw new Error(`${fileName}: id "${data.id}" must match folder "${expectedProjectId}".`);
  }

  if (data.lang !== expectedLang) {
    throw new Error(`${fileName}: lang "${data.lang}" must be "${expectedLang}".`);
  }

  if (!statuses.has(data.status)) {
    throw new Error(`${fileName}: status must be published, draft, or archived.`);
  }

  if (!Array.isArray(data.tags)) {
    throw new Error(`${fileName}: tags must be an array.`);
  }

  if (!Array.isArray(data.tools)) {
    throw new Error(`${fileName}: tools must be an array.`);
  }

  if (data.cover && !isExternalUrl(data.cover) && !/^\.?\/?img\//.test(data.cover)) {
    throw new Error(`${fileName}: cover must be empty, external, or project-local img/... path.`);
  }
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value);
}

function normalizeProjectAssetPath(projectId, assetPath) {
  if (!assetPath) return "";
  if (isExternalUrl(assetPath)) return assetPath;

  return `content/projects/${projectId}/${assetPath.replace(/^\.?\//, "")}`;
}

function makeLocalizedEntry(primary, fallback) {
  const title = primary.title || fallback.title || "";
  const summary = primary.summary || fallback.summary || "";

  return {
    ariaLabel: `${title}: ${summary}`,
    role: primary.role || fallback.role || "",
    title,
    summary,
    description: primary.description || summary || fallback.description || fallback.summary || ""
  };
}

function toProjectEntry(group) {
  const en = group.en;
  const zh = group.zh;

  return {
    id: en.id,
    status: en.status,
    visualClass: en.visualClass || "",
    coverClass: en.coverClass || "",
    cover: normalizeProjectAssetPath(en.id, en.cover || ""),
    href: `projects/${en.id}/`,
    contentBase: `content/projects/${en.id}`,
    markdownBase: `content/projects/${en.id}/index`,
    assetBase: `content/projects/${en.id}/`,
    featured: en.featured !== false,
    order: Number(en.order || 999),
    tags: en.tags || [],
    tools: en.tools || [],
    date: en.date || "",
    en: makeLocalizedEntry(en, zh),
    zh: makeLocalizedEntry(zh, en)
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readProjectMarkdown(projectId, lang) {
  const fileName = `index.${lang}.md`;
  const fullPath = path.join(contentDir, projectId, fileName);
  const source = await fs.readFile(fullPath, "utf8");
  const parsed = parseFrontmatter(source, `${projectId}/${fileName}`);

  validateProjectData(parsed.data, `${projectId}/${fileName}`, projectId, lang);

  return parsed.data;
}

async function collectProjects() {
  const entries = await fs.readdir(contentDir, { withFileTypes: true });
  const projectDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const groups = [];

  for (const projectId of projectDirs) {
    const group = {};

    for (const lang of supportedLanguages) {
      try {
        group[lang] = await readProjectMarkdown(projectId, lang);
      } catch (error) {
        if (error.code === "ENOENT") {
          throw new Error(`${projectId}: missing index.${lang}.md.`);
        }

        throw error;
      }
    }

    if (group.en.status !== group.zh.status) {
      throw new Error(`${projectId}: English and Chinese statuses must match.`);
    }

    if (group.en.status === "published") {
      groups.push(group);
    }
  }

  return groups
    .map(toProjectEntry)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return String(b.date).localeCompare(String(a.date));
    });
}

async function generateContentData(projects, siteData) {
  const generated = {
    profile: siteData.profile || {},
    ui: siteData.ui || {},
    projects,
    research: siteData.research || {},
    designDocs: siteData.designDocs || []
  };

  await ensureDir(path.dirname(outputJsPath));
  await fs.writeFile(
    outputJsPath,
    `window.portfolioContent = ${JSON.stringify(generated, null, 2)};\n`,
    "utf8"
  );
}

async function generateProjectPages(projects) {
  const template = await fs.readFile(projectTemplatePath, "utf8");

  await ensureDir(projectsOutputDir);

  for (const project of projects) {
    const outputDir = path.join(projectsOutputDir, project.id);
    await ensureDir(outputDir);

    const html = template
      .replaceAll("{{PROJECT_ID}}", escapeHtml(project.id))
      .replaceAll("{{PROJECT_TITLE}}", escapeHtml(project.en.title))
      .replaceAll("{{PROJECT_DESCRIPTION}}", escapeHtml(project.en.description));

    await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");
  }
}

async function main() {
  const siteData = JSON.parse(await fs.readFile(siteDataPath, "utf8"));
  const projects = await collectProjects();

  await generateContentData(projects, siteData);
  await generateProjectPages(projects);

  console.log(`Generated ${projects.length} project entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
