"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Enhance the table of contents and reading progress; article content is visible without JavaScript. */
export function EditorialArticleMotionClient() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-cbj-article-page]");
    if (!root) return;

    const progressBar = root.querySelector<HTMLElement>("[data-cbj-progress-bar]");
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-cbj-toc-link]"));
    const sections = links.flatMap((link) => {
      const id = link.hash.slice(1);
      const section = id ? root.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
      return section ? [section] : [];
    });
    let activeId = "";
    const setActive = (id: string) => {
      if (id === activeId) return;
      activeId = id;
      for (const link of links) {
        const active = link.hash === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    };
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -58% 0px", threshold: 0.01 });
    sections.forEach((section) => observer.observe(section));
    if (sections[0]) setActive(sections[0].id);

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const fraction = Math.max(0, Math.min(1, window.scrollY / height));
      if (progressBar) progressBar.style.width = `${(fraction * 100).toFixed(2)}%`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [pathname]);

  return null;
}
