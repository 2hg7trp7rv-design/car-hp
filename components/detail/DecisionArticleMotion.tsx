"use client";

import { useEffect } from "react";

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function DecisionArticleMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-cbj-article-page]");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-cbj-reveal]"));

    revealTargets.forEach((target) => {
      const delay = target.dataset.cbjDelay;
      if (delay) target.style.setProperty("--cbj-reveal-delay", `${Number(delay) || 0}ms`);
    });

    if (reduceMotion.matches) {
      root.classList.add("cbj-motion-ready");
      revealTargets.forEach((target) => target.classList.add("cbj-reveal-visible"));
      root.style.setProperty("--cbj-prelude-progress", "1");
      return;
    }

    root.classList.add("cbj-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("cbj-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      },
    );

    revealTargets.forEach((target) => observer.observe(target));

    let ticking = false;

    const updateScrollState = () => {
      ticking = false;
      const viewportHeight = window.innerHeight || 1;
      const scrollProgress = window.scrollY / viewportHeight;
      root.style.setProperty("--cbj-scroll-progress", scrollProgress.toFixed(4));

      const prelude = root.querySelector<HTMLElement>("[data-cbj-prelude]");
      if (prelude) {
        const rect = prelude.getBoundingClientRect();
        const progress = clamp((0 - rect.top) / Math.max(1, rect.height * 0.72));
        root.style.setProperty("--cbj-prelude-progress", progress.toFixed(4));
      }

      const parallaxTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-cbj-parallax]"));
      parallaxTargets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const progress = clamp((viewportHeight - rect.top) / Math.max(1, viewportHeight + rect.height));
        const travel = (progress - 0.5) * 2;
        target.style.setProperty("--cbj-parallax", travel.toFixed(4));
      });
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      root.classList.remove("cbj-motion-ready");
    };
  }, []);

  return null;
}
