import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

export type Project = {
  id: string;
  title: string;
  description: string;
  tech?: string[];
  github: string;
  demo?: string;
  featured: boolean;
  category?: string;
  thumbnail?: string;
  date?: string;
};

export type ProjectSection = {
  category: string;
  projects: Project[];
};

const projectsFilePath = path.join(process.cwd(), "data", "projects.yml");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeThumbnailFilename(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.includes("/") || trimmed.includes("\\")) return undefined;
  if (trimmed.startsWith(".")) return undefined;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(trimmed)) return undefined;
  return trimmed;
}

function parseProject(value: unknown): Project | null {
  if (!isRecord(value)) return null;

  const id = asNonEmptyString(value.id);
  const title = asNonEmptyString(value.title);
  const description = asNonEmptyString(value.description);
  const github = asNonEmptyString(value.github);
  if (!id || !title || !description || !github) return null;

  const tech = asStringArray(value.tech);
  const demo = asNonEmptyString(value.demo);
  const date = asNonEmptyString(value.date);
  const featured = asBoolean(value.featured);
  const category = asNonEmptyString(value.category);
  const thumbnail = normalizeThumbnailFilename(asNonEmptyString(value.thumbnail));

  const project: Project = { id, title, description, github, featured };
  if (tech) project.tech = tech;
  if (demo) project.demo = demo;
  if (category) project.category = category;
  if (thumbnail) project.thumbnail = thumbnail;
  if (date) project.date = date;
  return project;
}

function dateSortValue(date: string | undefined): number {
  if (!date) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(date);
  return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    const bd = dateSortValue(b.date);
    const ad = dateSortValue(a.date);
    if (bd !== ad) return bd - ad;
    return a.id.localeCompare(b.id);
  });
}

export function toProjectSections(projects: Project[]): ProjectSection[] {
  const sorted = sortProjects(projects);
  const grouped = new Map<string, Project[]>();

  for (const p of sorted) {
    const key = p.category && p.category.trim().length > 0 ? p.category.trim() : "Other";
    const list = grouped.get(key);
    if (list) list.push(p);
    else grouped.set(key, [p]);
  }

  const summaries = Array.from(grouped.entries()).map(([category, items]) => {
    const hasFeatured = items.some((p) => p.featured);
    const newestDate = items.reduce((acc, p) => {
      const v = dateSortValue(p.date);
      return v > acc ? v : acc;
    }, Number.NEGATIVE_INFINITY);
    return { category, items, hasFeatured, newestDate };
  });

  summaries.sort((a, b) => {
    if (a.hasFeatured !== b.hasFeatured) return (b.hasFeatured ? 1 : 0) - (a.hasFeatured ? 1 : 0);
    if (a.newestDate !== b.newestDate) return b.newestDate - a.newestDate;
    return a.category.localeCompare(b.category);
  });

  return summaries.map((s) => ({ category: s.category, projects: s.items }));
}

function withExistingThumbnails(projects: Project[]): Project[] {
  const imgDir = path.join(process.cwd(), "public", "img");
  return projects.map((p) => {
    if (!p.thumbnail) return p;
    const fullPath = path.join(imgDir, p.thumbnail);
    if (!fs.existsSync(fullPath)) return { ...p, thumbnail: undefined };
    return p;
  });
}

export function getProjects(): Project[] {
  try {
    const yamlText = fs.readFileSync(projectsFilePath, "utf8");
    const parsed = load(yamlText) as unknown;
    if (!Array.isArray(parsed)) return [];
    const projects = parsed.map(parseProject).filter((p): p is Project => p !== null);
    return sortProjects(withExistingThumbnails(projects));
  } catch {
    return [];
  }
}

export function getProjectSections(): ProjectSection[] {
  return toProjectSections(getProjects());
}
