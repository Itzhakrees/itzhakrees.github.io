import styles from "@/styles/Portfolio.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerText}>© {new Date().getFullYear()}</span>
    </footer>
  );
}
