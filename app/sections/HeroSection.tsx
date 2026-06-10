"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const heroImages = [
  '/hero-bugatti-v3.jpg',
  '/car-gtr.jpg',
  '/car-mustang.jpg',
  '/car-corvette.jpg',
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const imgs = sectionRef.current.querySelectorAll('.hero-slide');
    imgs.forEach((img, i) => {
      gsap.to(img, {
        opacity: i === currentImage ? 1 : 0,
        scale: i === currentImage ? 1.05 : 1.2,
        duration: 2.5,
        ease: 'power2.inOut',
      });
    });
  }, [currentImage]);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    if (titleRef.current) {
      gsap.set(titleRef.current.querySelectorAll('.title-line'), { y: 100, opacity: 0 });
      tl.to(titleRef.current.querySelectorAll('.title-line'), {
        y: 0,
        opacity: 1,
        duration: 1.4,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const content = sectionRef.current.querySelector('.hero-content') as HTMLElement;
      if (content) {
        content.style.transform = `translateY(${window.scrollY * 0.3}px)`;
        content.style.opacity = `${Math.max(0, 1 - window.scrollY / 600)}`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0">
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="hero-slide absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/30 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-[#0A0A0A]/40" />
      </div>
      <div
        ref={titleRef}
        className="hero-content relative z-10 flex flex-col items-center justify-center h-full px-6"
      >
        <p className="text-[9px] tracking-[0.6em] text-white/40 uppercase mb-8">
          AUTOMOTIVE
        </p>
        <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tight text-center">
          <span
            className="title-line block"
            style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.4)',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CAR
          </span>
          <span
            className="title-line block"
            style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.4)',
              WebkitTextFillColor: 'transparent',
            }}
          >
            BOUTIQUE
          </span>
          <span
            className="title-line block"
            style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.4)',
              WebkitTextFillColor: 'transparent',
            }}
          >
            JOURNAL
          </span>
        </h1>
        <div className="flex gap-2 mt-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`h-px transition-all duration-700 ${
                i === currentImage ? 'w-10 bg-white' : 'w-6 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[9px] tracking-[0.4em] text-white/40 uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
