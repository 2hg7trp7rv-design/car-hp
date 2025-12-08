// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import {
  getAllHeritage,
  type HeritageItem,
} from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "HERITAGE | ブランドの系譜と名車の歴史",
  description:
    "ブランドの系譜や名車の歴史を、年代やメーカーごとに整理してたどれるHERITAGEコンテンツ。",
};

type HeritageGroup = {
  maker: string;
  items: HeritageItem[];
};

type HeritageWithMeta = HeritageItem & {
  platformCode?: string | null;
  generationLabel?: string | null;
  titleEn?: string | null;
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function sortHeritageForList(items: HeritageItem[]): HeritageItem[] {
  return [...items].sort((a, b) => {
    const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
    const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);
    if (ad && bd) return bd.getTime() - ad.getTime();
    if (bd && !ad) return 1;
    if (ad && !bd) return -1;
    // 日付が両方ない場合はタイトルで
    return (a.title ?? "").localeCompare(b.title ?? "");
  });
}

function groupByMaker(items: HeritageItem[]): HeritageGroup[] {
  const map = new Map<string, HeritageItem[]>();

  for (const item of items) {
    const maker = item.maker ?? "OTHER";
    const list = map.get(maker) ?? [];
    list.push(item);
    map.set(maker, list);
  }

  return Array.from(map.entries())
    .map(([maker, list]) => ({
      maker,
      items: sortHeritageForList(list),
    }))
    .sort((a, b) => a.maker.localeCompare(b.maker));
}

export default async function HeritageIndexPage() {
  const all = await getAllHeritage();

  const published = all.filter(
    (item) =>
      !item.status ||
      item.status === "published" ||
      item.status === "PUBLIC",
  );

  const groups = groupByMaker(published);

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 背景レイヤー：ヘリテイジ専用の静かな光 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="absolute -left-[18%] top-[12%] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.22),_transparent_70%)] blur-[120px]" />
        <div className="absolute -right-[20%] bottom-[-8%] h-[52vw] w-[52vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(8,47,73,0.26),_transparent_75%)] blur-[130px]" />
      </div>

      {/* ヒーロー */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-slate-50/90 via-white/90 to-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-8 sm:px-6 md:pb-12 md:pt-10">
          <Reveal>
            <nav className="flex items-center text-[11px] text-slate-500">
              <Link href="/" className="hover:text-slate-800">
                HOME
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-400">HERITAGE</span>
            </nav>
          </Reveal>

          <Reveal delay={80}>
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                BRAND HERITAGE
              </p>
              <h1 className="serif-heading text-2xl font-semibold tracking-wide text-slate-900 sm:text-3xl md:text-[2.1rem]">
                ブランドの系譜と名車の歴史
              </h1>
              <p className="max-w-3xl text-xs leading-relaxed text-text-sub sm:text-sm">
                F40やM3、GT-Rなど、クルマ文化をつくってきたモデルたちを「ブランドの系譜」として整理しながら、
                どの時代にどんなキャラクターのクルマがいたのかを振り返れるエリアです。
                スペックの羅列ではなく、「その時代にイケていた理由」を丁寧に追いかけていきます。
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                各ブランドごとに系譜をたどれる「読み物＋データベース」エリア
              </span>
              <span className="hidden h-[1px] w-8 bg-slate-200 sm:block" />
              <span className="hidden text-[10px] tracking-[0.2em] text-slate-400 sm:inline">
                ERA / CHASSIS / ICONIC MODELS
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* メーカーごとのグループ表示 */}
      <section className="pb-12 pt-6 sm:pb-16 sm:pt-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
          {groups.map((group) => (
            <Reveal key={group.maker}>
              <div className="space-y-4">
                {/* メーカー見出し */}
                <div className="flex items-baseline justify-between gap-3 border-b border-slate-200/70 pb-2">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700 sm:text-[13px]">
                      {group.maker}
                    </h2>
                    <span className="hidden h-[1px] w-10 bg-slate-200 sm:block" />
                    <p className="hidden text-[11px] text-slate-500 sm:block">
                      {group.items.length} MODELS IN HERITAGE
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 sm:hidden">
                    {group.items.length} MODEL
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map((item) => {
                    const tags = item.tags ?? [];
                    const h = item as HeritageWithMeta;

                    return (
                      <Link
                        key={item.slug}
                        href={`/heritage/${encodeURIComponent(item.slug)}`}
                        className="group"
                      >
                        <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-white/90 via-slate-50/90 to-white/96 shadow-soft transition group-hover:-translate-y-[1px] group-hover:border-tiffany-300">
                          <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
                            {/* 上段：時代ラベル＋コード系 */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-slate-500">
                              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-slate-100">
                                {item.eraLabel ?? "ERA"}
                              </span>
                              {(h.platformCode || h.generationLabel) && (
                                <>
                                  <span className="h-[1px] w-5 bg-slate-200" />
                                  {h.platformCode && (
                                    <span className="text-[9px] uppercase tracking-[0.24em] text-slate-500">
                                      {h.platformCode}
                                    </span>
                                  )}
                                  {h.generationLabel && (
                                    <span className="text-[9px] text-slate-500">
                                      {h.generationLabel}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* タイトル系 */}
                            <div className="space-y-1.5">
                              <h3 className="line-clamp-2 text-[15px] font-semibold leading-relaxed text-slate-900 sm:text-[16px]">
                                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                                  {item.titleJa ?? item.title}
                                </span>
                              </h3>
                              {(item.modelName || h.titleEn) && (
                                <p className="text-[11px] text-slate-500">
                                  {item.modelName && (
                                    <span className="font-medium text-slate-600">
                                      {item.modelName}
                                    </span>
                                  )}
                                  {item.modelName && h.titleEn && (
                                    <span className="mx-1 text-slate-400">
                                      /
                                    </span>
                                  )}
                                  {h.titleEn && (
                                    <span className="italic text-slate-500">
                                      {h.titleEn}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>

                            {/* サマリー */}
                            {item.summary && (
                              <p className="line-clamp-3 text-[12px] leading-relaxed text-text-sub">
                                {item.summary}
                              </p>
                            )}

                            {/* タグ */}
                            {tags.length > 0 && (
                              <div className="mt-auto pt-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}

          {groups.length === 0 && (
            <p className="text-sm text-slate-500">
              HERITAGEデータがまだ登録されていません。
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
