// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars, type CarItem } from "@/lib/cars";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CARS | CURATED SHOWROOM",
  description:
    "オーナー視点で選んだクルマたちのデータベース。維持の難易度やボディタイプから、静かに自分の一台を探すためのショールーム。",
};

type SearchParams = {
  q?: string;
  maker?: string;
  difficulty?: string;
  bodyType?: string;
  segment?: string;
};

type PageProps = {
  searchParams?: SearchParams;
};

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function mapDifficultyLabel(
  difficulty: CarItem["difficulty"] | undefined,
): string {
  switch (difficulty) {
    case "easy":
      return "やさしい";
    case "normal":
      return "標準的";
    case "advanced":
      return "気を使う";
    default:
      return "未設定";
  }
}

export default async function CarsPage({ searchParams }: PageProps) {
  const all = await getAllCars();

  const q = normalize(searchParams?.q);
  const makerFilter = (searchParams?.maker ?? "").trim();
  const difficultyFilter = (searchParams?.difficulty ?? "").trim();
  const bodyTypeFilter = (searchParams?.bodyType ?? "").trim();
  const segmentFilter = (searchParams?.segment ?? "").trim();

  const makers = Array.from(
    new Set(all.map((c) => c.maker).filter(Boolean)),
  ).sort();
  const difficulties = Array.from(
    new Set(all.map((c) => c.difficulty).filter(Boolean)),
  ).sort();
  const bodyTypes = Array.from(
    new Set(all.map((c) => c.bodyType).filter(Boolean)),
  ).sort();
  const segments = Array.from(
    new Set(all.map((c) => c.segment).filter(Boolean)),
  ).sort();

  const filtered = all.filter((car) => {
    if (q) {
      const haystack = [
        car.name ?? "",
        car.maker ?? "",
        car.segment ?? "",
        car.bodyType ?? "",
        car.summary ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (makerFilter && car.maker !== makerFilter) return false;
    if (difficultyFilter && car.difficulty !== difficultyFilter)
      return false;
    if (bodyTypeFilter && car.bodyType !== bodyTypeFilter) return false;
    if (segmentFilter && car.segment !== segmentFilter) return false;

    return true;
  });

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">CARS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-4">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              CURATED SHOWROOM
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              静かに選ぶ、オーナーのためのショールーム。
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
              「速さ」よりも「付き合いやすさ」を重視したカーリスト。
              維持の難易度やボディタイプから、いまの暮らしに合う一台をゆっくり探せるページです。
            </p>
          </Reveal>
        </header>

        {/* フィルターエリア */}
        <Reveal delay={220}>
          <section className="mb-10 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-soft">
            <form className="space-y-4 text-xs sm:text-[11px]">
              <div className="grid gap-3 md:grid-cols-4">
                {/* キーワード */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    KEYWORD
                  </label>
                  <input
                    type="search"
                    name="q"
                    defaultValue={searchParams?.q ?? ""}
                    placeholder="モデル名やキーワードで検索"
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
                    {makers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 難易度 */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    DIFFICULTY
                  </label>
                  <select
                    name="difficulty"
                    defaultValue={difficultyFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {mapDifficultyLabel(d as CarItem["difficulty"])}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ボディタイプ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    BODY TYPE
                  </label>
                  <select
                    name="bodyType"
                    defaultValue={bodyTypeFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {bodyTypes.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* セグメント */}
              <div className="grid gap-3 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    SEGMENT
                  </label>
                  <select
                    name="segment"
                    defaultValue={segmentFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {segments.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ボタン */}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
                >
                  絞り込み
                </button>
              </div>
            </form>
          </section>
        </Reveal>

        {/* 一覧 */}
        <Reveal delay={260}>
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                CAR LIST
              </h2>
              <p className="text-[11px] text-slate-400">
                {filtered.length} 台表示中
              </p>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
                条件に合致するクルマが見つかりませんでした。
                絞り込み条件を緩めて再度お試しください。
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((car) => (
                  <Link
                    key={car.id}
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                  >
                    <GlassCard
                      as="article"
                      padding="md"
                      interactive
                      className="h-full bg-white/90"
                    >
                      <div className="flex h-full flex-col gap-3">
                        {/* サムネイル */}
                        {(car.heroImage || car.mainImage) && (
                          <div className="overflow-hidden rounded-2xl border border-slate-100">
                            <img
                              src={
                                car.heroImage ||
                                car.mainImage ||
                                ""
                              }
                              alt={car.name}
                              className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold tracking-[0.24em] text-tiffany-600">
                            {car.maker}
                          </p>
                          <h3 className="text-sm font-semibold leading-relaxed text-slate-900">
                            {car.name}
                          </h3>
                          {car.summary && (
                            <p className="text-[11px] leading-relaxed text-text-sub line-clamp-3">
                              {car.summary}
                            </p>
                          )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          {car.segment && (
                            <span className="rounded-full bg-slate-50 px-2 py-1">
                              {car.segment}
                            </span>
                          )}
                          {car.bodyType && (
                            <span className="rounded-full bg-slate-50 px-2 py-1">
                              {car.bodyType}
                            </span>
                          )}
                          {car.difficulty && (
                            <span className="rounded-full bg-slate-50 px-2 py-1">
                              維持難易度:{" "}
                              {mapDifficultyLabel(car.difficulty)}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </main>
  );
}
