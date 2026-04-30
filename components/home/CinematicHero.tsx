"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const imageContainer = imageContainerRef.current;
    const image = imageRef.current;
    const mask = maskRef.current;
    const wordmark = wordmarkRef.current;
    const label = labelRef.current;
    const lines = lineRefs.current.filter(Boolean);

    if (!section || !imageContainer || !image || !mask || !wordmark || !label) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Initial states
    gsap.set(mask, { scaleY: 1, transformOrigin: "top" });
    gsap.set(image, { scale: 1.3, opacity: 0 });
    gsap.set(lines, { y: 120, opacity: 0, rotateX: -45 });
    gsap.set(label, { opacity: 0, y: 20 });

    // Intro animation
    const introTl = gsap.timeline({
      delay: 0.2,
      onComplete: () => setIsLoaded(true),
    });

    if (!prefersReducedMotion) {
      // Reveal mask slides up
      introTl.to(mask, {
        scaleY: 0,
        duration: 1.4,
        ease: "power4.inOut",
      });

      // Image scales down and fades in
      introTl.to(
        image,
        {
          scale: 1,
          opacity: 1,
          duration: 1.8,
          ease: "power3.out",
        },
        0.2
      );

      // Staggered text reveal
      introTl.to(
        lines,
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          stagger: 0.08,
          ease: "power4.out",
        },
        0.6
      );

      // Label fades in
      introTl.to(
        label,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        1
      );
    } else {
      gsap.set(mask, { scaleY: 0 });
      gsap.set(image, { scale: 1, opacity: 1 });
      gsap.set(lines, { y: 0, opacity: 1, rotateX: 0 });
      gsap.set(label, { opacity: 1, y: 0 });
      setIsLoaded(true);
    }

    // Scroll animations
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      // Image: dramatic scale and fade
      scrollTl.to(
        imageContainer,
        {
          scale: 1.3,
          opacity: 0,
          ease: "none",
        },
        0
      );

      // Each line moves at different speeds (parallax depth)
      lines.forEach((line, i) => {
        scrollTl.to(
          line,
          {
            y: -150 - i * 50,
            opacity: 0,
            ease: "none",
          },
          0
        );
      });

      // Label
      scrollTl.to(
        label,
        {
          opacity: 0,
          y: -60,
          ease: "none",
        },
        0
      );
    }, section);

    return () => {
      ctx.revert();
      introTl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-16 h-[100dvh] w-full overflow-hidden lg:-mt-[72px]"
      style={{ backgroundColor: "#0A0A0A" }}
      aria-label="CAR BOUTIQUE JOURNAL hero"
    >
      {/* Film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />

      {/* Reveal mask */}
      <div
        ref={maskRef}
        className="absolute inset-0 z-40"
        style={{ backgroundColor: "#0A0A0A" }}
        aria-hidden="true"
      />

      {/* Image container */}
      <div
        ref={imageContainerRef}
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: "center center" }}
      >
        <img
          ref={imageRef}
          src="/images/hero-editorial.jpg"
          alt="Luxury sports car in dramatic editorial lighting"
          className="h-full w-full object-cover will-change-transform"
          style={{ transformOrigin: "center center" }}
        />
        {/* Gradient overlays for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0) 50%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0) 60%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Monospace label - top right */}
      <div
        ref={labelRef}
        className="absolute right-5 top-20 z-30 sm:right-8 sm:top-24 lg:right-12 lg:top-28"
      >
        <span
          className="font-mono text-[9px] font-normal uppercase sm:text-[10px]"
          style={{
            color: "#1B3FE5",
            letterSpacing: "0.25em",
          }}
        >
          Automotive Editorial — 2026
        </span>
      </div>

      {/* Wordmark - bottom left with perspective */}
      <div
        ref={wordmarkRef}
        className="absolute bottom-8 left-4 z-30 sm:bottom-12 sm:left-6 lg:bottom-16 lg:left-12"
        style={{
          perspective: "1000px",
        }}
      >
        <h1
          className="flex flex-col gap-0"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {["CAR", "BOUTIQUE", "JOURNAL"].map((word, i) => (
            <span
              key={word}
              ref={(el) => { lineRefs.current[i] = el; }}
              className="block will-change-transform"
              style={{
                fontFamily: '"Inter Tight", system-ui, sans-serif',
                fontWeight: 900,
                fontSize: "clamp(2.8rem, 12vw, 10rem)",
                lineHeight: 0.88,
                letterSpacing: "-0.04em",
                color: "#F6F2EB",
                textShadow: "0 4px 60px rgba(0,0,0,0.5)",
                transformStyle: "preserve-3d",
              }}
            >
              {word}
            </span>
          ))}
        </h1>
      </div>

      {/* Bottom line accent */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30"
        style={{
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(27,63,229,0.4) 20%, rgba(27,63,229,0.4) 80%, transparent)",
        }}
        aria-hidden="true"
      />

      {/* Corner accents */}
      <div
        className="absolute bottom-8 right-5 z-30 hidden sm:block sm:right-8 lg:right-12"
        aria-hidden="true"
      >
        <div
          className="flex flex-col items-end gap-1"
          style={{ color: "rgba(246,242,235,0.3)" }}
        >
          <span
            className="font-mono text-[9px] uppercase"
            style={{ letterSpacing: "0.2em" }}
          >
            Vol. 001
          </span>
          <div
            className="h-px w-12"
            style={{ backgroundColor: "rgba(246,242,235,0.2)" }}
          />
        </div>
      </div>
    </section>
  );
}
