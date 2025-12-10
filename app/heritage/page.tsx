// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "HERITAGE | ブランドの系譜と名車の歴史",
  description:
    "ブランドの系譜や名車の歴史を、年代やメーカーごとに整理してたどれるHERITAGEコンテンツ。",
};

// Next.js の searchParams 仕様に合わせた型
type SearchParams = {
  q?: string | string[];
  maker?: string | string[];
  era?: string | string[];
  tag?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

type HeritageGroup = {
  maker: string;
  items: HeritageItem[];
};

// 共通ユーティリティ
function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function isNonEmptyString(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// string | string[] | undefined を安全に1つの string にする
function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// 一覧用ソート（新しい公開日優先→タイトル順）
function sortHeritageForList(items: HeritageItem[]): HeritageItem[] {
  return [...items].sort((a, b) => {
    const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
    const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);

    if (ad && bd) return bd.getTime() - ad.getTime();
    if (bd && !ad) return 1;
    if (ad && !bd) return -1;

    const aTitle = (a.titleJa ?? a.title ?? "").toString();
    const bTitle = (b.titleJa ?? b.title ?? "").toString();
    return aTitle.localeCompare(bTitle, "ja");
  });
}

// メーカーごとにグルーピング
function groupByMaker(items: HeritageItem[]): HeritageGroup[] {
  const map = new Map<string, HeritageItem[]>();

  for (const item of items) {
    const maker = item.brandName ?? item.maker ?? "OTHER";
    const list = map.get(maker) ?? [];
    list.push(item);
    map.set(maker, list);
  }

  return Array.from(map.entries())
    .map(([maker, list]) => ({
      maker,
      items: sortHeritageForList(list),
    }))
    .sort((a, b) => a.maker.localeCompare(b.maker, "ja"));
}

export default async function HeritageIndexPage({
  searchParams,
}: PageProps) {
  const all = await getAllHeritage();

  // lib/heritage.ts 側で公開済みだけに絞り込んでいるので、そのまま使う
  const published = all;

  // searchParams をすべて toSingle() で正規化
  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const makerFilter = toSingle(searchParams?.maker).trim();
  const eraFilter = toSingle(searchParams?.era).trim();
  const tagFilter = toSingle(searchParams?.tag).trim();

  // セレクト用候補
  const makers: string[] = Array.from(
    new Set(
      published
        .map((i) => i.brandName ?? i.maker)
        .filter(isNonEmptyString),
    ),
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const eras: string[] = Array.from(
    new Set(
      published.map((i) => i.eraLabel).filter(isNonEmptyString),
    ),
  ).sort();

  const tags: string[] = Array.from(
    new Set(
      published
        .flatMap((i) => i.tags ?? [])
        .filter(isNonEmptyString),
    ),
  ).sort();

  // フィルタ本体
  const filtered = published.filter((item) => {
    const haystack = [
      item.title ?? "",
      item.titleJa ?? "",
      item.summary ?? "",
      item.brandName ?? "",
      item.maker ?? "",
      item.eraLabel ?? "",
      ...(item.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    if (q && !haystack.includes(q)) return false;
    if (makerFilter && (item.brandName ?? item.maker) !== makerFilter) {
      return false;
    }
    if (eraFilter && item.eraLabel !== eraFilter) return false;
    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) {
      return false;
    }

    return true;
  });

  const hasFilter = Boolean(
    q || makerFilter || eraFilter || tagFilter,
  );

  // インデックス用メタ情報
  const totalHeritage = published.length;
  const totalMakers = makers.length;
  const totalEras = eras.length;

  // 表示用にメーカー単位にまとめる（フィルタ後）
  const groups = groupByMaker(filtered);

  // クイックナビ用: 上位のメーカー・年代・タグ
  const quickMakerNav = makers.slice(0, 8);
  const quickEraNav = eras.slice(0, 6);
  const quickTagNav = tags.slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーロー */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.35),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal className="text-sm text-slate-300">
            <span className="tracking-[0.2em]">HOME / HERITAGE</span>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
            <Reveal className="space-y-6" delay={80}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tiffany-200">
                BRAND HERITAGE
              </p>
              <h1 className="font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
                ブランドの系譜と名車の歴史
              </h1>
              {/* 説明文は最小限 */}
              <p className="max-w-2xl text-sm leading-relaxed text-slate-200/90 sm:text-base">
                代表的なブランドと名車の歴史を、
                メーカー・年代・タグでざっと俯瞰するためのインデックスです。
              </p>
            </Reveal>

            <Reveal className="md:justify-self-end" delay={140}>
              {/* ※ここを「明るいカード＋黒文字」にして読みやすく */}
              <GlassCard
                padding="lg"
                variant="crystal"
                interactive={false}
                magnetic={false}
                className="max-w-md border border-slate-300/80 bg-slate-100/95 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.65)]"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-700">
                    HERITAGE INDEX
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700">
                    登録されているHERITAGEの件数とブランド数を、
                    ざっくり把握するためのインデックスです。
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs sm:text-sm">
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                        total
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {totalHeritage}
                      </div>
                      <div className="text-[0.7rem] text-slate-600">
                        articles
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                        makers
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {totalMakers}
                      </div>
                      <div className="text-[0.7rem] text-slate-600">
                        brands
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                        eras
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {totalEras}
                      </div>
                      <div className="text-[0.7rem] text-slate-600">
                        periods
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* フィルターエリア＋一覧 */}
      <section className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
        {/* フィルター */}
        <Reveal>
          {/* ここも明るいカードにして黒文字に */}
          <GlassCard
            padding="lg"
            variant="dim"
            interactive={false}
            className="border border-slate-300/80 bg-slate-100/95 text-slate-900"
          >
            <form
              action="/heritage"
              method="get"
              className="space-y-8"
            >
              {/* キーワード */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-[0.2em] text-slate-700">
                  KEYWORD
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={rawQ}
                  placeholder="モデル名・ブランド名・キーワードで検索"
                  className="w-full rounded-xl border border-slate-400/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                />
              </div>

              {/* セレクト3種 */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-[0.2em] text-slate-700">
                    MAKER
                  </label>
                  <select
                    name="maker"
                    defaultValue={makerFilter || ""}
                    className="w-full rounded-xl border border-slate-400/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                  >
                    <option value="">すべて</option>
                    {makers.map((maker) => (
                      <option key={maker} value={maker}>
                        {maker}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-[0.2em] text-slate-700">
                    ERA
                  </label>
                  <select
                    name="era"
                    defaultValue={eraFilter || ""}
                    className="w-full rounded-xl border border-slate-400/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                  >
                    <option value="">すべて</option>
                    {eras.map((era) => (
                      <option key={era} value={era}>
                        {era}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-[0.2em] text-slate-700">
                    TAG
                  </label>
                  <select
                    name="tag"
                    defaultValue={tagFilter || ""}
                    className="w-full rounded-xl border border-slate-400/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                  >
                    <option value="">すべて</option>
                    {tags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* クイックナビ */}
              {(quickMakerNav.length > 0 ||
                quickEraNav.length > 0 ||
                quickTagNav.length > 0) && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-slate-600">
                      QUICK NAV
                    </span>
                    {quickMakerNav.map((maker) => (
                      <Link
                        key={maker}
                        href={{
                          pathname: "/heritage",
                          query: { maker },
                        }}
                        className="rounded-full border border-slate-400/80 bg-slate-950/80 px-3 py-1 text-[0.7rem] text-slate-50 hover:border-tiffany-300/70 hover:text-tiffany-50"
                      >
                        {maker}
                      </Link>
                    ))}
                  </div>

                  {(quickEraNav.length > 0 || quickTagNav.length > 0) && (
                    <div className="flex flex-wrap gap-4">
                      {quickEraNav.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.65rem] tracking-[0.2em] text-slate-600">
                            ERA
                          </span>
                          {quickEraNav.map((era) => (
                            <Link
                              key={era}
                              href={{
                                pathname: "/heritage",
                                query: { era },
                              }}
                              className="rounded-full border border-slate-400/80 bg-slate-950/80 px-3 py-1 text-[0.7rem] text-slate-50 hover:border-tiffany-300/70 hover:text-tiffany-50"
                            >
                              {era}
                            </Link>
                          ))}
                        </div>
                      )}

                      {quickTagNav.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.65rem] tracking-[0.2em] text-slate-600">
                            TAG
                          </span>
                          {quickTagNav.map((tag) => (
                            <Link
                              key={tag}
                              href={{
                                pathname: "/heritage",
                                query: { tag },
                              }}
                              className="rounded-full border border-slate-400/80 bg-slate-950/80 px-3 py-1 text-[0.7rem] text-slate-50 hover:border-tiffany-300/70 hover:text-tiffany-50"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ボタン行 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {hasFilter ? (
                  <div className="text-xs text-slate-700">
                    <span className="mr-2 text-[0.7rem] font-semibold tracking-[0.2em] text-slate-600">
                      ACTIVE FILTERS
                    </span>
                    <span>
                      {q && (
                        <span className="mr-2">
                          keyword:“{rawQ}”
                        </span>
                      )}
                      {makerFilter && (
                        <span className="mr-2">
                          maker:{makerFilter}
                        </span>
                      )}
                      {eraFilter && (
                        <span className="mr-2">
                          era:{eraFilter}
                        </span>
                      )}
                      {tagFilter && (
                        <span className="mr-2">
                          tag:{tagFilter}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">
                    必要なときだけ、キーワードやメーカー・年代・タグで軽く絞り込む前提です。
                  </div>
                )}

                <div className="flex gap-3">
                  {hasFilter && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-slate-500 text-slate-800 hover:border-slate-700 hover:text-slate-900"
                    >
                      <Link href="/heritage">CLEAR</Link>
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-slate-900 px-5 text-xs tracking-[0.15em]"
                  >
                    絞り込み
                  </Button>
                </div>
              </div>
            </form>
          </GlassCard>
        </Reveal>

        {/* 一覧ヘッダー */}
        <Reveal delay={60}>
          <div className="flex flex-wrap items-baseline justify-between gap-3 pt-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-200">
                HERITAGE LIST
              </h2>
              <p className="text-xs text-slate-400">
                TOTAL {published.length} ARTICLES
                {filtered.length !== published.length && (
                  <>
                    {" "}
                    / FILTERED {filtered.length}
                  </>
                )}
              </p>
            </div>
          </div>
        </Reveal>

        {/* 一覧本体 */}
        {groups.length === 0 ? (
          <Reveal delay={120}>
            <div className="mt-8 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/80 px-6 py-10 text-center text-sm text-slate-300">
              条件に合うHERITAGEはありません。
              <br />
              絞り込み条件を少し緩めて再検索する想定です。
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <section key={group.maker} className="space-y-4">
                <Reveal>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {group.maker}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {group.items.length} MODEL
                      </p>
                    </div>
                  </div>
                </Reveal>

                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map((item, index) => {
                    const itemTags = item.tags ?? [];
                    const labelMaker = item.brandName ?? item.maker;
                    const era = item.eraLabel ?? "ERA";

                    return (
                      <Reveal key={item.id} delay={index * 70}>
                        <Link href={`/heritage/${item.slug}`} className="block">
                          <GlassCard
                            padding="lg"
                            interactive
                            variant="dim"
                            // カード内は「明るい背景＋濃い文字」でコントラストを確保
                            className="h-full border border-white/40 bg-white/85 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.55)]"
                          >
                            <div className="flex h-full flex-col gap-3 text-slate-900">
                              <div className="flex items-center justify-between gap-3 text-xs text-slate-800">
                                <span className="rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-[0.7rem]">
                                  {era}
                                </span>
                                {labelMaker && (
                                  <span className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                    {labelMaker}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
                                  {item.titleJa ?? item.title}
                                </h4>
                                {item.modelName && (
                                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                    {item.modelName}
                                  </p>
                                )}
                                {item.summary && (
                                  <p className="text-xs leading-relaxed text-slate-800">
                                    {item.summary}
                                  </p>
                                )}
                              </div>

                              {itemTags.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-2 text-[0.7rem] text-slate-800">
                                  {itemTags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full border border-slate-300/80 bg-white/80 px-2.5 py-1"
                                    >
                                      #{tag}
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
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
