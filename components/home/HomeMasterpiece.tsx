"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import styles from './home-masterpiece.module.css';
import { pickExhibitKvPaths } from '@/lib/exhibit/kv';
import { HandwritingIntro } from '@/components/intro/HandwritingIntro';

type LatestItem = { href: string; title: string; meta?: string };

export function HomeMasterpiece(props: {
  showIntroOnMount?: boolean;
  latestCars: LatestItem[];
  latestHeritage: LatestItem[];
  latestGuides: LatestItem[];
  latestColumns: LatestItem[];
}) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(!!props.showIntroOnMount);
  const [introEver, setIntroEver] = useState<boolean>(!!props.showIntroOnMount);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = !!mql?.matches;
    if (reduce) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / Math.max(1, r.width);
      const y = (e.clientY - r.top) / Math.max(1, r.height);
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

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = !!mql?.matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const onEnter = () => {
    scrollToId('archive-gate');
  };

  const contentClass = showIntro
    ? styles.contentHidden
    : introEver
      ? styles.contentReveal
      : styles.content;

  return (
    <main className={styles.root} data-home-root>
      {showIntro ? (
        <HandwritingIntro
          onDone={() => {
            setShowIntro(false);
            setIntroEver(true);
          }}
        />
      ) : null}

      <div className={contentClass}>
        {/* ENTRANCE */}
        <section className={styles.hero} ref={heroRef} aria-label="Entrance">
          <div className={styles.heroImage} aria-hidden="true">
            <picture>
              <source media="(min-width: 768px)" srcSet="/images/exhibit/kv-home.png" />
              <img
                src="/images/exhibit/kv-home-m.png"
                alt=""
                loading="eager"
                decoding="async"
                className={styles.heroImageImg}
              />
            </picture>
          </div>
          <div className={styles.heroMedia} aria-hidden="true" />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroGrain} aria-hidden="true" />

          <div className={styles.heroInner}>
            <div className={styles.brandBlock}>
              <p className={styles.brandEyebrow}>CAR BOUTIQUE JOURNAL</p>
              <h1 className={styles.brandTitle}>
                An archive you enter,
                <span className={styles.brandTitleBreak}>not browse.</span>
              </h1>
              <p className={styles.brandLead}>
                Cars, Guides, Columns, and Heritage—one exhibition.
              </p>

              <div className={styles.heroActions}>
                <button type="button" className={`${styles.heroPrimary} cb-tap`} onClick={onEnter}>
                  <span className={styles.heroPrimaryLabel}>Enter</span>
                  <span className={styles.heroPrimaryArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.heroHint} aria-hidden="true">
              <span className={styles.hintLine} />
              <span className={styles.hintText}>Scroll</span>
            </div>
          </div>
        </section>

        <div className={styles.transitionBand} aria-hidden="true" />

        {/* ARCHIVE GATE */}
        <section className={styles.gates} aria-label="Archive Gate" id="archive-gate">
          <div className={styles.gatesInner}>
            <div className={styles.gatesTitle}>ARCHIVE GATE</div>

            <div className={styles.gatesGrid}>
              <ArchiveGate n="01" title="CARS" subtitle="Symbols of an era" href="/cars" items={props.latestCars} />
              <ArchiveGate n="02" title="HERITAGE" subtitle="Turning points" href="/heritage" items={props.latestHeritage} />
              <ArchiveGate n="03" title="GUIDES" subtitle="Ways of choosing" href="/guide" items={props.latestGuides} />
              <ArchiveGate n="04" title="COLUMNS" subtitle="Editorial hypotheses" href="/column" items={props.latestColumns} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ArchiveGate(props: {
  n: string;
  title: string;
  subtitle: string;
  href: string;
  items: LatestItem[];
}) {
  const kv = pickExhibitKvPaths('gate:' + props.href);
  return (
    <div className={styles.gate}>
      <div className={styles.gateBg} aria-hidden="true">
        <picture>
          <source media="(min-width: 768px)" srcSet={kv.desktop} />
          <img src={kv.mobile} alt="" loading="lazy" className={styles.gateBgImg} />
        </picture>
        <div className={styles.gateBgOverlay} />
      </div>

      <div className={styles.gateTop}>
        <div className={styles.gateNo}>ARCHIVE {props.n}</div>
        <div className={styles.gateTitle}>{props.title}</div>
        <div className={styles.gateSub}>{props.subtitle}</div>
      </div>

      <div className={styles.gateItems}>
        {props.items.slice(0, 2).map((it) => (
          <Link key={it.href} href={it.href} className={`${styles.gateItem} cb-tap`}>
            <span className={styles.gateItemTitle}>{it.title}</span>
            {it.meta ? <span className={styles.gateItemMeta}>{it.meta}</span> : null}
          </Link>
        ))}
      </div>

      <div className={styles.gateBottom}>
        <Link href={props.href} className={`${styles.gateLink} cb-tap`}>
          Enter <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
