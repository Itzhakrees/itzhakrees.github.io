import Head from "next/head";
import type { GetStaticProps } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { getProjects, type Project } from "@/lib/parser";
import styles from "@/styles/Portfolio.module.css";

type Props = {
  projects: Project[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      projects: getProjects(),
    },
  };
};

export default function Home({ projects }: Props) {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="description" content="Data-driven portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <main className={styles.container}>
          <Header title="Projects" subtitle="SSG + YAML (single source of truth)" />

          <section className={styles.section} aria-label="Project list">
            <div className={styles.grid}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
