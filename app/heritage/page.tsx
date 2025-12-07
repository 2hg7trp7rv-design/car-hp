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
      {/* 背景の光レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[42vh] bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="absolute -left-[20%] top-[18%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.16),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[18%] bottom-[-12%] h-[52vw] w-[52vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.24),_transparent_75%)] blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ヒーロー */}
        <section className="border-b border-slate-100/70 bg-gradient-to-b from-white/90 via-vapor/70 to-transparent">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
            <Reveal>
              <nav className="flex items-center text-xs text-slate-500">
                <Link href="/" className="hover:text-slate-800">
                  HOME
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-400">HERITAGE</span>
              </nav>
            </Reveal>

            <Reveal>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-1.5 text-[10px] font-semibold tracking-[0.26em] text-slate-500 shadow-soft">
                  <span className="h-[1px] w-6 bg-gradient-to-r from-tiffany-400 to-slate-400" />
                  BRAND HERITAGE
                  <span className="h-[1px] w-6 bg-slate-200" />
                </div>

                <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-[2.3rem]">
                  ブランドの系譜と名車の歴史
                </h1>

                <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  F40やM3、GT-Rなど、クルマ文化をつくってきたモデルたちを
                  「ブランドの系譜」として整理しながら、
                  どの時代にどんなキャラクターのクルマがいたのかを
                  静かなアーカイブのように眺められるエリアです。
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* メーカーごとのグループ表示 */}
        <section className="pb-16 pt-6 sm:pb-20 sm:pt-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
            {groups.map((group) => (
              <Reveal key={group.maker}>
                <section className="space-y-3">
                  <header className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-700">
                      {group.maker}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {group.items.length} MODEL
                    </p>
                  </header>

                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map((item) => {
                      const tags = item.tags ?? [];
                      return (
                        <Link
                          key={item.slug}
                          href={`/heritage/${encodeURIComponent(item.slug)}`}
                          className="group"
                        >
                          <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-white/92 via-vapor/90 to-white/95 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-300 hover:shadow-soft-card">
                            <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                  <span className="inline-flex items-center gap-2">
                                    <span className="h-[1px] w-4 bg-tiffany-400/80" />
                                    {item.eraLabel ?? "ERA"}
                                  </span>
                                  {item.platformCode && (
                                    <>
                                      <span className="h-[1px] w-4 bg-slate-200" />
                                      <span className="text-slate-400">
                                        {item.platformCode}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <h3 className="line-clamp-2 text-sm font-semibold leading-relaxed text-slate-950 sm:text-[15px]">
                                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                                    {item.titleJa ?? item.title}
                                  </span>
                                </h3>

                                {item.modelName && (
                                  <p className="text-[11px] font-medium text-tiffany-700">
                                    {item.modelName}
                                  </p>
                                )}
                              </div>

                              {item.summary && (
                                <p className="line-clamp-3 text-[12px] leading-relaxed text-text-sub">
                                  {item.summary}
                                </p>
                              )}

                              {tags.length > 0 && (
                                <div className="mt-auto pt-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full border border-slate-200 bg-slate-50/80 px-2 py-0.5 text-[10px] text-slate-600"
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
                </section>
              </Reveal>
            ))}

            {groups.length === 0 && (
              <p className="text-sm text-slate-500">
                HERITAGEデータがまだ登録されていません。
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
