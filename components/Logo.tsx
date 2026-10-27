import styles from "./layout.module.css";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`${styles.logo} ${size === "lg" ? styles.logoLg : ""}`}>
      <span className={styles.logoSmall}>クルマの</span>
      <span className={styles.logoIroha} aria-hidden="true">
        <span data-c="coral">い</span>
        <span data-c="sun">ろ</span>
        <span data-c="sky">は</span>
      </span>
      <span className="visually-hidden">いろは</span>
    </span>
  );
}
