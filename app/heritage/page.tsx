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
      {/* ページ全体のうっすら光レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[32vh] bg-gradient-to-b from-white/95 via-white/85 to-transparent" />
        <div className="absolute -left-[18%] top-[12%] h-[38vw] w-[38vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.12),_transparent_72%)] blur-[110px]" />
        <div className="absolute -right-[22%] bottom-[-8%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.2),_transparent_75%)] blur-[110px]" />
      </div>

      <div className="relative z-10">
        {/* ヒーロー */}
        <section className="border-b border-slate-200/70 bg-gradient-to-b from-vapor/70 via-white to-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-9 md:py-11">
            <Reveal>
              <nav className="flex items-center text-[11px] text-slate-500">
                <Link href="/" className="hover:text-slate-800">
                  HOME
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-400">HERITAGE</span>
              </nav>
            </Reveal>

            <Reveal>
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  BRAND HERITAGE
                </p>
                {/* タイトルを一段大きく */}
                <h1 className="serif-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem] md:text-[2.5rem]">
                  ブランドの系譜と名車の歴史
                </h1>
                {/* リードは少しだけ大きめ */}
                <p className="max-w-2xl text-[13px] leading-relaxed text-text-sub sm:text-sm sm:leading-7">
                  F40やM3、GT-Rなど、クルマ文化をつくってきたモデルたちを
                  「ブランドの系譜」として整理しながら、どの時代にどんなキャラクターの
                  クルマがいたのかを振り返るためのアーカイブです。
                  一覧からメーカーごとの物語に潜っていけます。
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* メーカーごとのグループ表示 */}
        <section className="bg-transparent pb-12 pt-7">
          <div className="mx-auto flex max-w-5xl flex-col gap-7 px-4">
            {groups.map((group) => (
              <Reveal key={group.maker}>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-3 border-b border-slate-200/70 pb-1.5">
                    {/* メーカー名は1段階大きく＋字間広め */}
                    <h2 className="text-sm font-semibold tracking-[0.24em] text-slate-700 sm:text-[0.9rem]">
                      {group.maker}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {group.items.length} MODEL
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {group.items.map((item) => {
                      const tags = item.tags ?? [];
                      return (
                        <Link
                          key={item.slug}
                          href={`/heritage/${encodeURIComponent(item.slug)}`}
                          className="group"
                        >
                          <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-white/92 via-white to-white/95 shadow-soft transition group-hover:-translate-y-[1px] group-hover:border-tiffany-300 group-hover:shadow-soft-card">
                            <div className="flex h-full flex-col gap-3 p-4">
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-slate-500">
                                  {item.eraLabel ?? "ERA"}
                                </p>
                                {/* タイトルを一段大きく */}
                                <h3 className="line-clamp-2 text-[15px] font-semibold leading-relaxed text-slate-900 sm:text-base">
                                  {item.titleJa ?? item.title}
                                </h3>
                                {item.modelName && (
                                  <p className="text-[11px] text-slate-500">
                                    {item.modelName}
                                  </p>
                                )}
                              </div>
                              {item.summary && (
                                <p className="line-clamp-3 text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
                                  {item.summary}
                                </p>
                              )}

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
              <p className="text-sm text-text-sub">
                HERITAGEデータがまだ登録されていません。
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
