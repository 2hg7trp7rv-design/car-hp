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

function formatCount(value: number): string {
  return value.toLocaleString("ja-JP");
}

export function HeroSection({ stats, overviewShortcuts }: HeroSectionProps) {
  return (
    <section
      aria-label="CAR BOUTIQUE JOURNAL トップコンテンツ概要"
      className="relative overflow-hidden bg-[var(--bg-stage)] text-[var(--text-primary)]"
    >
      <div className="absolute inset-x-0 top-0 h-[74%] sm:h-[78%] lg:h-[82%]">
        <Image
          src="/images/hero-cb.jpg"
          alt="街路樹の下に停まるシルバーのセダン"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,242,235,0.22)_0%,rgba(246,242,235,0.06)_30%,rgba(246,242,235,0.68)_74%,rgba(246,242,235,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(122,135,108,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(192,124,89,0.16),transparent_28%),radial-gradient(circle_at_52%_84%,rgba(246,242,235,0.08),transparent_36%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)] lg:items-end">
          <div className="max-w-3xl">
            <Reveal delay={40}>
              <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.26em] text-[var(--text-secondary)]">
                <span className="rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.74)] px-3 py-1">
                  CAR BOUTIQUE JOURNAL
                </span>
                <span className="hidden h-px w-8 bg-[var(--border-default)] sm:inline-block" />
                <span className="text-[var(--accent-strong)]">自動車メディア</span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="serif-heading mt-6 max-w-[11ch] text-[clamp(2.25rem,7.5vw,5.2rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-[var(--text-primary)]">
                車のある空気を、
                <br />
                読む。
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-5 max-w-2xl text-[15px] leading-[1.95] text-[var(--text-secondary)] sm:text-[16px]">
                車種、買い方、整備、系譜。必要な情報をカテゴリごとに探せます。
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/cars"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--accent-strong)] bg-[var(--surface-1)] px-5 text-[13px] font-medium tracking-[0.12em] text-[var(--text-primary)] transition hover:-translate-y-px hover:bg-[var(--surface-moss)]"
                >
                  車種を見る
                </Link>
              </div>
            </Reveal>

            {stats && (
              <Reveal delay={260}>
                <dl className="mt-9 flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { label: "車種", value: formatCount(stats.carsCount) },
                    { label: "コラム", value: formatCount(stats.columnsCount) },
                    { label: "ガイド", value: formatCount(stats.guidesCount) },
                    { label: "ヘリテージ", value: formatCount(stats.heritageCount) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.74)] px-4 py-2"
                    >
                      <dt className="text-[10px] tracking-[0.22em] text-[var(--text-tertiary)]">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-[14px] font-medium text-[var(--text-primary)]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>

          {overviewShortcuts && overviewShortcuts.length > 0 ? (
            <Reveal delay={320}>
              <aside className="rounded-[28px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.82)] p-5 shadow-soft-card backdrop-blur-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--text-tertiary)]">
                      概要
                    </p>
                    <p className="serif-heading mt-2 text-[24px] font-medium leading-[1.3] text-[var(--text-primary)]">
                      このサイトでできること
                    </p>
                  </div>
                </div>

                <nav className="mt-5 grid gap-2">
                  {overviewShortcuts.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="group flex items-start gap-3 rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] px-4 py-4 transition hover:-translate-y-px hover:border-[rgba(122,135,108,0.38)] hover:bg-[var(--surface-moss)]"
                      aria-label={s.label}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent-strong)]">
                        <ShortcutIcon kind={s.kind} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                          {s.label}
                        </span>
                        <span className="mt-1 block text-[14px] leading-[1.7] text-[var(--text-primary)]">
                          {s.desc}
                        </span>
                      </span>
                    </Link>
                  ))}
                </nav>
              </aside>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
