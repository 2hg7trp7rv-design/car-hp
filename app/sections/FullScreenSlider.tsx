"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const slides = [
  { image: '/hero-bugatti-v3.jpg', brand: 'MERCEDES-BENZ', code: 'SILK' },
  { image: '/car-gtr.jpg', brand: 'PORSCHE 911', code: 'AIR' },
  { image: '/car-mustang.jpg', brand: 'BMW M3', code: 'STEEL' },
  { image: '/car-corvette.jpg', brand: 'TOYOTA SUPRA', code: 'FLUX' },
];

export default function FullScreenSlider() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      const totalHeight = container.scrollHeight - window.innerHeight;

      gsap.to(container, {
        y: -totalHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalHeight}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#0A0A0A] overflow-hidden">
      <div ref={containerRef} className="relative">
        {slides.map((slide, i) => (
          <div key={i} className="relative w-full h-screen flex-shrink-0">
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-[#0A0A0A]/20 to-[#0A0A0A]/40" />
            <div className="absolute bottom-12 left-6 sm:left-10 z-10">
              <p className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-2">
                {slide.brand}
              </p>
              <h2
                className="font-serif text-6xl sm:text-8xl md:text-9xl leading-none"
                style={{
                  WebkitTextStroke: '1px rgba(255,255,255,0.4)',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {slide.code}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
