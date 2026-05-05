"use client";

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const carModels = [
  { name: 'GT-R', nameJa: '日産', year: '2007-2025', image: '/car-gtr.jpg' },
  { name: '911', nameJa: 'ポルシェ', year: '1963-', image: '/car-corvette.jpg' },
  { name: 'S-CLASS', nameJa: 'メルセデス', year: '1972-', image: '/car-mustang.jpg' },
  { name: 'M3', nameJa: 'BMW', year: '1986-', image: '/car-red.jpg' },
  { name: 'SUPRA', nameJa: 'トヨタ', year: '2019-', image: '/hero-bugatti-v3.jpg' },
];

export default function HorizontalScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const cards = container.querySelectorAll('.h-card');
    const totalWidth = container.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      const tween = gsap.to(container, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.3, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left 80%',
              end: 'left 20%',
              scrub: true,
            },
          }
        );
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#0A0A0A] overflow-hidden">
      <div className="px-6 lg:px-12 pt-20 pb-10">
        <p className="text-[9px] tracking-[0.5em] text-white/30 uppercase mb-1">
          LEGEND
        </p>
        <h2
          className="font-serif text-6xl sm:text-8xl md:text-9xl leading-none"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.2)',
            WebkitTextFillColor: 'transparent',
          }}
        >
          MODELS
        </h2>
      </div>
      <div
        ref={containerRef}
        className="flex gap-4 px-6 lg:px-12 pb-20"
        style={{ width: 'max-content' }}
      >
        {carModels.map((car, i) => (
          <div
            key={car.name}
            className="h-card relative w-[70vw] sm:w-[50vw] lg:w-[32vw] flex-shrink-0 group cursor-pointer"
          >
            <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden rounded-xl bg-[#111]">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
              <div className="absolute top-5 right-5 font-serif text-7xl text-white/5">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-[9px] tracking-[0.3em] text-white/40 uppercase mb-1">
                  {car.nameJa}
                </p>
                <h3
                  className="font-serif text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight"
                  style={{
                    WebkitTextStroke: '1px rgba(255,255,255,0.2)',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {car.name}
                </h3>
                <p className="text-[10px] text-white/30 tracking-[0.2em] mt-2">
                  {car.year}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
