import styles from "@/styles/Portfolio.module.css";

type Props = {
  label: string;
};

export default function TechBadge({ label }: Props) {
  return <span className={styles.techBadge}>{label}</span>;
}
