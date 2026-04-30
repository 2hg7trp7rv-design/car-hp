"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./home-cinema.module.css";

gsap.registerPlugin(ScrollTrigger);

type HomeEntry = {
  href: string;
  title: string;
  meta?: string;
  description?: string;
  imageSrc?: string | null;
  category: string;
};

type HomeCinemaProps = {
  latestCars: HomeEntry[];
  latestHeritage: HomeEntry[];
  latestGuides: HomeEntry[];
  latestColumns: HomeEntry[];
};

const FALLBACK_IMAGES = [
  "/images/cbj/home-hero.jpg",
  "/images/cbj/car-temerario-hero.jpg",
  "/images/cbj/car-ferrari-purosangue-hero.jpg",
  "/images/cbj/car-nissan-z-rz34-hero.jpg",
  "/images/cbj/guide-hero.jpg",
  "/images/cbj/column-hero.jpg",
  "/images/cbj/heritage-hero.jpg",
  "/images/exhibit/kv-01.webp",
  "/images/exhibit/kv-02.webp",
  "/images/exhibit/kv-03.webp",
] as const;

function isRealImage(src?: string | null): src is string {
  if (!src) return false;
  if (src.includes("placeholder")) return false;
  return src.startsWith("/") || src.startsWith("http");
}

function uniqueEntries(items: HomeEntry[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.href || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

function buildSequenceImages(entries: HomeEntry[]) {
  const seen = new Set<string>();
  const images: string[] = [];

  for (const item of entries) {
    if (isRealImage(item.imageSrc) && !seen.has(item.imageSrc)) {
      seen.add(item.imageSrc);
      images.push(item.imageSrc);
    }
  }

  for (const src of FALLBACK_IMAGES) {
    if (!seen.has(src)) {
      seen.add(src);
      images.push(src);
      if (images.length >= 10) break;
    }
  }

  return images.slice(0, 10);
}

// Split text into characters for animation
function splitChars(text: string) {
  return text.split("").map((char, i) => (
    <span key={i} className={styles.char} style={{ transitionDelay: `${i * 0.03}s` }}>
      {char}
    </span>
  ));
}

export function HomeCinema({
  latestCars,
  latestHeritage,
  latestGuides,
  latestColumns,
}: HomeCinemaProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const sequenceRef = useRef<HTMLElement | null>(null);
  const [loaderDone, setLoaderDone] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);

  const entries = useMemo(
    () => uniqueEntries([...latestCars, ...latestGuides, ...latestColumns, ...latestHeritage]),
    [latestCars, latestGuides, latestColumns, latestHeritage]
  );

  const featured = useMemo(
    () => entries.find((item) => isRealImage(item.imageSrc)) ?? entries[0],
    [entries]
  );

  const numberItems = useMemo(
    () => entries.filter((item) => item.href !== featured?.href).slice(0, 6),
    [entries, featured]
  );

  const sequenceItems = useMemo(
    () => uniqueEntries([...latestCars, ...entries]),
    [latestCars, entries]
  );

  const sequenceImages = useMemo(
    () => buildSequenceImages(sequenceItems),
    [sequenceItems]
  );

  const heroImage = isRealImage(featured?.imageSrc)
    ? featured?.imageSrc ?? FALLBACK_IMAGES[0]
    : FALLBACK_IMAGES[0];

  // Loader sequence
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      setLoaderDone(true);
      setHeroRevealed(true);
      return;
    }

    // Start loader exit after 2s
    const loaderTimer = setTimeout(() => {
      setLoaderDone(true);
    }, 2000);

    // Reveal hero text after loader exits
    const heroTimer = setTimeout(() => {
      setHeroRevealed(true);
    }, 2800);

    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(heroTimer);
    };
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero parallax
      const hero = heroRef.current;
      if (hero) {
        const imageWrap = hero.querySelector(`.${styles.heroImageWrap}`);
        const title = hero.querySelector(`.${styles.heroTitle}`);

        if (imageWrap) {
          gsap.to(imageWrap, {
            scale: 1.15,
            opacity: 0.3,
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        }

        if (title) {
          gsap.to(title, {
            y: -200,
            opacity: 0,
            scrollTrigger: {
              trigger: hero,
              start: "20% top",
              end: "80% top",
              scrub: 0.5,
            },
          });
        }
      }

      // Sequence scroll
      const sequence = sequenceRef.current;
      if (sequence) {
        ScrollTrigger.create({
          trigger: sequence,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const frame = Math.min(
              sequenceImages.length - 1,
              Math.floor(self.progress * sequenceImages.length)
            );
            setActiveFrame(frame);
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [sequenceImages.length]);

  return (
    <main ref={rootRef} className={styles.root}>
      {/* Film Grain Overlay */}
      <div className={styles.grain} aria-hidden="true">
        <svg>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* Loader */}
      <div className={`${styles.loader} ${loaderDone ? styles.loaderExit : ""}`} aria-hidden="true">
        <div className={styles.loaderInner}>
          <span className={styles.loaderKicker}>AUTOMOTIVE EDITORIAL</span>
          <div className={styles.loaderTitle}>
            <span>CAR</span>
            <span>BOUTIQUE</span>
            <span>JOURNAL</span>
          </div>
          <div className={styles.loaderLine} />
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroSticky}>
          <div className={styles.heroImageWrap}>
            <img
              src={heroImage}
              alt=""
              className={styles.heroImage}
              loading="eager"
            />
            <div className={styles.heroVeil} />
          </div>

          <div className={`${styles.heroContent} ${heroRevealed ? styles.heroRevealed : ""}`}>
            <span className={styles.heroKicker}>AUTOMOTIVE EDITORIAL — 2026</span>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span className={styles.heroLine}>{splitChars("CAR")}</span>
              <span className={styles.heroLine}>{splitChars("BOUTIQUE")}</span>
              <span className={styles.heroLine}>{splitChars("JOURNAL")}</span>
            </h1>
          </div>

          <span className={styles.heroCorner}>VOL.001</span>
        </div>
      </section>

      {/* Featured */}
      <section className={styles.featured}>
        <div className={styles.featuredImage}>
          <img
            src={isRealImage(featured?.imageSrc) ? featured?.imageSrc ?? heroImage : heroImage}
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.featuredContent}>
          <span className={styles.kicker}>FEATURED</span>
          <h2>{featured?.title ?? "FEATURED"}</h2>
          {featured && (
            <Link href={featured.href} className={styles.featuredLink}>
              READ
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </section>

      {/* Number List */}
      <section className={styles.numbers}>
        <div className={styles.numbersInner}>
          <div className={styles.numbersHeader}>
            <span className={styles.kicker}>LATEST</span>
            <h2>最新記事</h2>
          </div>
          <div className={styles.numbersList}>
            {numberItems.map((item, i) => (
              <Link key={item.href} href={item.href} className={styles.numberRow}>
                <span className={styles.numberIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.numberTitle}>{item.title}</span>
                <span className={styles.numberMeta}>{item.meta || item.category}</span>
                <span className={styles.numberArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sequence */}
      <section ref={sequenceRef} className={styles.sequence}>
        <div className={styles.sequenceSticky}>
          <div className={styles.sequenceFrames}>
            {sequenceImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className={`${styles.sequenceFrame} ${i === activeFrame ? styles.active : ""}`}
              />
            ))}
          </div>
          <div className={styles.sequenceCopy}>
            <span className={styles.kicker}>GALLERY</span>
            <h2>車種<br />ギャラリー</h2>
            <div className={styles.meter}>
              {sequenceImages.map((_, i) => (
                <span key={i} className={i === activeFrame ? styles.meterActive : ""} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Index */}
      <section className={styles.index}>
        <div className={styles.indexInner}>
          <div className={styles.indexHeader}>
            <span className={styles.kicker}>BROWSE</span>
            <h2>車種を探す</h2>
          </div>
          <div className={styles.indexGrid}>
            <Link href="/cars/makers" className={styles.indexCard}>
              <span>01</span>
              <strong>メーカー別</strong>
            </Link>
            <Link href="/cars/body-types" className={styles.indexCard}>
              <span>02</span>
              <strong>ボディタイプ別</strong>
            </Link>
            <Link href="/cars/segments" className={styles.indexCard}>
              <span>03</span>
              <strong>価格帯別</strong>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
