"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { src: '/hero-bugatti-v3.jpg', col: 'col-span-2 row-span-2', aspect: 'aspect-square' },
  { src: '/car-gtr.jpg', col: 'col-span-1 row-span-1', aspect: 'aspect-[3/4]' },
  { src: '/car-mustang.jpg', col: 'col-span-1 row-span-2', aspect: 'aspect-[3/5]' },
  { src: '/car-corvette.jpg', col: 'col-span-1 row-span-1', aspect: 'aspect-square' },
  { src: '/car-red.jpg', col: 'col-span-1 row-span-1', aspect: 'aspect-[4/3]' },
  { src: '/detail-engine.jpg', col: 'col-span-1 row-span-1', aspect: 'aspect-[3/4]' },
  { src: '/detail-oil.jpg', col: 'col-span-1 row-span-1', aspect: 'aspect-square' },
  { src: '/detail-wheel.jpg', col: 'col-span-2 row-span-1', aspect: 'aspect-[16/9]' },
];

export default function BentoGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: i * 0.06,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 bg-[#0A0A0A]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-auto">
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`group relative overflow-hidden rounded-xl ${item.col}`}
            >
              <div className={`w-full ${item.aspect}`}>
                <img
                  src={item.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
