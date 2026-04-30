"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

export function HomeCinema({
  latestCars,
  latestHeritage,
  latestGuides,
  latestColumns,
}: HomeCinemaProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const sequenceRef = useRef<HTMLElement | null>(null);
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

  // GSAP scroll animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero parallax
      const hero = heroRef.current;
      if (hero) {
        const imageWrap = hero.querySelector(`.${styles.heroImageWrap}`);
        const copy = hero.querySelector(`.${styles.heroCopy}`);

        if (imageWrap) {
          gsap.to(imageWrap, {
            scale: 1.12,
            opacity: 0.4,
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        if (copy) {
          gsap.to(copy, {
            y: -150,
            opacity: 0,
            scrollTrigger: {
              trigger: hero,
              start: "30% top",
              end: "90% top",
              scrub: 0.4,
            },
          });
        }
      }

      // Featured parallax
      const featuredImg = document.querySelector(`.${styles.featuredImageLayer}`);
      if (featuredImg) {
        gsap.to(featuredImg, {
          y: -60,
          scrollTrigger: {
            trigger: featuredImg,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
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
    <main ref={rootRef} className={styles.homeCinema}>
      {/* Loader */}
      <div className={styles.preHeroLoader} aria-hidden="true">
        <span>AUTOMOTIVE EDITORIAL</span>
        <b>
          <span>CAR</span>
          <span>BOUTIQUE</span>
          <span>JOURNAL</span>
        </b>
      </div>

      {/* Hero */}
      <section ref={heroRef} className={styles.heroSection} aria-labelledby="hero-title">
        <div className={styles.heroSticky}>
          <div className={styles.heroImageWrap}>
            <img
              src={heroImage}
              alt=""
              className={styles.heroImage}
              loading="eager"
            />
            <div className={styles.heroVeil} />
            <div className={styles.heroGrain} aria-hidden="true" />
          </div>

          <div className={styles.heroCopy}>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span className={styles.heroTitleLine}>CAR</span>
              <span className={styles.heroTitleLine}>BOUTIQUE</span>
              <span className={styles.heroTitleLine}>JOURNAL</span>
            </h1>
          </div>

          <div className={styles.heroLabel} aria-hidden="true">
            AUTOMOTIVE EDITORIAL — 2026
          </div>

          <div className={styles.heroCorner} aria-hidden="true">
            VOL.001
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className={styles.featuredSection}>
        <div className={styles.featuredBackdrop} aria-hidden="true" />
        <div className={styles.featuredImageLayer}>
          <img
            src={isRealImage(featured?.imageSrc) ? featured?.imageSrc ?? heroImage : heroImage}
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.featuredTextLayer}>
          <p className={styles.monoKicker}>FEATURED</p>
          <h2>{featured?.title ?? "FEATURED"}</h2>
          {featured && (
            <Link href={featured.href} className={styles.cinemaLink}>
              READ →
            </Link>
          )}
        </div>
      </section>

      {/* Number List */}
      <section className={styles.numberDriftSection}>
        <div className={styles.numberIntro}>
          <p className={styles.monoKicker}>LATEST</p>
          <h2>最新記事</h2>
        </div>
        <div className={styles.numberList}>
          {numberItems.map((item, i) => (
            <Link key={item.href} href={item.href} className={styles.numberRow}>
              <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.numberMain}>
                <span>{item.title}</span>
                <small>{item.meta || item.category}</small>
              </span>
              <span className={styles.rowArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sequence */}
      <section ref={sequenceRef} className={styles.sequenceSection}>
        <div className={styles.sequenceSticky}>
          <div className={styles.sequenceFrames}>
            {sequenceImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className={i === activeFrame ? styles.sequenceFrameActive : styles.sequenceFrame}
              />
            ))}
          </div>
          <div className={styles.sequenceCopy}>
            <p className={styles.monoKicker}>GALLERY</p>
            <h2>車種<br />ギャラリー</h2>
            <div className={styles.frameMeter}>
              {sequenceImages.map((_, i) => (
                <span key={i} className={i === activeFrame ? styles.frameMeterActive : undefined} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Index */}
      <section className={styles.indexSection}>
        <div className={styles.indexLead}>
          <p className={styles.monoKicker}>BROWSE</p>
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
      </section>
    </main>
  );
}
