"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRightIcon } from '@/components/CinemaIcons';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { label: 'CARS', labelJa: '車種', image: '/hero-bugatti-v3.jpg', count: 248, href: '/cars' },
  { label: 'GUIDE', labelJa: '実用', image: '/detail-oil.jpg', count: 156, href: '/guide' },
  { label: 'COLUMN', labelJa: '考察', image: '/car-red.jpg', count: 89, href: '/column' },
  { label: 'HERITAGE', labelJa: '系譜', image: '/car-gtr.jpg', count: 42, href: '/heritage' },
];

function CategoryItem({ cat, index }: { cat: typeof categories[0]; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [index]);

  return (
    <a
      ref={ref}
      href={cat.href}
      className="group relative block border-b border-white/10 first:border-t py-7 sm:py-10 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute right-16 top-1/2 -translate-y-1/2 w-40 h-28 sm:w-60 sm:h-40 rounded-lg overflow-hidden pointer-events-none transition-all duration-500 z-10"
        style={{
          opacity: hovered ? 1 : 0,
          transform: `translateY(-50%) scale(${hovered ? 1 : 0.85})`,
        }}
      >
        <img src={cat.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center justify-between relative z-0">
        <div className="flex items-baseline gap-5">
          <span className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white group-hover:text-white/60 transition-colors duration-500">
            {cat.label}
          </span>
          <span className="hidden md:block text-xs text-white/30 tracking-wider">
            {cat.labelJa}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden md:block text-[10px] tracking-[0.2em] text-white/20">
            {cat.count}
          </span>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all">
            <ArrowUpRightIcon
              size={16}
              className="text-white/60 group-hover:text-black transition-colors"
            />
          </div>
        </div>
      </div>
    </a>
  );
}

export default function CategoriesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = headerRef.current;
    if (!h) return;
    gsap.fromTo(
      h,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: h,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  return (
    <section className="relative py-20 sm:py-28 bg-[#0A0A0A]">
      <div className="px-6 lg:px-12 max-w-6xl mx-auto">
        <div ref={headerRef} className="mb-6">
          <p className="text-[9px] tracking-[0.5em] text-white/30 uppercase mb-1">
            BROWSE
          </p>
          <h2
            className="font-serif text-[9vw] sm:text-[7vw] md:text-[5vw] leading-none"
            style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.15)',
              WebkitTextFillColor: 'transparent',
            }}
          >
            INDEX
          </h2>
        </div>
        <div>
          {categories.map((c, i) => (
            <CategoryItem key={c.label} cat={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
