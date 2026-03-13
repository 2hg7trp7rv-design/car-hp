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
                <Link href="/cars" className={`${styles.heroPrimary} cb-tap`}>
                  <span className={styles.heroPrimaryLabel}>車種から探す</span>
                  <span className={styles.heroPrimaryArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link href="/start" className={`${styles.heroSecondary} cb-tap`}>
                  <span>目的から入る</span>
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

        {/* 3つの入口 */}
        <section
          className="relative z-10 bg-[#07080a] px-4 py-14 sm:px-6 lg:px-8"
          aria-label="3つの入口"
        >
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-center text-[10px] font-medium tracking-[0.34em] text-white/40">
              何から入るか迷ったら
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/cars"
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all duration-300 hover:border-[#0ABAB5]/40 hover:bg-white/[0.07]"
              >
                <span className="text-[10px] font-medium tracking-[0.3em] text-[#0ABAB5]/80">01</span>
                <span className="text-[16px] font-medium tracking-[0.08em] text-white transition-colors group-hover:text-[#0ABAB5]">
                  車種から探す
                </span>
                <span className="text-[12px] leading-relaxed text-white/50">
                  メーカー・ボディタイプ・用途で絞り込み、候補を比較する
                </span>
                <span className="mt-auto text-[11px] tracking-[0.14em] text-white/35 transition-colors group-hover:text-[#0ABAB5]/70">
                  CARS →
                </span>
              </Link>

              <Link
                href="/start"
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all duration-300 hover:border-[#0ABAB5]/40 hover:bg-white/[0.07]"
              >
                <span className="text-[10px] font-medium tracking-[0.3em] text-[#0ABAB5]/80">02</span>
                <span className="text-[16px] font-medium tracking-[0.08em] text-white transition-colors group-hover:text-[#0ABAB5]">
                  悩みから探す
                </span>
                <span className="text-[12px] leading-relaxed text-white/50">
                  買う・困った・売る/維持。いまの目的に合わせた入口を案内する
                </span>
                <span className="mt-auto text-[11px] tracking-[0.14em] text-white/35 transition-colors group-hover:text-[#0ABAB5]/70">
                  START →
                </span>
              </Link>

              <Link
                href="/heritage"
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-all duration-300 hover:border-[#0ABAB5]/40 hover:bg-white/[0.07]"
              >
                <span className="text-[10px] font-medium tracking-[0.3em] text-[#0ABAB5]/80">03</span>
                <span className="text-[16px] font-medium tracking-[0.08em] text-white transition-colors group-hover:text-[#0ABAB5]">
                  歴史から読む
                </span>
                <span className="text-[12px] leading-relaxed text-white/50">
                  年代・テーマ・車種から時代の文脈に遡る
                </span>
                <span className="mt-auto text-[11px] tracking-[0.14em] text-white/35 transition-colors group-hover:text-[#0ABAB5]/70">
                  HERITAGE →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ARCHIVE GATE */}
        <section className={styles.gates} aria-label="Archive Gate" id="archive-gate">
          <div className={styles.gatesInner}>
            <div className={styles.gatesTitle}>ARCHIVE GATE</div>

            <div className={styles.gatesGrid}>
              <ArchiveGate n="01" title="CARS" subtitle="Symbols of an era" href="/cars" items={props.latestCars} />
              <ArchiveGate n="02" title="HERITAGE" subtitle="Turning points" href="/heritage" items={props.latestHeritage} />
              <ArchiveGate n="03" title="GUIDE" subtitle="Ways of choosing" href="/guide" items={props.latestGuides} />
              <ArchiveGate n="04" title="COLUMN" subtitle="Editorial hypotheses" href="/column" items={props.latestColumns} />
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
