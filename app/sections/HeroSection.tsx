"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(root.querySelectorAll(".hero-line"), { y: 56, opacity: 0 });
      gsap.set(root.querySelector(".hero-visual"), { y: 40, opacity: 0 });

      const tl = gsap.timeline({ delay: 0.35, defaults: { ease: "power3.out" } });
      tl.to(root.querySelectorAll(".hero-line"), {
        y: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.14,
      }).to(
        root.querySelector(".hero-visual"),
        { y: 0, opacity: 1, duration: 1.3, ease: "power2.out" },
        0.3
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--paper)]"
      aria-label="CAR BOUTIQUE JOURNAL トップヒーロー"
    >
      <div className="mx-auto grid min-h-[85svh] w-full max-w-[1180px] grid-cols-1 items-center gap-10 px-[clamp(20px,5svw,48px)] pb-[clamp(48px,7svh,72px)] pt-[clamp(88px,12svh,128px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* 左: タイポグラフィ主体の表紙 */}
        <div>
          <p className="hero-line font-[family-name:var(--font-editorial)] text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--teal)] sm:text-[11px] sm:tracking-[0.34em]">
            CAR BOUTIQUE JOURNAL — クルマの解決雑誌
          </p>
          <h1 className="hero-line mt-6 text-[clamp(1.75rem,4.4svw,3.05rem)] font-bold leading-[1.34] tracking-[-0.01em] text-[var(--ink)]">
            クルマの&ldquo;わからない&rdquo;を、
            <br />
            やさしく解決する雑誌。
          </h1>
          <div className="hero-line mt-8 h-1 w-16 rounded-full bg-[var(--teal)]" aria-hidden="true" />
          <p className="hero-line mt-6 max-w-[34rem] text-[15px] leading-[2] text-[var(--ink-soft)] sm:text-[16px]">
            維持費、カスタム、故障の兆候、保険の選び方。
            確認できる一次情報にもとづいて、判断の順番までやさしく整理した記事をお届けします。
          </p>
          <div className="hero-line mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/guide"
              className="inline-flex min-h-12 items-center rounded-full bg-[var(--teal)] px-7 text-[14px] font-bold tracking-[0.06em] text-white transition-colors hover:bg-[var(--teal-deep)]"
            >
              ガイドを読む
            </Link>
            <Link
              href="/column"
              className="inline-flex min-h-12 items-center rounded-full border border-[var(--ink)]/25 px-7 text-[14px] font-bold tracking-[0.06em] text-[var(--ink)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              コラムを読む
            </Link>
          </div>
        </div>

        {/* 右: ビジュアルパネル（PCのみ） */}
        <div className="hero-visual relative hidden lg:block" aria-hidden="true">
          <div className="relative overflow-hidden rounded-[14px] bg-[linear-gradient(150deg,#0E7C7B,#0A5F5E)] p-8 shadow-[0_24px_56px_rgba(14,124,123,0.22)]">
            <span className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <span className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/15" />
            <p className="relative font-[family-name:var(--font-editorial)] text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">
              Latest Issue
            </p>
            <div className="relative mt-5 overflow-hidden rounded-[14px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-bugatti-v3.jpg"
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <p className="relative mt-5 text-[13px] leading-[1.8] text-white/85">
              テーマ別ガイドと、じっくり読めるコラム。迷ったときの一冊めに。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
