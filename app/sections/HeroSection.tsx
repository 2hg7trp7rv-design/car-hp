"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.35 });
    if (titleRef.current) {
      const lines = titleRef.current.querySelectorAll('.title-line');
      gsap.set(lines, { y: 56, opacity: 0 });
      tl.to(lines, {
        y: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
      });
      const panel = titleRef.current.querySelector('.hero-visual');
      if (panel) {
        gsap.set(panel, { y: 32, opacity: 0 });
        tl.to(panel, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.35);
      }
    }
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const content = sectionRef.current.querySelector('.hero-content') as HTMLElement;
      if (content) {
        content.style.transform = `translateY(${window.scrollY * 0.18}px)`;
        content.style.opacity = `${Math.max(0, 1 - window.scrollY / 700)}`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
    >
      <div
        ref={titleRef}
        className="hero-content relative z-10 mx-auto grid w-full max-w-[1200px] items-center gap-12 px-[clamp(20px,5svw,48px)] pb-[clamp(48px,7svh,80px)] pt-[clamp(96px,14svh,144px)] lg:min-h-[85vh] lg:grid-cols-[1.25fr_0.75fr] lg:gap-12"
      >
        {/* 左: タイポグラフィの表紙 */}
        <div>
          <p
            className="title-line text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--teal)]"
            style={{ fontFamily: "var(--font-quick), var(--font-zen), sans-serif" }}
          >
            Car Boutique Journal
            <span className="inline-block">&nbsp;— クルマの解決雑誌</span>
          </p>
          <h1 className="mt-6 text-[clamp(2.1rem,8svw,2.9rem)] font-bold leading-[1.34] tracking-[-0.01em] text-[var(--ink)]">
            <span className="block">
              <span className="title-line block lg:inline">クルマの</span>
              <span className="title-line block lg:inline">&ldquo;わからない&rdquo;を、</span>
            </span>
            <span className="block">
              <span className="title-line block lg:inline">やさしく</span>
              <span className="title-line block lg:inline">解決する雑誌。</span>
            </span>
          </h1>
          <div className="title-line mt-7 h-1 w-16 rounded-full bg-[var(--teal)]" aria-hidden="true" />
          <p className="title-line mt-7 max-w-[32rem] text-[clamp(14px,1.6svw,16px)] leading-[1.95] text-[var(--ink-soft)]">
            維持費、カスタム、故障の兆候、保険の選び方。専門用語はかみ砕き、判断の順番は一次情報で裏づけ。はじめての人でも迷わず読める、実用の記事を届けます。
          </p>
          <div className="title-line mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/guide"
              className="inline-flex min-h-12 items-center rounded-full bg-[var(--teal)] px-7 text-[14px] font-bold tracking-[0.06em] text-white shadow-[0_10px_24px_rgba(14,124,123,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--teal-deep)]"
            >
              ガイドを読む
            </Link>
            <Link
              href="/column"
              className="inline-flex min-h-12 items-center rounded-full border border-[var(--ink)]/25 px-7 text-[14px] font-bold tracking-[0.06em] text-[var(--ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              コラムを読む
            </Link>
          </div>
        </div>

        {/* 右: 縦長ビジュアルパネル（PCのみ） */}
        <div className="hero-visual relative hidden lg:block" aria-hidden="true">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[linear-gradient(160deg,#0E7C7B,#0A5F5E)] p-6 shadow-[0_24px_64px_rgba(14,95,94,0.24)]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -left-16 bottom-1/3 h-72 w-72 rounded-full border border-white/20" />
            <div className="absolute right-10 top-16 h-16 w-16 rounded-full border-2 border-white/25" />
            <p className="relative font-editorial text-[10px] font-bold uppercase tracking-[0.4em] text-white/70">
              Issue — Mobility, made clear
            </p>
            <p className="absolute left-6 top-[16%] font-editorial text-[clamp(30px,3.4vw,48px)] font-bold uppercase leading-[1.08] tracking-[0.08em] text-white/[0.14]">
              Car<br />Boutique<br />Journal
            </p>
            <div className="absolute inset-x-6 bottom-6 overflow-hidden rounded-[14px] shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-bugatti-v3.jpg"
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="text-[9px] uppercase tracking-[0.4em] text-[var(--ink-soft)]">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-[var(--ink)]/40 to-transparent" />
      </div>
    </section>
  );
}
