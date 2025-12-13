// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllNews, type NewsItem } from "@/lib/news";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "NEWS | CAR BOUTIQUE",
  description:
    "輸入車・国産車の最新ニュースを、要点と一次情報リンクで静かにまとめるCAR BOUTIQUEのニュース一覧。",
  alternates: {
    canonical: "/news",
  },
};

type Query = {
  maker?: string;
  category?: string;
  tag?: string;
};

type NewsWithMeta = NewsItem & {
  imageUrl?: string | null;
  sourceName?: string | null;
};

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function parseQueryFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Query {
  const getOne = (key: string): string | undefined => {
    const v = searchParams[key];
    if (!v) return undefined;
    if (Array.isArray(v)) return v[0];
    return v;
  };

  return {
    maker: getOne("maker"),
    category: getOne("category"),
    tag: getOne("tag"),
  };
}

function normalizeStr(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function getTagList(item: NewsWithMeta): string[] {
  const tags: string[] = Array.isArray(item.tags)
    ? item.tags.filter((t: unknown): t is string => typeof t === "string")
    : [];
  return tags.map((t) => normalizeStr(t)).filter(Boolean);
}

function getSourceLabel(item: NewsWithMeta): string | null {
  if (item.sourceName && typeof item.sourceName === "string") {
    return item.sourceName;
  }
  if (!item.url) return null;
  try {
    const u = new URL(item.url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function makeFilterLabel(q: Query): string {
  const parts: string[] = [];
  if (q.maker) parts.push(`maker:${q.maker}`);
  if (q.category) parts.push(`category:${q.category}`);
  if (q.tag) parts.push(`tag:${q.tag}`);
  return parts.length ? parts.join(" / ") : "ALL";
}

function applyFilter(all: NewsWithMeta[], q: Query): NewsWithMeta[] {
  const maker = q.maker?.trim();
  const category = q.category?.trim();
  const tag = q.tag?.trim();

  return all.filter((item) => {
    if (maker && item.maker !== maker) return false;
    if (category && item.category !== category) return false;
    if (tag) {
      const tags = getTagList(item);
      if (!tags.includes(tag)) return false;
    }
    return true;
  });
}

function sortByDateDesc(all: NewsWithMeta[]): NewsWithMeta[] {
  return [...all].sort((a, b) => {
    const da = new Date(a.publishedAt ?? "").getTime();
    const db = new Date(b.publishedAt ?? "").getTime();
    return db - da;
  });
}

function pickTopTags(all: NewsWithMeta[], limit = 18): string[] {
  const freq = new Map<string, number>();
  for (const item of all) {
    for (const t of getTagList(item)) {
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .slice(0, limit);
}

function pickTopMakers(all: NewsWithMeta[], limit = 14): string[] {
  const makers = all.map((n) => normalizeStr(n.maker)).filter(Boolean);
  const freq = new Map<string, number>();
  for (const m of makers) freq.set(m, (freq.get(m) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m)
    .slice(0, limit);
}

function pickTopCategories(all: NewsWithMeta[], limit = 10): string[] {
  const cats = all.map((n) => normalizeStr(n.category)).filter(Boolean);
  const freq = new Map<string, number>();
  for (const c of cats) freq.set(c, (freq.get(c) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c)
    .slice(0, limit);
}

// 収益前提の “推奨導線” — NEWS一覧の上部で強く出す
const PIVOT_ENTRIES: Array<{
  title: string;
  description: string;
  href: string;
}> = [
  {
    title: "保険の比較（前提の揃え方）",
    description:
      "年齢条件・運転者範囲・車両保険…比較前に整えるべき項目だけ先に。",
    href: "/guide/insurance",
  },
  {
    title: "新車定額リース（条件の読み方）",
    description:
      "月額より先に走行距離/返却精算/中途解約/メンテ範囲。総額で判断。",
    href: "/guide/lease",
  },
  {
    title: "メンテ用品（まず揃える定番）",
    description:
      "洗車・車内・ドラレコ・バッテリー対策。必要になりやすい順に薄く。",
    href: "/guide/maintenance",
  },
];

// ニュースの世界観説明（SEOとユーザー理解のため）
const NEWS_POLICY_POINTS = [
  "一次情報（メーカー公式/行政/公的機関）を優先してリンクします",
  "本文の転載は行わず、要点の要約と編集部コメントで整理します",
  "年式・グレード・市場状況で情報は変動するため、出典の確認を推奨します",
  "リコール/サービスキャンペーン等の重要情報は“公式リンク”の確認を前提に扱います",
];

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const all = (await getAllNews()) as NewsWithMeta[];
  const allSorted = sortByDateDesc(all);

  const q = parseQueryFromSearchParams(searchParams);
  const filtered = applyFilter(allSorted, q);

  const makers = pickTopMakers(allSorted);
  const categories = pickTopCategories(allSorted);
  const tags = pickTopTags(allSorted);

  const filterLabel = makeFilterLabel(q);

  const clearHref = "/news";
  const makerHref = (m: string) => `/news?maker=${encodeURIComponent(m)}`;
  const categoryHref = (c: string) => `/news?category=${encodeURIComponent(c)}`;
  const tagHref = (t: string) => `/news?tag=${encodeURIComponent(t)}`;

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* うっすら光の背景レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[32vh] bg-gradient-to-b from-vapor/90 via-white/90 to-transparent" />
        <div className="absolute -left-[18%] top-[14%] h-[38vw] w-[38vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.16),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[20%] bottom-[-8%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.18),_transparent_75%)] blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section className="border-b border-slate-200/70 bg-gradient-to-b from-vapor/70 via-white to-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-24 sm:px-6 md:pb-12 md:pt-24">
            <Reveal>
              <nav
                className="flex items-center text-[11px] text-slate-500"
                aria-label="パンくずリスト"
              >
                <Link href="/" className="hover:text-slate-800">
                  HOME
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-400">NEWS</span>
              </nav>
            </Reveal>

            <Reveal>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                    NEWS
                  </p>
                  <div className="space-y-3">
                    <h1 className="serif-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem]">
                      ニュース
                    </h1>
                    <p className="max-w-3xl text-[13px] leading-relaxed text-text-sub sm:text-sm sm:leading-7">
                      輸入車・国産車のニュースを、要点と一次情報リンクで静かに整理します。
                      <span className="font-medium text-slate-900">
                        価格/スペック/装備/リコール
                      </span>
                      など、判断に関わる部分は必ず出典を辿れる形にしています。
                    </p>
                    <p className="max-w-3xl text-[11px] leading-relaxed text-slate-500">
                      国内/海外メーカーの発表・仕様変更・リコール・サービスキャンペーン・ブランド動向などを中心に、
                      “一次情報リンク＋編集部コメント”として構造化しています。
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.18em] text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                      FILTER {filterLabel}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                      {filtered.length} ITEMS
                    </span>
                  </div>
                </div>

                <div className="hidden text-[10px] text-slate-500 md:block">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-soft-glow backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                    <span className="tracking-[0.18em]">
                      PRIMARY SOURCES FIRST
                    </span>
                  </div>
                  <p className="mt-2 max-w-xs leading-relaxed tracking-[0.03em]">
                    ニュースは“読む”より“確認する”が大事。一次情報へすぐ飛べる形でまとめます。
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* POLICY */}
        <section className="border-b border-slate-200/70 bg-white/70">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <GlassCard className="border border-slate-200/80 bg-white/90 shadow-soft-card">
                    <div className="space-y-4 p-5 sm:p-6">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                        NEWS POLICY
                      </p>
                      <h2 className="serif-heading text-xl text-slate-900">
                        ここで扱うニュースの方針
                      </h2>
                      <p className="text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
                        CAR BOUTIQUEのニュースは、速報や転載を目的にしていません。
                        “判断材料”として役立つように、一次情報リンクと要点整理を中心にまとめます。
                      </p>
                      <ul className="space-y-2 text-[12px] leading-relaxed text-slate-700 sm:text-[13px]">
                        {NEWS_POLICY_POINTS.map((t) => (
                          <li key={t} className="flex gap-2">
                            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-tiffany-400" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                </div>

                <div className="lg:col-span-5">
                  <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-white/95 via-white to-vapor/95 shadow-soft-card">
                    <div className="space-y-4 p-5 sm:p-6">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                        QUICK LINKS
                      </p>
                      <h3 className="serif-heading text-lg text-slate-900">
                        迷いやすいテーマから先に
                      </h3>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        ニュースを見て「結局どう判断すれば？」となりやすい領域に、先に入口を用意しています。
                      </p>

                      <div className="space-y-2">
                        {PIVOT_ENTRIES.map((e) => (
                          <Link key={e.href} href={e.href} className="block">
                            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:bg-white">
                              <div className="font-semibold text-slate-900">
                                {e.title}
                              </div>
                              <div className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                {e.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FILTERS */}
        <section className="border-b border-slate-200/70 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <GlassCard className="h-full border border-slate-200/80 bg-white/90 shadow-soft-card">
                    <div className="space-y-4 p-5 sm:p-6">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                        FILTER
                      </p>
                      <h2 className="serif-heading text-lg text-slate-900">
                        絞り込み
                      </h2>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        maker / category / tag で絞り込みできます。解除はALLへ。
                      </p>

                      <div className="pt-2">
                        <Link
                          href={clearHref}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
                        >
                          ALL（解除）
                        </Link>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                          CURRENT
                        </p>
                        <p className="mt-2 text-[12px] text-slate-700">
                          {filterLabel}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <div className="lg:col-span-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* MAKER */}
                    <GlassCard className="border border-slate-200/80 bg-white/90 shadow-soft-card">
                      <div className="space-y-4 p-5 sm:p-6">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                          MAKERS
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {makers.map((m) => (
                            <Link
                              key={m}
                              href={makerHref(m)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
                            >
                              {m}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </GlassCard>

                    {/* CATEGORY */}
                    <GlassCard className="border border-slate-200/80 bg-white/90 shadow-soft-card">
                      <div className="space-y-4 p-5 sm:p-6">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                          CATEGORIES
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((c) => (
                            <Link
                              key={c}
                              href={categoryHref(c)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
                            >
                              {c}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </GlassCard>

                    {/* TAG */}
                    <GlassCard className="sm:col-span-2 border border-slate-200/80 bg-white/90 shadow-soft-card">
                      <div className="space-y-4 p-5 sm:p-6">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                          TAGS
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((t) => (
                            <Link
                              key={t}
                              href={tagHref(t)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
                            >
                              #{t}
                            </Link>
                          ))}
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-500">
                          タグはニュースデータの頻出順です。追加されるほど精度が上がります。
                        </p>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* LIST */}
        <section className="pb-24 pt-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    LIST
                  </p>
                  <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
                    ニュース一覧
                  </h2>
                  <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
                    最新順に表示します。タイトル→要点→出典リンク（一次情報優先）という構造です。
                  </p>
                </div>
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                  {filtered.length} items
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4">
              {filtered.map((item, idx) => {
                const title = item.titleJa ?? item.title;
                const dateLabel = formatDate(item.publishedAt);
                const sourceLabel = getSourceLabel(item);
                const tagList = getTagList(item).slice(0, 6);

                return (
                  <Reveal key={item.id} delay={80 + idx * 15}>
                    <Link href={`/news/${encodeURIComponent(item.id)}`}>
                      <GlassCard className="group border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.18em] text-slate-500">
                              {item.maker ? (
                                <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                                  {item.maker}
                                </span>
                              ) : (
                                <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                                  NEWS
                                </span>
                              )}
                              {item.category && (
                                <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5">
                                  {item.category}
                                </span>
                              )}
                              {sourceLabel && (
                                <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-slate-400">
                                  SOURCE {sourceLabel}
                                </span>
                              )}
                            </div>
                            {dateLabel && (
                              <div className="text-[10px] tracking-[0.18em] text-slate-400">
                                {dateLabel}
                              </div>
                            )}
                          </div>

                          <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700 sm:text-[15px]">
                            {title}
                          </h3>

                          {item.excerpt && (
                            <p className="line-clamp-2 text-[11px] leading-relaxed text-text-sub sm:text-[13px]">
                              {item.excerpt}
                            </p>
                          )}

                          {tagList.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {tagList.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </Link>
                  </Reveal>
                );
              })}

              {filtered.length === 0 && (
                <Reveal>
                  <GlassCard className="border border-slate-200/80 bg-white/90 p-6 text-center shadow-soft-card">
                    <p className="text-[12px] text-slate-700">
                      条件に一致するニュースがありません。
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      maker / category / tag を解除して再度お試しください。
                    </p>
                    <div className="mt-4">
                      <Link
                        href={clearHref}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
                      >
                        ALLへ戻る
                      </Link>
                    </div>
                  </GlassCard>
                </Reveal>
              )}
            </div>

            {/* FOOTNOTE */}
            <Reveal delay={120}>
              <div className="mt-10">
                <GlassCard className="border border-slate-200/80 bg-white/80 shadow-soft">
                  <div className="space-y-3 p-5 sm:p-6">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      NOTE
                    </p>
                    <p className="text-[12px] leading-relaxed text-slate-700 sm:text-[13px]">
                      当サイトのニュースは、速報性よりも「一次情報へたどり着けること」と「要点が分かること」を優先しています。
                      気になるトピックは、必ず出典リンク（メーカー公式/行政/公的機関）まで確認してください。
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      例：リコール情報は国交省/メーカー公式、仕様変更やキャンペーンはメーカー公式発表を起点に確認するのが安全です。
                    </p>
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
}
