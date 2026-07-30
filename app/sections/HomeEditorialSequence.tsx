"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./home-editorial-sequence.module.css";

gsap.registerPlugin(ScrollTrigger);

const panels = [
  {
    id: "guide",
    eyebrow: "01 / GUIDE",
    title: "GUIDE",
    subtitle: "迷ったときに開く、実用ガイド",
    body: "車の仕組みと判断順を、初心者でも読める形で整理する実用ガイド。維持費・故障の兆候・保険まで、一次情報をもとに手順で示します。",
    cta: "ガイド記事を見る",
    href: "/guide",
    image: "/home/urus-trouble.jpg",
    imagePosition: "52% 47%",
    theme: "guide",
    reverse: false,
  },
  {
    id: "column",
    eyebrow: "02 / COLUMN",
    title: "COLUMN",
    subtitle: "少し深く読み解く、コラム",
    body: "車のカスタム・整備・維持判断を、会話と図解の流れで読み解く。背景にある考え方まで、じっくりたどれる読みものです。",
    cta: "コラム記事を見る",
    href: "/column",
    image: "/home/urus-column.jpg",
    imagePosition: "44% 50%",
    theme: "column",
    reverse: true,
  },
] as const;

export default function HomeEditorialSequence() {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    if (!root || !frame) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      const scenePanels = gsap.utils.toArray<HTMLElement>("[data-cbj-sequence-panel]");

      gsap.set(scenePanels, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(scenePanels[0], { autoAlpha: 1, pointerEvents: "auto" });

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * panels.length * 2.2)}`,
          scrub: 1.1,
          pin: frame,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const sceneLength = 1.4;

      scenePanels.forEach((panel, index) => {
        const sceneStart = index * sceneLength;
        const media = panel.querySelector<HTMLElement>("[data-cbj-sequence-media]");
        const mediaImage = panel.querySelector<HTMLElement>("[data-cbj-sequence-image]");
        const copyLines = gsap.utils.toArray<HTMLElement>("[data-cbj-sequence-copy]", panel);

        timeline.set(panel, { autoAlpha: 1, pointerEvents: "auto", zIndex: index + 1 }, sceneStart);

        if (media) {
          timeline
            .fromTo(
              media,
              { autoAlpha: 0, scale: 1.1 },
              { autoAlpha: 1, scale: 1, duration: 0.34, ease: "power3.out" },
              sceneStart
            )
            .to(media, { scale: 1, autoAlpha: 1, duration: 0.72, ease: "none" }, sceneStart + 0.34)
            .to(media, { autoAlpha: 0, scale: 1.05, duration: 0.26, ease: "power2.in" }, sceneStart + 1.12);
        }

        if (mediaImage) {
          timeline.fromTo(
            mediaImage,
            { scale: 1.08 },
            { scale: 1.0, duration: 0.5, ease: "power2.out" },
            sceneStart + 0.02
          );
        }

        if (copyLines.length) {
          timeline
            .fromTo(
              copyLines,
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.06, ease: "power3.out" },
              sceneStart + 0.14
            )
            .to(copyLines, { y: 0, autoAlpha: 1, duration: 0.6, ease: "none" }, sceneStart + 0.5)
            .to(copyLines, { y: -32, autoAlpha: 0, duration: 0.22, ease: "power2.in" }, sceneStart + 1.1);
        }

        timeline.set(panel, { autoAlpha: 0, pointerEvents: "none" }, sceneStart + 1.38);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className={styles.sequence} aria-label="CAR BOUTIQUE JOURNAL editorial sections">
      <div ref={frameRef} className={styles.frame}>
        {panels.map((panel) => (
          <article
            key={panel.id}
            data-cbj-sequence-panel
            className={`${styles.panel} ${styles[panel.theme]}`}
          >
            <div className={`${styles.split} ${panel.reverse ? styles.splitReverse : ""}`}>
              <div className={styles.copySide}>
                <p className={styles.eyebrow} data-cbj-sequence-copy>{panel.eyebrow}</p>
                <h2 className={styles.title} data-cbj-sequence-copy>{panel.title}</h2>
                <p className={styles.subtitle} data-cbj-sequence-copy>{panel.subtitle}</p>
                <div className={styles.rule} data-cbj-sequence-copy aria-hidden="true" />
                <p className={styles.body} data-cbj-sequence-copy>{panel.body}</p>
                <a href={panel.href} className={styles.cta} data-cbj-sequence-copy>
                  <span>{panel.cta}</span>
                  <em aria-hidden="true">↗</em>
                </a>
              </div>
              <div className={styles.photoSide} data-cbj-sequence-media>
                <img
                  src={panel.image}
                  alt=""
                  data-cbj-sequence-image
                  className={styles.media}
                  style={{ objectPosition: panel.imagePosition }}
                  loading={panel.id === "guide" ? "eager" : "lazy"}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
