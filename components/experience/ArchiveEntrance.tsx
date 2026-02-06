import Link from 'next/link';
import styles from './archive-entrance.module.css';

export function ArchiveEntrance(props: {
  n: string;
  title: string;
  subtitle: string;
  lead?: string;
  href: string;
  active: 'cars' | 'heritage' | 'guide' | 'column';
}) {
  const items = [
    { key: 'cars', n: '01', label: 'CARS', href: '/cars' },
    { key: 'heritage', n: '02', label: 'HERITAGE', href: '/heritage' },
    { key: 'guide', n: '03', label: 'GUIDES', href: '/guide' },
    { key: 'column', n: '04', label: 'COLUMNS', href: '/column' },
  ] as const;

  return (
    <section className={styles.wrap} aria-label={`${props.title} entrance`}>
      <div className={styles.panel}>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.top}>
          <div className={styles.no}>ARCHIVE {props.n}</div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{props.title}</h1>
            <div className={styles.subtitle}>{props.subtitle}</div>
          </div>
          {props.lead ? <p className={styles.lead}>{props.lead}</p> : null}
        </div>

        <nav className={styles.nav} aria-label="Archive navigation">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className={it.key === props.active ? styles.navItemActive : styles.navItem}
            >
              <span className={styles.navNo}>{it.n}</span>
              <span className={styles.navLabel}>{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
