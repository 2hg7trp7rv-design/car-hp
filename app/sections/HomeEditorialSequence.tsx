"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./home-editorial-sequence.module.css";

gsap.registerPlugin(ScrollTrigger);

const panels = [
  {
    id: "spec",
    eyebrow: "01 / SPEC",
    title: "車を知る",
    body: "数字だけでは見えない、一台の輪郭。",
    cta: "スペックを確認する",
    href: "/cars",
    image: "/home/urus-spec.png",
    tone: "light",
    layout: "spec",
    imagePosition: "50% 50%",
  },
  {
    id: "trouble",
    eyebrow: "02 / TROUBLE",
    title: "故障と向き合う",
    body: "憧れを、現実のまま見る。",
    cta: "ガイド記事を見る",
    href: "/guide",
    image: "/home/urus-trouble.png",
    tone: "dark",
    layout: "trouble",
    imagePosition: "52% 47%",
  },
  {
    id: "column",
    eyebrow: "03 / COLUMN",
    title: "視点を変える",
    body: "視点を変えれば、車は違って見える。",
    cta: "コラム記事を見る",
    href: "/column",
    image: "/home/urus-column.png",
    tone: "dark",
    layout: "column",
    imagePosition: "44% 50%",
  },
  {
    id: "history",
    eyebrow: "04 / HISTORY",
    title: "背景を読む",
    body: "その車が、そこにある理由。",
    cta: "ヘリテージ記事を見る",
    href: "/heritage",
    image: "/home/urus-history.png",
    tone: "light",
    layout: "history",
    imagePosition: "50% 48%",
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
          end: () => `+=${Math.round(window.innerHeight * panels.length * 3.35)}`,
          scrub: 1.18,
          pin: frame,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const sceneLength = 1.68;

      scenePanels.forEach((panel, index) => {
        const sceneStart = index * sceneLength;
        const media = panel.querySelector<HTMLElement>("[data-cbj-sequence-media]");
        const mediaImage = panel.querySelector<HTMLElement>("[data-cbj-sequence-image]");
        const copyBlock = panel.querySelector<HTMLElement>("[data-cbj-sequence-copy-block]");
        const copyLines = gsap.utils.toArray<HTMLElement>("[data-cbj-sequence-copy]", panel);
        const cta = panel.querySelector<HTMLElement>("[data-cbj-sequence-cta]");
        const rule = panel.querySelector<HTMLElement>("[data-cbj-sequence-rule]");
        const wash = panel.querySelector<HTMLElement>("[data-cbj-sequence-wash]");
        const sweep = panel.querySelector<HTMLElement>("[data-cbj-sequence-sweep]");

        timeline.set(panel, { autoAlpha: 1, pointerEvents: "auto", zIndex: index + 1 }, sceneStart);

        if (media) {
          timeline
            .fromTo(
              media,
              {
                autoAlpha: 0,
                yPercent: 10,
                scale: 1.15,
                filter: "blur(12px)",
              },
              {
                autoAlpha: 1,
                yPercent: 0,
                scale: 1.07,
                filter: "blur(0px)",
                duration: 0.34,
                ease: "power3.out",
              },
              sceneStart
            )
            .to(
              media,
              {
                yPercent: 0,
                scale: 1.035,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.82,
                ease: "none",
              },
              sceneStart + 0.34
            )
            .to(
              media,
              {
                yPercent: -11,
                scale: 1.068,
                autoAlpha: 0,
                filter: "blur(8px)",
                duration: 0.28,
                ease: "power2.in",
              },
              sceneStart + 1.26
            );
        }

        if (mediaImage) {
          timeline
            .fromTo(
              mediaImage,
              { scale: 1.055, rotateZ: -0.12 },
              { scale: 1.008, rotateZ: 0.025, duration: 0.42, ease: "power2.out" },
              sceneStart + 0.02
            )
            .to(mediaImage, { scale: 1.008, rotateZ: 0.025, duration: 0.78, ease: "none" }, sceneStart + 0.44)
            .to(mediaImage, { scale: 1.030, rotateZ: 0.09, duration: 0.26, ease: "power1.in" }, sceneStart + 1.24);
        }

        if (wash) {
          timeline
            .fromTo(wash, { autoAlpha: 0.98 }, { autoAlpha: 0.12, duration: 0.36, ease: "power2.out" }, sceneStart)
            .to(wash, { autoAlpha: 0.08, duration: 0.78, ease: "none" }, sceneStart + 0.36)
            .to(wash, { autoAlpha: 0.98, duration: 0.30, ease: "power2.in" }, sceneStart + 1.20);
        }

        if (sweep) {
          timeline
            .fromTo(
              sweep,
              { yPercent: -150, autoAlpha: 0.82 },
              { yPercent: 20, autoAlpha: 0.10, duration: 0.42, ease: "power2.out" },
              sceneStart + 0.04
            )
            .to(sweep, { yPercent: 150, autoAlpha: 0.68, duration: 0.32, ease: "power2.in" }, sceneStart + 1.16);
        }


        if (copyBlock) {
          timeline
            .fromTo(
              copyBlock,
              { autoAlpha: 0, y: 72, filter: "blur(10px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.24, ease: "power3.out" },
              sceneStart + 0.24
            )
            .to(copyBlock, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.70, ease: "none" }, sceneStart + 0.50)
            .to(copyBlock, { y: -58, autoAlpha: 0, filter: "blur(7px)", duration: 0.22, ease: "power2.in" }, sceneStart + 1.18);
        }

        if (copyLines.length) {
          timeline.fromTo(
            copyLines,
            { autoAlpha: 0, y: 34 },
            { autoAlpha: 1, y: 0, duration: 0.20, stagger: 0.045, ease: "power3.out" },
            sceneStart + 0.28
          );
        }

        if (cta) {
          timeline
            .fromTo(
              cta,
              { autoAlpha: 0, y: 48, xPercent: -50, scale: 0.965, filter: "blur(7px)" },
              { autoAlpha: 1, y: 0, xPercent: -50, scale: 1, filter: "blur(0px)", duration: 0.20, ease: "power3.out" },
              sceneStart + 0.46
            )
            .to(cta, { autoAlpha: 1, y: 0, xPercent: -50, scale: 1, duration: 0.66, ease: "none" }, sceneStart + 0.66)
            .to(cta, { autoAlpha: 0, y: -28, xPercent: -50, scale: 0.982, filter: "blur(6px)", duration: 0.22, ease: "power2.in" }, sceneStart + 1.18);
        }

        if (rule) {
          timeline
            .fromTo(rule, { autoAlpha: 0, scaleY: 0, y: 24 }, { autoAlpha: 0.52, scaleY: 1, y: 0, duration: 0.18, ease: "power3.out" }, sceneStart + 0.13)
            .to(rule, { autoAlpha: 0.44, scaleY: 1.18, y: -8, duration: 0.82, ease: "none" }, sceneStart + 0.34)
            .to(rule, { autoAlpha: 0, scaleY: 0, y: -34, duration: 0.22, ease: "power2.in" }, sceneStart + 1.18);
        }

        timeline.set(panel, { autoAlpha: 0, pointerEvents: "none" }, sceneStart + 1.66);
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
            className={`${styles.panel} ${styles[panel.tone]} ${styles[panel.layout]}`}
          >
            <div className={styles.mediaWrap} data-cbj-sequence-media>
              <img
                src={panel.image}
                alt=""
                data-cbj-sequence-image
                className={styles.media}
                style={{ objectPosition: panel.imagePosition }}
                loading={panel.id === "spec" ? "eager" : "lazy"}
              />
            </div>

            <div className={styles.wash} data-cbj-sequence-wash aria-hidden="true" />
            <div className={styles.sweep} data-cbj-sequence-sweep aria-hidden="true" />
            <div className={styles.vignette} aria-hidden="true" />
            <div className={styles.progressRule} data-cbj-sequence-rule aria-hidden="true" />

            <div className={styles.copyBlock} data-cbj-sequence-copy-block>
              <h2 className={styles.title} data-cbj-sequence-copy>{panel.title}</h2>
              <p className={styles.body} data-cbj-sequence-copy>{panel.body}</p>
            </div>

            <a href={panel.href} className={styles.cta} data-cbj-sequence-cta>
              <span>{panel.cta}</span>
              <em aria-hidden="true">↗</em>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
