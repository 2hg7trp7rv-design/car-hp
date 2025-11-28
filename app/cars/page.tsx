// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars, type CarItem } from "@/lib/cars";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CARS | CAR DATABASE",
  description:
    "主要な車種について、維持の難易度・ボディタイプ・セグメントなどの条件で絞り込んで確認できる車種データベースです。",
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

// CarDifficulty = "basic" | "intermediate" | "advanced" に合わせる
function mapDifficultyLabel(
  difficulty: CarItem["difficulty"] | undefined,
): string {
  switch (difficulty) {
    case "basic":
      return "やさしい";
    case "intermediate":
      return "標準的";
    case "advanced":
      return "気を使う";
    default:
      return "未設定";
  }
}

// 一覧ページ用の短い説明テキスト
function mapDifficultyShortDescription(
  difficulty: CarItem["difficulty"],
): string {
  switch (difficulty) {
    case "basic":
      return "定期点検と消耗品交換が中心の、扱いやすいクラス。";
    case "intermediate":
      return "一般的な維持に加えて、ときどき予防整備を意識したいクラス。";
    case "advanced":
      return "専門店での点検や、故障時の出費に余裕を見ておきたいクラス。";
    default:
      return "";
  }
}

export default async function CarsPage({ searchParams }: PageProps) {
  const all = await getAllCars();

  const rawQ = searchParams?.q ?? "";
  const q = normalize(rawQ);
  const makerFilter = (searchParams?.maker ?? "").trim();
  const difficultyFilter = (searchParams?.difficulty ?? "").trim();
  const bodyTypeFilter = (searchParams?.bodyType ?? "").trim();
  const segmentFilter = (searchParams?.segment ?? "").trim();

  const makers = Array.from(
    new Set(all.map((c) => c.maker).filter(Boolean)),
  ).sort();

  const difficulties = Array.from(
    new Set(all.map((c) => c.difficulty).filter(Boolean)),
  ) as CarItem["difficulty"][];

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
    if (difficultyFilter && car.difficulty !== difficultyFilter) return false;
    if (bodyTypeFilter && car.bodyType !== bodyTypeFilter) return false;
    if (segmentFilter && car.segment !== segmentFilter) return false;

    return true;
  });

  const hasFilter =
    Boolean(q) ||
    Boolean(makerFilter) ||
    Boolean(difficultyFilter) ||
    Boolean(bodyTypeFilter) ||
    Boolean(segmentFilter);

  // 難易度レジェンド用のプリセット
  const difficultyPresets: { value: CarItem["difficulty"]; label: string }[] = [
    { value: "basic", label: mapDifficultyLabel("basic") },
    { value: "intermediate", label: mapDifficultyLabel("intermediate") },
    { value: "advanced", label: mapDifficultyLabel("advanced") },
  ];

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
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
              CAR DATABASE
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              条件で絞り込める車種一覧
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
              メーカー、ボディタイプ、セグメント、維持の難易度などで絞り込みながら、
              気になる車種の概要を一覧で確認できるページです。詳細ページでは、関連ニュースや
              コラムもあわせて参照できます。
            </p>
          </Reveal>
        </header>

        {/* フィルターエリア */}
        <Reveal delay={220}>
          <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-soft">
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
                    defaultValue={rawQ}
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
                      <option key={d} value={d ?? ""}>
                        {mapDifficultyLabel(d)}
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
              <div className="mt-2 flex items-center justify-end gap-3">
                {hasFilter && (
                  <Link
                    href="/cars"
                    className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                  >
                    CLEAR
                  </Link>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
                >
                  絞り込み
                </button>
              </div>
            </form>

            {/* 維持難易度の凡例＋ワンクリックフィルター */}
            <div className="mt-4 rounded-2xl bg-slate-50/80 px-3 py-3 text-[10px] text-slate-600">
              <p className="mb-2 font-semibold tracking-[0.18em] text-slate-500">
                DIFFICULTY GUIDE
              </p>
              <div className="flex flex-wrap gap-2">
                {difficultyPresets.map(({ value, label }) => (
                  <Link
                    key={value}
                    href={`/cars?difficulty=${value ?? ""}`}
                    className="group flex min-w-[140px] flex-1 items-start gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-left shadow-[0_0_0_1px_rgba(148,163,184,0.25)] transition hover:border-tiffany-300 hover:shadow-soft"
                    aria-label={`維持難易度「${label}」の車種で絞り込み`}
                  >
                    <span className="mt-[4px] h-[6px] w-[6px] rounded-full bg-tiffany-400" />
                    <span className="space-y-0.5">
                      <span className="block text-[10px] font-semibold text-slate-800">
                        {label}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {value ? mapDifficultyShortDescription(value) : ""}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* アクティブフィルター表示 */}
        {hasFilter && (
          <Reveal delay={240}>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px]">
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
                  maker: <span className="font-semibold">{makerFilter}</span>
                </span>
              )}
              {difficultyFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  difficulty:{" "}
                  <span className="font-semibold">
                    {mapDifficultyLabel(
                      difficultyFilter as CarItem["difficulty"],
                    )}
                  </span>
                </span>
              )}
              {bodyTypeFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  body: <span className="font-semibold">{bodyTypeFilter}</span>
                </span>
              )}
              {segmentFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  segment:{" "}
                  <span className="font-semibold">{segmentFilter}</span>
                </span>
              )}
            </div>
          </Reveal>
        )}

        {/* 一覧 */}
        <Reveal delay={260}>
          <section className="space-y-4" aria-label="車種一覧">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                CAR LIST
              </h2>
              <div className="flex flex-col items-end text-[10px] text-slate-400">
                <span>
                  TOTAL{" "}
                  <span className="font-semibold text-slate-800">
                    {all.length}
                  </span>{" "}
                  MODELS
                </span>
                {filtered.length !== all.length && (
                  <span>
                    FILTERED{" "}
                    <span className="font-semibold text-tiffany-600">
                      {filtered.length}
                    </span>
                  </span>
                )}
              </div>
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
                      className="group h-full bg-white/90"
                    >
                      <div className="flex h-full flex-col gap-3">
                        {/* サムネイル */}
                        {(car.heroImage || (car as any).mainImage) && (
                          <div className="overflow-hidden rounded-2xl border border-slate-100">
                            <img
                              src={
                                car.heroImage ||
                                (car as any).mainImage ||
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
                          <span className="rounded-full bg-slate-50 px-2 py-1">
                            維持難易度: {mapDifficultyLabel(car.difficulty)}
                          </span>
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
