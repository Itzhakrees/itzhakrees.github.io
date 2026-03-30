import TechBadge from "@/components/TechBadge";
import type { Project } from "@/lib/parser";
import styles from "@/styles/Portfolio.module.css";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  const thumbnailSrc = project.thumbnail ? `/img/${project.thumbnail}` : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.thumbnailWrap} aria-label="Project thumbnail">
        {thumbnailSrc ? (
          <img
            className={styles.thumbnail}
            src={thumbnailSrc}
            alt={project.title}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.thumbnailPlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        {project.featured ? <span className={styles.featured}>Featured</span> : null}
      </div>
      <p className={styles.cardDesc}>{project.description}</p>

      {project.tech && project.tech.length > 0 ? (
        <div className={styles.techRow} aria-label="Tech stack">
          {project.tech.map((t) => (
            <TechBadge key={t} label={t} />
          ))}
        </div>
      ) : null}

      <div className={styles.links}>
        <a className={styles.link} href={project.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        {project.demo ? (
          <a className={styles.link} href={project.demo} target="_blank" rel="noopener noreferrer">
            Demo
          </a>
        ) : null}
      </div>
    </article>
  );
}
