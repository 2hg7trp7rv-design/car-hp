"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stories = [
  { title: 'GT-R', meta: 'R35', image: '/car-gtr.jpg' },
  { title: 'KEY', meta: '911', image: '/detail-wheel.jpg' },
  { title: 'DEALER', meta: 'SERVICE', image: '/detail-oil.jpg' },
  { title: 'BELT', meta: 'CHECK', image: '/detail-engine.jpg' },
  { title: 'SUSP', meta: 'DETAIL', image: '/car-red.jpg' },
  { title: '911', meta: '1963-', image: '/hero-bugatti-v3.jpg' },
];

export default function ArchiveStories() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(section.querySelectorAll('.archive-heading'), { y: 40, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 78%', toggleActions: 'play none none none' },
      });
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card, { y: 64, opacity: 0, scale: 0.96 }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: i * 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#0A0A0A] px-4 sm:px-6 lg:px-12 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-10 pb-7 border-b border-white/[0.06]">
          <p className="archive-heading text-[9px] tracking-[0.5em] text-white/25 uppercase mb-2">ARCHIVE</p>
          <h2
            className="archive-heading font-serif text-5xl sm:text-7xl md:text-8xl leading-none"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.12)', WebkitTextFillColor: 'transparent' }}
          >
            STORIES
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story, i) => (
            <a
              key={`${story.title}-${i}`}
              ref={(el) => { cardRefs.current[i] = el; }}
              href="/cars"
              className="group relative block overflow-hidden rounded-xl border border-white/[0.055] bg-white/[0.018]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={story.image} alt="" className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/22 to-transparent" />
              </div>
              <div className="absolute top-4 left-4 text-[8px] tracking-[0.28em] uppercase text-white/40">{story.meta}</div>
              <div className="absolute left-0 right-0 bottom-0 px-4 pb-3 pointer-events-none">
                <h3
                  className="font-serif text-5xl sm:text-6xl leading-none"
                  style={{ WebkitTextStroke: '1px rgba(255,255,255,0.12)', WebkitTextFillColor: 'transparent' }}
                >
                  {story.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
