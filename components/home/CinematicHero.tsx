"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageWrap = imageWrapRef.current;
    const wordmark = wordmarkRef.current;
    const label = labelRef.current;

    if (!section || !imageWrap || !wordmark || !label) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Create a timeline for coordinated animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // Image: scale up and fade
      tl.to(
        imageWrap,
        {
          scale: 1.15,
          opacity: 0.3,
          ease: "none",
        },
        0
      );

      // Wordmark: subtle parallax up
      tl.to(
        wordmark,
        {
          y: -80,
          opacity: 0,
          ease: "none",
        },
        0
      );

      // Label: fade out faster
      tl.to(
        label,
        {
          opacity: 0,
          y: -20,
          ease: "none",
        },
        0
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-16 h-[100dvh] w-full overflow-hidden lg:-mt-[72px]"
      style={{ backgroundColor: "#F6F2EB" }}
      aria-label="CAR BOUTIQUE JOURNAL hero"
    >
      {/* Image container - inset from edges to show paper */}
      <div
        ref={imageWrapRef}
        className="absolute will-change-transform"
        style={{
          top: "12px",
          left: "12px",
          right: "12px",
          bottom: "12px",
          transformOrigin: "center center",
        }}
      >
        <img
          src="/images/hero-editorial.jpg"
          alt="Luxury sports car in dramatic editorial lighting"
          className="h-full w-full object-cover animate-ken-burns"
        />
      </div>

      {/* Monospace label - top right, inside the image frame */}
      <div
        ref={labelRef}
        className="absolute z-20"
        style={{
          top: "32px",
          right: "32px",
        }}
      >
        <span
          className="font-mono text-[10px] font-normal uppercase tracking-[0.2em]"
          style={{ color: "#1B3FE5" }}
        >
          Automotive Editorial — 2026
        </span>
      </div>

      {/* Wordmark - bottom left, overlapping the image edge */}
      <div
        ref={wordmarkRef}
        className="absolute z-20 will-change-transform"
        style={{
          bottom: "clamp(24px, 6vh, 64px)",
          left: "clamp(16px, 4vw, 48px)",
          transformOrigin: "left bottom",
        }}
      >
        <h1
          className="flex flex-col"
          style={{
            fontFamily:
              'var(--font-sans), "Inter Tight", "PP Neue Montreal", system-ui, sans-serif',
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            color: "#0E0C0A",
            mixBlendMode: "multiply",
          }}
        >
          <span
            style={{
              fontSize: "clamp(3rem, 14vw, 11rem)",
            }}
          >
            CAR
          </span>
          <span
            style={{
              fontSize: "clamp(3rem, 14vw, 11rem)",
            }}
          >
            BOUTIQUE
          </span>
          <span
            style={{
              fontSize: "clamp(3rem, 14vw, 11rem)",
            }}
          >
            JOURNAL
          </span>
        </h1>
      </div>
    </section>
  );
}
