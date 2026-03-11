"use client";

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import styles from './home-masterpiece.module.css';
import { pickExhibitKvPaths } from '@/lib/exhibit/kv';

type LatestItem = { href: string; title: string; meta?: string };

export function HomeMasterpiece(props: {
  latestCars: LatestItem[];
  latestHeritage: LatestItem[];
  latestGuides: LatestItem[];
  latestColumns: LatestItem[];
}) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    // INP / メインスレッド保護:
    // - reduced-motion / coarse pointer では無効化
    // - pointermove は window 全体ではなく、ヒーロー領域に限定する
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
    if (reduceMotion || coarsePointer) return;

    let raf = 0;

    // getBoundingClientRect は高頻度で叩くとコストが出るため、短い間隔でキャッシュする
    let rect = el.getBoundingClientRect();
    let lastRectAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const refreshRect = () => {
      rect = el.getBoundingClientRect();
      lastRectAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    };

    const ensureRectFresh = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastRectAt > 240) refreshRect();
      return rect;
    };

    const setParallax = (dx: number, dy: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', String(dx.toFixed(4)));
        el.style.setProperty('--py', String(dy.toFixed(4)));
      });
    };

    const onEnter = () => {
      refreshRect();
    };

    const onMove = (e: PointerEvent) => {
      const r = ensureRectFresh();
      const x = (e.clientX - r.left) / Math.max(1, r.width);
      const y = (e.clientY - r.top) / Math.max(1, r.height);
      const dx = (x - 0.5) * 2; // -1..1
      const dy = (y - 0.5) * 2;

      setParallax(dx, dy);
    };

    const onLeave = () => {
      setParallax(0, 0);
    };

    // pointermove をヒーロー領域に限定
    el.addEventListener('pointerenter', onEnter as any, { passive: true } as any);
    el.addEventListener('pointermove', onMove as any, { passive: true } as any);
    el.addEventListener('pointerleave', onLeave as any, { passive: true } as any);

    // 画面回転/リサイズで矩形を更新
    window.addEventListener('resize', refreshRect, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', refreshRect as any);
      el.removeEventListener('pointerenter', onEnter as any);
      el.removeEventListener('pointermove', onMove as any);
      el.removeEventListener('pointerleave', onLeave as any);
    };
  }, []);

  const contentClass = styles.content;

  return (
    <main className={styles.root} data-home-root>
      <div className={contentClass}>
        {/* ENTRANCE */}
        <section className={styles.hero} ref={heroRef} aria-label="Entrance">
          <div className={styles.heroImage} aria-hidden="true">
            <picture>
              <source
                type="image/webp"
                media="(min-width: 768px)"
                srcSet="/images/exhibit/kv-home.webp"
              />
              <source type="image/webp" srcSet="/images/exhibit/kv-home-m.webp" />
              <source media="(min-width: 768px)" srcSet="/images/exhibit/kv-home.png" />
              <img
                src="/images/exhibit/kv-home-m.png"
                alt=""
                width={1024}
                height={1536}
                loading="eager"
                decoding="async"
                fetchPriority="high"
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
                <Link href="/exhibition" className={`${styles.heroPrimary} cb-tap`}>
                  <span className={styles.heroPrimaryLabel}>Open Selection</span>
                  <span className={styles.heroPrimaryArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
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
