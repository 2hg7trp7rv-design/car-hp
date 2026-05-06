"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const parts = [
  { src: '/detail-wheel.jpg', x: '-30%', y: '-25%', rotate: -15, scale: 0.6, delay: 0 },
  { src: '/car-red.jpg', x: '35%', y: '-25%', rotate: 20, scale: 0.55, delay: 0.1 },
  { src: '/car-corvette.jpg', x: '25%', y: '30%', rotate: 15, scale: 0.6, delay: 0.2 },
  { src: '/detail-oil.jpg', x: '-35%', y: '25%', rotate: -20, scale: 0.5, delay: 0.3 },
  { src: '/hero-bugatti-v3.jpg', x: '0%', y: '0%', rotate: 5, scale: 0.7, delay: 0.15 },
];

export default function PartsAssemblySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    if (!section || !title) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        title.querySelectorAll('.reveal-text'),
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      imageRefs.current.forEach((img, i) => {
        if (!img) return;
        const p = parts[i];
        gsap.set(img, {
          x: p.x,
          y: p.y,
          rotate: p.rotate,
          scale: p.scale,
          opacity: 0,
          filter: 'blur(8px) brightness(0.5)',
        });
        gsap.to(img, {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          duration: 1.5,
          delay: p.delay,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: section,
            start: 'top 55%',
            end: 'center center',
            scrub: 2,
          },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[120vh] bg-[#0A0A0A] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10 pointer-events-none" />
      <div
        ref={titleRef}
        className="sticky top-0 z-20 flex flex-col items-center justify-center h-screen px-6 text-center"
      >
        <p className="reveal-text text-[9px] tracking-[0.5em] text-white/30 uppercase mb-4">
          CRAFT
        </p>
        <h2
          className="reveal-text font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] leading-[0.85]"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.4)',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PARTS
        </h2>
        <h2
          className="reveal-text font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] italic leading-[0.85]"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.4)',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TO ART
        </h2>
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-[260px] h-[260px] sm:w-[350px] sm:h-[350px]">
          {parts.map((p, i) => (
            <img
              key={i}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              src={p.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
