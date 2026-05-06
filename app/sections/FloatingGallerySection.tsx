"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { src: '/hero-bugatti-v3.jpg', className: 'left-[5%] top-[6%] h-[260px] w-[130px] sm:h-[340px] sm:w-[170px]' },
  { src: '/car-gtr.jpg', className: 'right-[8%] top-[8%] h-[300px] w-[150px] sm:h-[390px] sm:w-[190px]' },
  { src: '/car-corvette.jpg', className: 'left-[38%] top-[28%] h-[210px] w-[120px] sm:h-[280px] sm:w-[160px]' },
  { src: '/car-mustang.jpg', className: 'right-[23%] top-[50%] h-[130px] w-[210px] sm:h-[170px] sm:w-[280px]' },
  { src: '/detail-engine.jpg', className: 'left-[12%] bottom-[14%] h-[130px] w-[210px] sm:h-[170px] sm:w-[280px]' },
  { src: '', className: 'right-[34%] top-[32%] h-[90px] w-[140px] rounded-[10px] border border-white/[0.06] bg-white/[0.035]' },
  { src: '', className: 'left-[58%] bottom-[18%] h-[70px] w-[110px] rounded-[10px] border border-white/[0.055] bg-white/[0.025]' },
];

export default function FloatingGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const direction = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(card, { y: 120 * direction, opacity: 0.1, scale: 0.92 }, {
          y: -70 * direction,
          opacity: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[125vh] overflow-hidden bg-[#0A0A0A]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      <div className="absolute inset-0">
        {cards.map((card, i) => (
          <div
            key={`${card.src}-${i}`}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`absolute overflow-hidden ${card.className}`}
          >
            {card.src ? (
              <>
                <img src={card.src} alt="" className="h-full w-full rounded-xl object-cover opacity-75" loading="lazy" />
                <div className="absolute inset-0 rounded-xl bg-black/18" />
              </>
            ) : null}
          </div>
        ))}
      </div>
      <div className="absolute bottom-10 left-4 sm:left-8 lg:left-12 z-10">
        <p className="mb-2 text-[9px] tracking-[0.5em] text-white/18 uppercase">VISUAL</p>
        <h2
          className="font-serif text-7xl sm:text-9xl lg:text-[10rem] leading-none"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.09)', WebkitTextFillColor: 'transparent' }}
        >
          GALLERY
        </h2>
      </div>
    </section>
  );
}
