"use client";

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 500, suffix: '+', label: '記事', labelEn: 'ARTICLES' },
  { value: 200, suffix: '+', label: '車種', labelEn: 'MODELS' },
  { value: 75, suffix: '', label: '年', labelEn: 'YEARS' },
  { value: 50, suffix: 'K+', label: '読者', labelEn: 'READERS' },
];

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = value / (2000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span
      className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tabular-nums leading-none"
      style={{
        WebkitTextStroke: '1px rgba(255,255,255,0.3)',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        onEnter: () => setInView(true),
      });
      gsap.fromTo(
        section.querySelectorAll('.stat-item'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-[#0A0A0A] overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-white/20" />
      <div className="px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[9px] tracking-[0.5em] text-white/25 uppercase mb-12">
            BY THE NUMBERS
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {stats.map((stat) => (
              <div key={stat.labelEn} className="stat-item text-center">
                <div className="mb-3">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    inView={inView}
                  />
                </div>
                <p className="text-xs text-white/40 tracking-wider">
                  {stat.label}
                </p>
                <p className="text-[8px] tracking-[0.3em] text-white/20 uppercase">
                  {stat.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
