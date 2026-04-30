// components/home/HomeCinema.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./home-cinema.module.css";

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
  "/images/exhibit/kv-04.webp",
  "/images/exhibit/kv-05.webp",
] as const;

const INDEX_LINKS = [
  {
    href: "/cars/makers",
    label: "メーカー別",
  },
  {
    href: "/cars/body-types",
    label: "ボディタイプ別",
  },
  {
    href: "/cars/segments",
    label: "価格帯別",
  },
] as const;

function isRealImage(src?: string | null): src is string {
  if (!src) return false;
  if (src.includes("placeholder")) return false;
  return src.startsWith("/") || src.startsWith("http");
}

function uniqueEntries(items: HomeEntry[]) {
  const seen = new Set<string>();
  const out: HomeEntry[] = [];

  for (const item of items) {
    if (!item.href || seen.has(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }

  return out;
}

function buildSequenceImages(entries: HomeEntry[]) {
  const seen = new Set<string>();
  const images: string[] = [];

  for (const item of entries) {
    const src = item.imageSrc;
    if (!isRealImage(src) || seen.has(src)) continue;
    seen.add(src);
    images.push(src);
  }

  for (const src of FALLBACK_IMAGES) {
    if (seen.has(src)) continue;
    seen.add(src);
    images.push(src);
    if (images.length >= 12) break;
  }

  return images.slice(0, 12);
}

export function HomeCinema({
  latestCars,
  latestHeritage,
  latestGuides,
  latestColumns,
}: HomeCinemaProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const sequenceRef = useRef<HTMLElement | null>(null);
  const [activeFrame, setActiveFrame] = useState(0);

  const entries = useMemo(
    () => uniqueEntries([...latestCars, ...latestGuides, ...latestColumns, ...latestHeritage]),
    [latestCars, latestGuides, latestColumns, latestHeritage],
  );

  const featured = useMemo(
    () => entries.find((item) => isRealImage(item.imageSrc)) ?? entries[0],
    [entries],
  );

  const numberItems = useMemo(() => entries.filter((item) => item.href !== featured?.href).slice(0, 8), [entries, featured]);
  const sequenceItems = useMemo(() => uniqueEntries([...latestCars, ...entries]), [latestCars, entries]);
  const sequenceImages = useMemo(() => buildSequenceImages(sequenceItems), [sequenceItems]);
  const heroImage = isRealImage(featured?.imageSrc) ? featured?.imageSrc ?? FALLBACK_IMAGES[0] : FALLBACK_IMAGES[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const update = () => {
      const rootRect = root.getBoundingClientRect();
      const rootRange = Math.max(root.offsetHeight - window.innerHeight, 1);
      const rootProgress = clamp(-rootRect.top / rootRange);
      root.style.setProperty("--cinema-progress", rootProgress.toFixed(4));
      root.style.setProperty("--hero-scale", (1 + rootProgress * 0.06).toFixed(4));
      root.style.setProperty("--hero-opacity", (1 - rootProgress * 0.16).toFixed(4));
      root.style.setProperty("--featured-y", `${(-rootProgress * 38).toFixed(2)}px`);
      root.style.setProperty("--grain-y", `${(rootProgress * 24).toFixed(2)}px`);

      const sequence = sequenceRef.current;
      if (!sequence) return;
      const rect = sequence.getBoundingClientRect();
      const range = Math.max(rect.height - window.innerHeight, 1);
      const progress = clamp(-rect.top / range);
      const nextFrame = Math.min(sequenceImages.length - 1, Math.floor(progress * sequenceImages.length));
      setActiveFrame((current) => (current === nextFrame ? current : nextFrame));
    };

    if (!reduceMotion.matches) {
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    } else {
      setActiveFrame(0);
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sequenceImages.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerFine = window.matchMedia("(pointer: fine)");
    if (reduceMotion.matches || !pointerFine.matches) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups: Array<() => void> = [];

    nodes.forEach((node) => {
      const move = (event: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };
      const leave = () => {
        node.style.transform = "translate3d(0, 0, 0)";
      };

      node.addEventListener("mousemove", move);
      node.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        node.removeEventListener("mousemove", move);
        node.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <main ref={rootRef} className={styles.homeCinema}>
      <div className={styles.preHeroLoader} aria-hidden="true">
        <span>自動車エディトリアル</span>
        <b>CAR BOUTIQUE JOURNAL</b>
      </div>

      <section className={styles.heroSection} aria-labelledby="home-cinema-title">
        <div className={styles.heroSticky}>
          <div className={styles.heroImageWrap}>
            <img src={heroImage} alt="" className={styles.heroImage} loading="eager" />
            <div className={styles.heroVeil} />
          </div>

          <div className={styles.heroCopy}>
            <h1 id="home-cinema-title">CAR BOUTIQUE JOURNAL</h1>
            <p className={styles.heroSub}>自動車エディトリアル</p>
          </div>

          <div className={styles.scrollSignal} aria-hidden="true">
            <span />
            <small>SCROLL</small>
          </div>
        </div>
      </section>

      <section className={styles.featuredSection} aria-labelledby="featured-story-title">
        <div className={styles.featuredBackdrop} aria-hidden="true" />
        <div className={styles.featuredImageLayer}>
          <img src={isRealImage(featured?.imageSrc) ? featured?.imageSrc ?? heroImage : heroImage} alt="" loading="lazy" />
        </div>
        <div className={styles.featuredTextLayer}>
          <p className={styles.monoKicker}>FEATURED</p>
          <h2 id="featured-story-title">{featured ? featured.title : "FEATURED"}</h2>
          {featured ? (
            <Link href={featured.href} className={styles.cinemaLink} data-magnetic>
              記事へ
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.numberDriftSection} aria-labelledby="number-drift-title">
        <div className={styles.numberIntro}>
          <p className={styles.monoKicker}>LATEST</p>
          <h2 id="number-drift-title">最新の記事</h2>
        </div>
        <div className={styles.numberList}>
          {numberItems.map((item, index) => (
            <Link key={item.href} href={item.href} className={styles.numberRow}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.numberMain}>
                <span>{item.title}</span>
                <small>{item.meta || item.category}</small>
              </span>
              <span className={styles.rowArrow}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section ref={sequenceRef} className={styles.sequenceSection} aria-labelledby="sequence-title">
        <div className={styles.sequenceSticky}>
          <div className={styles.sequenceFrames}>
            {sequenceImages.map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                className={index === activeFrame ? styles.sequenceFrameActive : styles.sequenceFrame}
              />
            ))}
          </div>
          <div className={styles.sequenceCopy}>
            <p className={styles.monoKicker}>CARS</p>
            <h2 id="sequence-title">車種ギャラリー</h2>
            <div className={styles.frameMeter} aria-hidden="true">
              {sequenceImages.map((_, index) => (
                <span key={index} className={index === activeFrame ? styles.frameMeterActive : undefined} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.indexSection} aria-labelledby="index-grid-title">
        <div className={styles.indexLead}>
          <p className={styles.monoKicker}>BROWSE</p>
          <h2 id="index-grid-title">車種を探す</h2>
        </div>
        <div className={styles.indexGrid}>
          {INDEX_LINKS.map((item, index) => (
            <Link key={item.href} href={item.href} className={styles.indexCard} data-magnetic>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
