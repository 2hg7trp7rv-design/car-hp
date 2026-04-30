"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageWrap = imageWrapRef.current;
    const wordmark = wordmarkRef.current;

    if (!section || !imageWrap || !wordmark) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Image scroll animation: scale up to 1.2x and fade to 0.4
      gsap.to(imageWrap, {
        scale: 1.2,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      // Wordmark scroll animation: slide up and shrink
      gsap.to(wordmark, {
        y: -100,
        scale: 0.88,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-[64px] h-[100dvh] w-full overflow-hidden bg-paper lg:-mt-[72px]"
      aria-label="CAR BOUTIQUE JOURNAL hero"
    >
      {/* Background image with Ken Burns effect */}
      <div
        ref={imageWrapRef}
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: "center center" }}
      >
        <img
          src="/images/hero-cinematic.jpg"
          alt="Luxury sports car in dramatic editorial lighting"
          className="h-full w-full object-cover animate-ken-burns"
        />
        {/* Subtle vignette overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 0%, rgba(14, 12, 10, 0.12) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Paper edge visible at corners - cream background peeks through */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          boxShadow: "inset 0 0 80px 40px rgba(246, 242, 235, 0.3)",
        }}
        aria-hidden="true"
      />

      {/* Monospace label - top right */}
      <div className="absolute right-4 top-20 z-20 sm:right-6 sm:top-24 lg:right-10 lg:top-28">
        <span
          className="font-mono text-[10px] font-medium text-cobalt sm:text-[11px]"
          style={{ letterSpacing: "0.18em" }}
        >
          AUTOMOTIVE EDITORIAL — 2026
        </span>
      </div>

      {/* Wordmark - bottom left, asymmetric positioning */}
      <div
        ref={wordmarkRef}
        className="absolute bottom-10 left-4 z-20 sm:bottom-14 sm:left-6 lg:bottom-20 lg:left-10 will-change-transform"
        style={{ transformOrigin: "left bottom" }}
      >
        <h1 className="flex flex-col gap-0">
          <span
            className="block font-sans font-black text-ink"
            style={{
              fontSize: "clamp(2.75rem, 13vw, 9rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
            }}
          >
            CAR
          </span>
          <span
            className="block font-sans font-black text-ink"
            style={{
              fontSize: "clamp(2.75rem, 13vw, 9rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
            }}
          >
            BOUTIQUE
          </span>
          <span
            className="block font-sans font-black text-ink"
            style={{
              fontSize: "clamp(2.75rem, 13vw, 9rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
            }}
          >
            JOURNAL
          </span>
        </h1>
      </div>
    </section>
  );
}
