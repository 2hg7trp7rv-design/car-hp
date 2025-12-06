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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* ヒーロー */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
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
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                BRAND HERITAGE
              </p>
              <h1 className="text-2xl font-semibold tracking-wide text-slate-900 md:text-3xl">
                ブランドの系譜と名車の歴史
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                F40やM3、GT-Rなど、クルマ文化をつくってきたモデルたちを「ブランドの系譜」として整理しながら、
                どの時代にどんなキャラクターのクルマがいたのかを振り返れるエリアです。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* メーカーごとのグループ表示 */}
      <section className="bg-slate-100/80 pb-10 pt-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4">
          {groups.map((group) => (
            <Reveal key={group.maker}>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold tracking-[0.16em] text-slate-700">
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
                        <GlassCard className="h-full bg-white/80 transition group-hover:border-tiffany-300 group-hover:bg-white">
                          <div className="flex h-full flex-col gap-3 p-4">
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                                {item.eraLabel ?? "—"}
                              </p>
                              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                                {item.titleJa ?? item.title}
                              </h3>
                              {item.modelName && (
                                <p className="text-[11px] text-slate-500">
                                  {item.modelName}
                                </p>
                              )}
                            </div>
                            {item.summary && (
                              <p className="line-clamp-3 text-[12px] leading-relaxed text-slate-600">
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
            <p className="text-sm text-slate-500">
              HERITAGEデータがまだ登録されていません。
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
