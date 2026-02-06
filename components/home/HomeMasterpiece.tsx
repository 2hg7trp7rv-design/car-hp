'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './home-masterpiece.module.css';

type TimelineItem = {
  decade: string;
  items: { slug: string; title: string; eraLabel?: string | null; publishedAt?: string | null }[];
};

type LatestItem = { href: string; title: string; meta?: string };

export function HomeMasterpiece(props: {
  timeline: TimelineItem[];
  latestCars: LatestItem[];
  latestHeritage: LatestItem[];
  latestGuides: LatestItem[];
  latestColumns: LatestItem[];
}) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [activeDecade, setActiveDecade] = useState<string>('');

  const allDecades = useMemo(() => props.timeline.map((t) => t.decade), [props.timeline]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    // Respect reduced motion
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = !!mql?.matches;
    if (reduce) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const dx = (x - 0.5) * 2; // -1..1
      const dy = (y - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', String(dx.toFixed(4)));
        el.style.setProperty('--py', String(dy.toFixed(4)));
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove as any);
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector('[data-home-root]');
    if (!root) return;

    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = !!mql?.matches;

    const sections = Array.from(document.querySelectorAll('[data-decade]')) as HTMLElement[];
    if (!sections.length) return;

    const pick = (id: string) => {
      setActiveDecade((prev) => (prev === id ? prev : id));
    };

    if (reduce) {
      // If reduced motion, just set the first decade as active.
      pick(sections[0]?.dataset?.decade ?? '');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target) {
          const id = (visible[0].target as HTMLElement).dataset.decade ?? '';
          if (id) pick(id);
        }
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65, 0.8] },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [allDecades.join('|')]);

  return (
    <div className={styles.root} data-home-root>
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroMedia} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroGrain} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.brandBlock}>
            <div className={styles.brandEyebrow}>CAR BOUTIQUE JOURNAL</div>
            <h1 className={styles.brandTitle}>An archive you enter, not browse.</h1>
            <p className={styles.brandLead}>
              Cars / Guides / Columns / Heritage を、ひとつの展示空間として統合する。
            </p>
          </div>

          <div className={styles.heroHint} aria-hidden="true">
            <span className={styles.hintLine} />
            <span className={styles.hintText}>Scroll</span>
          </div>
        </div>
      </section>

      <section className={styles.statement}>
        <p className={styles.statementText}>
          Cars are not products.
          <br />
          They are outcomes of an era.
        </p>
      </section>

      <section className={styles.timelineWrap}>
        <div className={styles.timelineSticky}>
          <div className={styles.timelineHeader}>
            <div className={styles.timelineEyebrow}>TIME ARCHIVE</div>
            <div className={styles.timelineTitle}>Decades</div>
            <div className={styles.timelineActive}>{activeDecade || '—'}</div>
          </div>

          <nav className={styles.timelineNav} aria-label="Decade navigation">
            {props.timeline.map((t) => (
              <a
                key={t.decade}
                href={'#decade-' + encodeURIComponent(t.decade)}
                className={t.decade === activeDecade ? styles.timelineNavItemActive : styles.timelineNavItem}
              >
                {t.decade}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.timelineList}>
          {props.timeline.map((t) => (
            <section
              key={t.decade}
              id={'decade-' + encodeURIComponent(t.decade)}
              data-decade={t.decade}
              className={styles.decadeSection}
            >
              <div className={styles.decadeLabel}>{t.decade}</div>
              <div className={styles.decadeGrid}>
                {t.items.slice(0, 6).map((it) => (
                  <Link key={it.slug} href={'/heritage/' + it.slug} className={styles.decadeCard}>
                    <div className={styles.decadeCardMeta}>{it.eraLabel || it.publishedAt || ''}</div>
                    <div className={styles.decadeCardTitle}>{it.title}</div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className={styles.gates}>
        <div className={styles.gatesInner}>
          <div className={styles.gatesTitle}>ARCHIVE GATE</div>

          <div className={styles.gatesGrid}>
            <ArchiveGate
              n="01"
              title="CARS"
              subtitle="Symbols of an era"
              href="/cars"
              items={props.latestCars}
            />
            <ArchiveGate
              n="02"
              title="HERITAGE"
              subtitle="Turning points"
              href="/heritage"
              items={props.latestHeritage}
            />
            <ArchiveGate
              n="03"
              title="GUIDES"
              subtitle="Ways of choosing"
              href="/guide"
              items={props.latestGuides}
            />
            <ArchiveGate
              n="04"
              title="COLUMNS"
              subtitle="Editorial hypotheses"
              href="/column"
              items={props.latestColumns}
            />
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLine} />
          <div className={styles.footerBrand}>Car Boutique Journal</div>
          <div className={styles.footerCopy}>An ongoing archive.</div>
        </div>
      </footer>
    </div>
  );
}

function ArchiveGate(props: {
  n: string;
  title: string;
  subtitle: string;
  href: string;
  items: LatestItem[];
}) {
  return (
    <div className={styles.gate}>
      <div className={styles.gateTop}>
        <div className={styles.gateNo}>ARCHIVE {props.n}</div>
        <div className={styles.gateTitle}>{props.title}</div>
        <div className={styles.gateSub}>{props.subtitle}</div>
      </div>

      <div className={styles.gateItems}>
        {props.items.slice(0, 3).map((it) => (
          <Link key={it.href} href={it.href} className={styles.gateItem}>
            <span className={styles.gateItemTitle}>{it.title}</span>
            {it.meta ? <span className={styles.gateItemMeta}>{it.meta}</span> : null}
          </Link>
        ))}
      </div>

      <Link href={props.href} className={styles.gateLink}>
        Enter
      </Link>
    </div>
  );
}
