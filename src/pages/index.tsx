import Head from "next/head";
import type { GetStaticProps } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { getProjectSections, type ProjectSection } from "@/lib/parser";
import styles from "@/styles/Portfolio.module.css";

type Props = {
  sections: ProjectSection[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      sections: getProjectSections(),
    },
  };
};

export default function Home({ sections }: Props) {
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

          <div className={styles.section} aria-label="Project list">
            {sections.map((section) => (
              <section key={section.category} className={styles.categorySection} aria-label={section.category}>
                <h2 className={styles.categoryTitle}>{section.category}</h2>
                <div className={styles.grid}>
                  {section.projects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <Footer />
        </main>
      </div>
    </>
  );
}
