// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import {
  getAllHeritage,
  type HeritageItem,
} from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "HERITAGE | ブランドの系譜と名車の歴史",
  description:
    "ブランドの系譜や名車の歴史を、年代やメーカーごとに整理してたどれるHERITAGEコンテンツ。",
};

// 検索パラメータ
type SearchParams = {
  q?: string;
  maker?: string;
  era?: string;
  tag?: string;
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

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// 一覧用ソート（新しい公開日優先 → タイトル順）
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
    .sort((a, b) => a.maker.localeCompare(b.maker, "ja"));
}

export default async function HeritageIndexPage({ searchParams }: PageProps) {
  const all = await getAllHeritage();

  // 公開状態のものだけ
  const published = all.filter(
    (item) =>
      !item.status ||
      item.status === "published" ||
      item.status === "PUBLIC",
  );

  // 検索パラメータ
  const rawQ = searchParams?.q ?? "";
  const q = normalize(rawQ);
  const makerFilter = (searchParams?.maker ?? "").trim();
  const eraFilter = (searchParams?.era ?? "").trim();
  const tagFilter = (searchParams?.tag ?? "").trim();

  // セレクト用候補
  const makers: string[] = Array.from(
    new Set(published.map((i) => i.maker).filter(isNonEmptyString)),
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const eras: string[] = Array.from(
    new Set(published.map((i) => i.eraLabel).filter(isNonEmptyString)),
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
      item.maker ?? "",
      item.eraLabel ?? "",
      ...(item.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    if (q && !haystack.includes(q)) return false;

    if (makerFilter && item.maker !== makerFilter) return false;
    if (eraFilter && item.eraLabel !== eraFilter) return false;
    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;

    return true;
  });

  const hasFilter = Boolean(q || makerFilter || eraFilter || tagFilter);

  // インデックス用メタ情報
  const totalHeritage = published.length;
  const totalMakers = makers.length;
  const totalEras = eras.length;

  // 表示用にメーカー単位にまとめる（フィルタ後）
  const groups = groupByMaker(filtered);

  // クイックナビ用：上位のメーカー・年代・タグ
  const quickMakerNav = makers.slice(0, 8);
  const quickEraNav = eras.slice(0, 6);
  const quickTagNav = tags.slice(0, 6);

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
              <nav
                className="flex items-center text-[11px] text-slate-500"
                aria-label="パンくずリスト"
              >
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
                <h1 className="serif-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem] md:text-[2.5rem]">
                  ブランドの系譜と名車の歴史
                </h1>
                <p className="max-w-2xl text-[13px] leading-relaxed text-text-sub sm:text-sm sm:leading-7">
                  F40やM3、GT-Rなど、クルマ文化をつくってきたモデルたちを
                  「ブランドの系譜」として整理しながら、どの時代にどんなキャラクターの
                  クルマがいたのかを振り返るためのアーカイブです。
                  一覧からメーカー・年代ごとの物語に潜っていけます。
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 本文：インデックス＋フィルター＋一覧 */}
        <section className="bg-transparent pb-14 pt-7">
          <div className="mx-auto flex max-w-5xl flex-col gap-7 px-4">
            {/* インデックスパネル */}
            <Reveal delay={60}>
              <GlassCard
                padding="md"
                className="relative overflow-hidden border border-white/80 bg-gradient-to-r from-white/96 via-white/88 to-vapor/95 shadow-soft"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                  <div className="absolute -right-24 bottom-[-40%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.22),_transparent_72%)] blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-md">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      HERITAGE INDEX
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                      登録されているHERITAGE記事の総数と メーカー数・年代の幅を確認
                      「どのくらいのアーカイブになっているか」を一目で把握するための指標
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-[10px] text-slate-700">
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        TOTAL ARTICLES
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalHeritage}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        MAKERS
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalMakers}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        ERAS
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalEras}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>

            {/* フィルターエリア */}
            <Reveal delay={120}>
              <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-soft">
                <form className="space-y-4 text-xs sm:text-[11px]">
                  <div className="grid gap-3 md:grid-cols-3">
                    {/* キーワード */}
                    <div>
                      <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                        KEYWORD
                      </label>
                      <input
                        type="search"
                        name="q"
                        defaultValue={rawQ}
                        placeholder="モデル名 ブランド名 時代などで検索"
                        className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                      />
                    </div>

                    {/* メーカー */}
                    <div>
                      <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                        MAKER
                      </label>
                      <select
                        name="maker"
                        defaultValue={makerFilter}
                        className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                      >
                        <option value="">すべて</option>
                        {makers.map((maker) => (
                          <option key={maker} value={maker}>
                            {maker}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 時代ラベル */}
                    <div>
                      <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                        ERA
                      </label>
                      <select
                        name="era"
                        defaultValue={eraFilter}
                        className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                      >
                        <option value="">すべて</option>
                        {eras.map((era) => (
                          <option key={era} value={era}>
                            {era}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* タグ */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                        TAG
                      </label>
                      <select
                        name="tag"
                        defaultValue={tagFilter}
                        className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                      >
                        <option value="">すべて</option>
                        {tags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* クイックプリセット */}
                    <div className="flex flex-col gap-1 pt-1 text-[10px] text-slate-500">
                      <span className="font-medium tracking-[0.22em] text-slate-500">
                        QUICK NAV
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickMakerNav.map((maker) => (
                          <Link
                            key={maker}
                            href={`/heritage?maker=${encodeURIComponent(maker)}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 tracking-[0.12em] hover:border-tiffany-300 hover:bg-white"
                          >
                            {maker}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 追加のクイックナビ（年代＆タグ） */}
                  {(quickEraNav.length > 0 || quickTagNav.length > 0) && (
                    <div className="flex flex-col gap-1.5 pt-1 text-[10px] text-slate-500">
                      <div className="flex flex-wrap gap-2">
                        {quickEraNav.length > 0 && (
                          <>
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                              ERA
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {quickEraNav.map((era) => (
                                <Link
                                  key={era}
                                  href={`/heritage?era=${encodeURIComponent(
                                    era,
                                  )}`}
                                  className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 tracking-[0.12em] hover:border-tiffany-300 hover:bg-white"
                                >
                                  {era}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      {quickTagNav.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                            TAG
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {quickTagNav.map((tag) => (
                              <Link
                                key={tag}
                                href={`/heritage?tag=${encodeURIComponent(
                                  tag,
                                )}`}
                                className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 tracking-[0.12em] hover:border-tiffany-300 hover:bg-white"
                              >
                                #{tag}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ボタン */}
                  <div className="mt-3 flex items-center justify-end gap-3">
                    {hasFilter && (
                      <Link
                        href="/heritage"
                        className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                      >
                        CLEAR
                      </Link>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      magnetic
                      className="rounded-full px-5 py-2 text-[11px] tracking-[0.2em]"
                    >
                      絞り込み
                    </Button>
                  </div>
                </form>
              </section>
            </Reveal>

            {/* アクティブフィルター表示 */}
            {hasFilter && (
              <Reveal delay={160}>
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                    ACTIVE FILTERS
                  </span>
                  {q && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                      keyword: <span className="font-semibold">“{rawQ}”</span>
                    </span>
                  )}
                  {makerFilter && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                      maker:{" "}
                      <span className="font-semibold">{makerFilter}</span>
                    </span>
                  )}
                  {eraFilter && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                      era: <span className="font-semibold">{eraFilter}</span>
                    </span>
                  )}
                  {tagFilter && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                      tag: <span className="font-semibold">{tagFilter}</span>
                    </span>
                  )}
                </div>
              </Reveal>
            )}

            {/* 一覧本体：メーカーごとのグループ */}
            <Reveal delay={180}>
              <section
                className="space-y-7"
                aria-label="HERITAGE一覧（メーカーごと）"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                    HERITAGE LIST
                  </h2>
                  <div className="flex flex-col items-end text-[10px] text-slate-400">
                    <span>
                      TOTAL{" "}
                      <span className="font-semibold text-slate-800">
                        {published.length}
                      </span>{" "}
                      ARTICLES
                    </span>
                    {filtered.length !== published.length && (
                      <span>
                        FILTERED{" "}
                        <span className="font-semibold text-tiffany-600">
                          {filtered.length}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {groups.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
                    条件に合うHERITAGEはなし 絞り込み条件を少し緩めて再検索する想定
                  </p>
                ) : (
                  groups.map((group) => (
                    <div key={group.maker} className="space-y-3">
                      <div className="flex items-baseline justify-between gap-3 border-b border-slate-200/70 pb-1.5">
                        <h3 className="text-sm font-semibold tracking-[0.24em] text-slate-700 sm:text-[0.9rem]">
                          {group.maker}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {group.items.length} MODEL
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {group.items.map((item) => {
                          const itemTags = item.tags ?? [];
                          return (
                            <Link
                              key={item.slug}
                              href={`/heritage/${encodeURIComponent(
                                item.slug,
                              )}`}
                              className="group"
                            >
                              <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-white/92 via-white to-white/95 shadow-soft transition group-hover:-translate-y-[1px] group-hover:border-tiffany-300 group-hover:shadow-soft-card">
                                <div className="flex h-full flex-col gap-3 p-4">
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-slate-500">
                                      {item.eraLabel ?? "ERA"}
                                    </p>
                                    <h4 className="line-clamp-2 text-[15px] font-semibold leading-relaxed text-slate-900 sm:text-base">
                                      {item.titleJa ?? item.title}
                                    </h4>
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

                                  {itemTags.length > 0 && (
                                    <div className="mt-auto pt-2">
                                      <div className="flex flex-wrap gap-1.5">
                                        {itemTags.map((tag) => (
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
                  ))
                )}
              </section>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
}
