// components/home/HeroSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

type HeroStats = {
  carsCount: number;
  columnsCount: number;
  guidesCount: number;
  heritageCount: number;
};

type ShortcutKind = "cars" | "column" | "guide" | "heritage" | "database";

type OverviewShortcut = {
  href: string;
  label: string;
  desc: string;
  kind: ShortcutKind;
};

type HeroSectionProps = {
  stats?: HeroStats;
  overviewShortcuts?: readonly OverviewShortcut[];
};

function ShortcutIcon({ kind, className }: { kind: ShortcutKind; className?: string }) {
  const cls = className || "h-4 w-4";

  switch (kind) {
    case "cars":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M6.8 15.6h10.4M7.6 10.8l1.2-3.2h6.4l1.2 3.2M7.2 15.6l-1.2 2.4M17.8 15.6l1.2 2.4M7.6 18.8a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM16.4 18.8a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "column":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M7 6.5h10M7 10h10M7 13.5h7M6.2 3.8h9.9a2.5 2.5 0 0 1 2.5 2.5v11.4a2.5 2.5 0 0 1-2.5 2.5H8.2L5.4 20.2V6.3a2.5 2.5 0 0 1 .8-1.8 2.5 2.5 0 0 1 2-0.7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "guide":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M7 5.5h10M7 9h10M7 12.5h7M6 3.8h12a2 2 0 0 1 2 2v14.4a.9.9 0 0 1-1.4.7l-2.6-1.7-2.6 1.7a.9.9 0 0 1-1 0l-2.6-1.7-2.6 1.7A.9.9 0 0 1 4 20.2V5.8a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "heritage":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M12 3.5l7 3.6v5.8c0 4.4-3 7.7-7 8.6-4-0.9-7-4.2-7-8.6V7.1l7-3.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.2l2 2 4-4.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "database":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M6 7c0-1.7 3.1-3 6-3s6 1.3 6 3-3.1 3-6 3-6-1.3-6-3Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M6 7v5c0 1.7 3.1 3 6 3s6-1.3 6-3V7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6 12v5c0 1.7 3.1 3 6 3s6-1.3 6-3v-5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
  }
}

export function HeroSection({ overviewShortcuts }: HeroSectionProps) {
  return (
    <section aria-label="CAR BOUTIQUE JOURNAL トップコンテンツ概要" className="relative overflow-hidden bg-slate-950 text-white">
      {/* 背景（ヒーロー画像） */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-cb.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* 読みやすさのための光レイヤー */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(10,186,181,0.28),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,23,42,0.42),transparent_62%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/45 to-slate-950/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-16">
        {/* ラベル */}
        <Reveal delay={60}>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.28em] text-slate-100/80">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1">CAR BOUTIQUE JOURNAL</span>
            <span className="hidden h-[1px] w-6 bg-slate-300/70 sm:inline-block" />
            <span className="hidden text-slate-200/75 sm:inline">COLUMNS·CAR DATABASE·GUIDE·HERITAGE</span>
          </div>
        </Reveal>

        {/* タイトル */}
        <Reveal delay={160}>
          <h1 className="serif-heading mt-4 text-[2.2rem] font-semibold leading-[1.06] text-white sm:text-[3.0rem] lg:text-[3.4rem]">
            CAR BOUTIQUE JOURNAL
          </h1>
        </Reveal>

        {/* リード（最小） */}
        <Reveal delay={240}>
          <p className="mt-4 max-w-xl text-[12px] leading-relaxed tracking-[0.03em] text-slate-100/85">
            時代を超える価値を、整理する。
          </p>
        </Reveal>

        {/* ここにOVERVIEW（= 2枚目の囲い）をヒーロー内に配置 */}
        {overviewShortcuts && (
          <Reveal delay={320}>
            <div className="mt-8 max-w-xl rounded-3xl border border-white/10 bg-white/85 p-4 shadow-soft-card backdrop-blur">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.32em] text-slate-600">OVERVIEW</p>
                <p className="serif-heading mt-2 text-[18px] font-medium tracking-tight text-slate-900">
                  このサイトでできること
                </p>
              </div>

              <nav className="mt-4 grid grid-cols-2 gap-2">
                {overviewShortcuts.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 transition hover:bg-white"
                    aria-label={s.label}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700">
                      <ShortcutIcon kind={s.kind} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold tracking-[0.22em] text-slate-700">{s.label}</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-slate-900">{s.desc}</span>
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
