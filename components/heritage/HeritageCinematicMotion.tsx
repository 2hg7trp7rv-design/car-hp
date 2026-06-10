"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function toArray(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

function PageTransition({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(false), 680);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <div className="cbj-heritage-page-transition" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          style={{
            transform: active ? "translateY(0%)" : "translateY(-100%)",
            transitionDelay: `${index * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function HeritageCinematicMotion() {
  const [transitionActive, setTransitionActive] = useState(true);

  useEffect(() => {
    const transitionTimer = window.setTimeout(() => setTransitionActive(false), 720);
    return () => window.clearTimeout(transitionTimer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("cbj-heritage-motion-mounted");

    if (reducedMotion) {
      root.classList.add("cbj-heritage-motion-reduced");
      toArray("[data-heritage-reveal], .cbj-heritage-bar-row").forEach((element) => element.classList.add("is-visible"));
      return () => {
        root.classList.remove("cbj-heritage-motion-mounted", "cbj-heritage-motion-reduced");
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>(".cbj-heritage-hero");
      const cards = toArray("[data-hero-card]");
      const years = toArray(".cbj-heritage-hero-years a");
      const progress = document.querySelector<HTMLElement>(".cbj-heritage-hero-progress i");
      const title = document.querySelector<HTMLElement>(".cbj-heritage-hero-copy");
      const label = document.querySelector<HTMLElement>(".cbj-heritage-hero .cbj-heritage-label");
      const heading = document.querySelector<HTMLElement>(".cbj-heritage-hero h1");
      const lead = document.querySelector<HTMLElement>(".cbj-heritage-hero-copy > p");
      const scrollMark = document.querySelector<HTMLElement>(".cbj-heritage-scroll");
      const bg = document.querySelector<HTMLElement>(".cbj-heritage-hero-bg img");

      if (hero && cards.length) {
        const initialCards = () => {
          cards.forEach((card, index) => {
            const offset = index - 0;
            gsap.set(card, {
              x: offset * 168,
              y: Math.abs(offset) * 28,
              rotation: offset * 9,
              scale: index === 0 ? 1 : Math.max(0.72, 0.9 - Math.abs(offset) * 0.07),
              autoAlpha: index === 0 ? 1 : Math.max(0.18, 0.36 - Math.abs(offset) * 0.05),
              filter: index === 0
                ? "grayscale(0%) contrast(1.08) brightness(0.88)"
                : "grayscale(100%) contrast(1.22) brightness(0.48)",
              zIndex: 20 - Math.abs(offset),
            });
          });
        };

        initialCards();
        gsap.set(years, { autoAlpha: 0.16, y: 12 });
        gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
        gsap.set([label, heading, lead, scrollMark], { autoAlpha: 0 });
        gsap.set(label, { y: 14 });
        gsap.set(heading, { y: 34, filter: "blur(8px)", letterSpacing: "0.10em" });
        gsap.set(lead, { y: 16 });
        gsap.set(scrollMark, { y: 10 });
        gsap.set(cards, { y: "+=24", autoAlpha: 0 });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .to(label, { autoAlpha: 1, y: 0, duration: 0.64 }, 0.12)
          .to(heading, { autoAlpha: 1, y: 0, filter: "blur(0px)", letterSpacing: "0.045em", duration: 0.96 }, 0.26)
          .to(lead, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.68)
          .to(cards, { autoAlpha: (index) => (index === 0 ? 1 : 0.24), y: "-=24", duration: 0.92, stagger: 0.055 }, 0.86)
          .to(years, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.045 }, 1.26)
          .to(scrollMark, { autoAlpha: 1, y: 0, duration: 0.48 }, 1.52);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 2.4, 1600)}`,
            scrub: 0.75,
            pin: true,
            anticipatePin: 1,
          },
        });

        cards.forEach((_, activeIndex) => {
          const pos = activeIndex * 12;
          cards.forEach((card, cardIndex) => {
            const offset = cardIndex - activeIndex;
            const dist = Math.abs(offset);
            tl.to(
              card,
              {
                x: offset * 188,
                y: activeIndex === cardIndex ? -18 : dist * 34,
                rotation: offset * 8,
                scale: activeIndex === cardIndex ? 1.12 : Math.max(0.56, 0.86 - dist * 0.09),
                autoAlpha: activeIndex === cardIndex ? 1 : Math.max(0.1, 0.34 - dist * 0.055),
                filter: activeIndex === cardIndex
                  ? "grayscale(0%) contrast(1.06) brightness(0.9)"
                  : `grayscale(100%) contrast(1.22) brightness(${Math.max(0.32, 0.55 - dist * 0.07)})`,
                zIndex: 20 - dist,
                duration: 8,
                ease: "power2.inOut",
              },
              pos,
            );
          });

          years.forEach((year, yearIndex) => {
            tl.to(
              year,
              {
                autoAlpha: yearIndex === activeIndex ? 1 : yearIndex < activeIndex ? 0.48 : 0.2,
                color: yearIndex === activeIndex ? "#c9a86c" : yearIndex < activeIndex ? "#6c665e" : "#4e4b45",
                duration: 5,
                ease: "power2.inOut",
              },
              pos,
            );
          });

          if (progress) {
            tl.to(
              progress,
              { scaleX: (activeIndex + 1) / cards.length, duration: 8, ease: "power2.inOut" },
              pos,
            );
          }
        });

        tl.to(cards, { y: -58, scale: 0.55, autoAlpha: 0, duration: 8, stagger: 0.18, ease: "power3.in" }, cards.length * 12 + 4);
        tl.to(years, { autoAlpha: 0, y: -18, duration: 6, stagger: 0.08, ease: "power2.in" }, cards.length * 12 + 4);
        tl.to(title, { autoAlpha: 0.22, yPercent: -16, duration: 6, ease: "power2.in" }, cards.length * 12 + 2);
      }

      if (bg) {
        gsap.to(bg, {
          yPercent: 7,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: ".cbj-heritage-hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.7,
          },
        });
      }

      toArray("[data-heritage-reveal]").forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
            delay: Math.min(index * 0.012, 0.08),
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 86%", once: true },
          },
        );
      });

      toArray(".cbj-heritage-generation").forEach((element) => {
        const image = element.querySelector<HTMLElement>(".cbj-heritage-generation-media .cbj-heritage-film");
        const copy = element.querySelector<HTMLElement>(".cbj-heritage-generation-copy");
        if (copy) {
          gsap.fromTo(copy, { autoAlpha: 0, y: 30 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.68,
            ease: "power3.out",
            scrollTrigger: { trigger: copy, start: "top 82%", once: true },
          });
        }
        if (image) {
          gsap.fromTo(image, { autoAlpha: 0, y: 34, clipPath: "inset(4% 4% 4% 4%)" }, {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.76,
            ease: "power3.out",
            scrollTrigger: { trigger: image, start: "top 84%", once: true },
          });
          gsap.to(image, {
            yPercent: -5,
            ease: "none",
            scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.65 },
          });
        }
      });

      toArray(".cbj-heritage-bar-row").forEach((element, index) => {
        ScrollTrigger.create({
          trigger: element,
          start: "top 88%",
          once: true,
          onEnter: () => window.setTimeout(() => element.classList.add("is-visible"), index * 70),
        });
      });

      toArray(".cbj-heritage-dna-card, .cbj-heritage-guide-card").forEach((element, index) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          delay: Math.min(index * 0.035, 0.16),
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      toArray(".cbj-heritage-chapter.is-dark").forEach((element) => {
        const darkBg = element.querySelector<HTMLElement>(".cbj-heritage-dark-bg img");
        if (!darkBg) return;
        gsap.fromTo(darkBg, { scale: 1.12, yPercent: -5 }, {
          scale: 1.02,
          yPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.7 },
        });
      });

      ScrollTrigger.refresh();
    });

    return () => {
      context.revert();
      root.classList.remove("cbj-heritage-motion-mounted");
    };
  }, []);

  return <PageTransition active={transitionActive} />;
}
