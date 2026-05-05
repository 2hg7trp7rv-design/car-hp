import styles from "./exhibition-label.module.css";

export function ExhibitionLabel(props: {
  n: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
}) {
  return (
    <section className={styles.wrap} aria-label="Exhibition label">
      <div className={styles.panel}>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.no}>ARCHIVE {props.n}</div>
        <div className={styles.title}>{props.title}</div>
        {props.subtitle ? <div className={styles.subtitle}>{props.subtitle}</div> : null}
        {props.meta ? <div className={styles.meta}>{props.meta}</div> : null}
      </div>
    </section>
  );
}
