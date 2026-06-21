"use client";

import { useEffect } from "react";

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function EditorialArticleMotionClient() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-cbj-article-page]");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-cbj-reveal]"),
    );
    const progressBar = root.querySelector<HTMLElement>(
      "[data-cbj-progress-bar]",
    );
    const tocLinks = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("[data-cbj-toc-link]"),
    );
    const tocSections = tocLinks
      .map((link) => {
        const id = link.getAttribute("href")?.replace(/^#/, "");
        return id
          ? root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
          : null;
      })
      .filter(Boolean) as HTMLElement[];

    revealTargets.forEach((target) => {
      const delay = target.dataset.cbjDelay;
      if (delay)
        target.style.setProperty(
          "--cbj-reveal-delay",
          `${Number(delay) || 0}ms`,
        );
    });

    const setActiveToc = (id: string) => {
      tocLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    root.classList.add("cbj-motion-ready");
    revealTargets.forEach((target) => target.classList.add("cbj-reveal-visible"));

    if (reduceMotion.matches) {
      root.style.setProperty("--cbj-prelude-progress", "1");
    } else {
      const tocObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            )[0];
          if (visible?.target instanceof HTMLElement)
            setActiveToc(visible.target.id);
        },
        { rootMargin: "-30% 0px -58% 0px", threshold: 0.01 },
      );

      tocSections.forEach((section) => tocObserver.observe(section));

      let ticking = false;

      const updateScrollState = () => {
        ticking = false;
        const viewportHeight = window.innerHeight || 1;
        const scrollProgress = window.scrollY / viewportHeight;
        root.style.setProperty(
          "--cbj-scroll-progress",
          scrollProgress.toFixed(4),
        );

        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        const pct = clamp(window.scrollY / max, 0, 1) * 100;
        if (progressBar) progressBar.style.width = `${pct.toFixed(3)}%`;

        const prelude = root.querySelector<HTMLElement>("[data-cbj-prelude]");
        if (prelude) {
          const rect = prelude.getBoundingClientRect();
          const progress = clamp(
            (0 - rect.top) / Math.max(1, rect.height * 0.72),
          );
          root.style.setProperty("--cbj-prelude-progress", progress.toFixed(4));
        }

        const parallaxTargets = Array.from(
          root.querySelectorAll<HTMLElement>("[data-cbj-parallax]"),
        );
        parallaxTargets.forEach((target) => {
          const rect = target.getBoundingClientRect();
          const progress = clamp(
            (viewportHeight - rect.top) /
              Math.max(1, viewportHeight + rect.height),
          );
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
      if (tocSections[0]) setActiveToc(tocSections[0].id);
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);

      return () => {
        tocObserver.disconnect();
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
        root.classList.remove("cbj-motion-ready");
      };
    }
  }, []);

  return null;
}
