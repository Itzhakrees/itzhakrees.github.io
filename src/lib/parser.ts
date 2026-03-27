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
  date?: string;
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

  const project: Project = { id, title, description, github, featured };
  if (tech) project.tech = tech;
  if (demo) project.demo = demo;
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

export function getProjects(): Project[] {
  try {
    const yamlText = fs.readFileSync(projectsFilePath, "utf8");
    const parsed = load(yamlText) as unknown;
    if (!Array.isArray(parsed)) return [];
    const projects = parsed.map(parseProject).filter((p): p is Project => p !== null);
    return sortProjects(projects);
  } catch {
    return [];
  }
}
