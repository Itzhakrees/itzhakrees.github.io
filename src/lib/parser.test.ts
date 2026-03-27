import { describe, expect, it } from "vitest";
import { sortProjects, type Project } from "./parser";

function p(overrides: Partial<Project> & Pick<Project, "id">): Project {
  return {
    id: overrides.id,
    title: overrides.title ?? overrides.id,
    description: overrides.description ?? "desc",
    github: overrides.github ?? "https://example.com",
    featured: overrides.featured ?? false,
    ...(overrides.tech ? { tech: overrides.tech } : {}),
    ...(overrides.demo ? { demo: overrides.demo } : {}),
    ...(overrides.date ? { date: overrides.date } : {}),
  };
}

describe("sortProjects", () => {
  it("sorts featured first, then date descending", () => {
    const projects: Project[] = [
      p({ id: "a", featured: false, date: "2020-01-01" }),
      p({ id: "b", featured: true, date: "2019-01-01" }),
      p({ id: "c", featured: true, date: "2022-01-01" }),
      p({ id: "d", featured: false }),
    ];

    const sorted = sortProjects(projects);
    expect(sorted.map((x) => x.id)).toEqual(["c", "b", "a", "d"]);
  });

  it("treats invalid dates as the oldest", () => {
    const projects: Project[] = [
      p({ id: "a", featured: false, date: "not-a-date" }),
      p({ id: "b", featured: false, date: "2020-01-01" }),
    ];

    const sorted = sortProjects(projects);
    expect(sorted.map((x) => x.id)).toEqual(["b", "a"]);
  });
});
