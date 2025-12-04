// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { getAllCars, type CarItem } from "@/lib/cars";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CARS | CAR DATABASE",
  description:
    "主要な車種について 維持の難易度 ボディタイプ セグメントなどの条件で絞り込んで確認できる車種データベース",
};

// searchParams の型定義
type SearchParams = {
  q?: string | string[];
  maker?: string | string[];
  difficulty?: string | string[];
  bodyType?: string | string[];
  segment?: string | string[];
  sort?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

// 文字列を小文字トリム
function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

// string | string[] を安全に1つの string にするヘルパー
function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
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

// バッジ用の色
function difficultyBadgeClass(
  difficulty: CarItem["difficulty"] | undefined,
): string {
  switch (difficulty) {
    case "basic":
      return "border-emerald-100 bg-emerald-50/80 text-emerald-800";
    case "intermediate":
      return "border-amber-100 bg-amber-50/80 text-amber-800";
    case "advanced":
      return "border-rose-100 bg-rose-50/80 text-rose-800";
    default:
      return "border-slate-200 bg-slate-50/80 text-slate-600";
  }
}

// ソートラベル
function mapSortLabel(key: string): string {
  switch (key) {
    case "name":
      return "車名順";
    case "maker":
      return "メーカー順";
    case "newest":
      return "新しい年式順";
    case "oldest":
      return "古い年式順";
    case "difficulty":
      return "維持難易度（やさしい→気を使う）";
    default:
      return "おすすめ順";
  }
}

// 維持難易度の重み付けソート用
function difficultyWeight(
  difficulty: CarItem["difficulty"] | undefined,
): number {
  switch (difficulty) {
    case "basic":
      return 0;
    case "intermediate":
      return 1;
    case "advanced":
      return 2;
    default:
      return 9;
  }
}

export default async function CarsPage({ searchParams }: PageProps) {
  // データ取得
  const all = await getAllCars();

  // searchParams の生値をすべて toSingle() で安全に文字列化
  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const makerFilter = toSingle(searchParams?.maker).trim();
  const difficultyFilter = toSingle(searchParams?.difficulty).trim();
  const bodyTypeFilter = toSingle(searchParams?.bodyType).trim();
  const segmentFilter = toSingle(searchParams?.segment).trim();
  const sortKey = toSingle(searchParams?.sort).trim();

  const makers = Array.from(
    new Set(all.map((c) => c.maker).filter(Boolean)),
  ).sort();

  // 並び順を固定しつつ、実際に存在するものだけを採用
  const difficultyOptions: CarItem["difficulty"][] = (
    ["basic", "intermediate", "advanced"] as CarItem["difficulty"][]
  ).filter((d) => all.some((c) => c.difficulty === d));

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
    if (
      difficultyFilter &&
      car.difficulty !== (difficultyFilter as CarItem["difficulty"])
    )
      return false;
    if (bodyTypeFilter && car.bodyType !== bodyTypeFilter) return false;
    if (segmentFilter && car.segment !== segmentFilter) return false;

    return true;
  });

  // ソート適用
  const sorted = [...filtered];
  if (sortKey === "name") {
    sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  } else if (sortKey === "maker") {
    sorted.sort((a, b) => {
      const makerDiff = (a.maker ?? "").localeCompare(b.maker ?? "");
      if (makerDiff !== 0) return makerDiff;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  } else if (sortKey === "difficulty") {
    sorted.sort((a, b) => {
      const diff =
        difficultyWeight(a.difficulty) - difficultyWeight(b.difficulty);
      if (diff !== 0) return diff;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  } else if (sortKey === "newest") {
    sorted.sort(
      (a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0),
    );
  } else if (sortKey === "oldest") {
    sorted.sort(
      (a, b) => (a.releaseYear ?? 0) - (b.releaseYear ?? 0),
    );
  }
  // sortKey が空のときは登録順（all の順）を維持

  const hasFilter =
    Boolean(q) ||
    Boolean(makerFilter) ||
    Boolean(difficultyFilter) ||
    Boolean(bodyTypeFilter) ||
    Boolean(segmentFilter) ||
    Boolean(sortKey);

  // インデックス用の簡易統計
  const totalModels = all.length;
  const basicCount = all.filter((c) => c.difficulty === "basic").length;
  const intermediateCount = all.filter(
    (c) => c.difficulty === "intermediate",
  ).length;
  const advancedCount = all.filter((c) => c.difficulty === "advanced").length;

  const sedanCount = all.filter((c) => c.bodyType === "セダン").length;
  const suvCount = all.filter((c) => c.bodyType === "SUV").length;

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-28 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="font-medium text-slate-700">CARS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 rounded-3xl bg-white/80 p-5 shadow-soft-card backdrop-blur-sm sm:p-7 lg:p-8">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              CAR DATABASE
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flexフ flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  条件で絞り込める車種一覧
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  メーカー ボディタイプ セグメント 維持の難易度で絞り込みながら
                  気になる車種の概要を一覧で確認できるページ
                  詳細ページでは関連ニュースやコラムもあわせて参照できる構成
                </p>
              </div>
              <div className="hidden text-[10px] text-slate-500 sm:block">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">
                    IMPORT / PREMIUM ORIENTED
                  </span>
                </div>
                <p className="mt-2 max-w-xs leading-relaxed tracking-[0.03em]">
                  家族の一台というよりも 少しこだわったクルマ時間を前提にした
                  車種を中心に集めているイメージ
                </p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* インデックスパネル */}
        <Reveal delay={160}>
          <section className="mb-8 grid gap-3 text-[11px] text-slate-700 sm:grid-cols-3">
            <GlassCard
              padding="md"
              className="flex items-center justify-between bg-white/80"
            >
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                  TOTAL MODELS
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {totalModels}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  順次車種を追加予定
                </p>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <p>
                  やさしい:{" "}
                  <span className="font-semibold text-emerald-600">
                    {basicCount}
                  </span>
                </p>
                <p>
                  標準的:{" "}
                  <span className="font-semibold text-amber-600">
                    {intermediateCount}
                  </span>
                </p>
                <p>
                  気を使う:{" "}
                  <span className="font-semibold text-rose-600">
                    {advancedCount}
                  </span>
                </p>
              </div>
            </GlassCard>

            <GlassCard padding="md" className="bg-white/80">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                BODY TYPE
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                  セダン系: {sedanCount} 車種
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                  SUV系: {suvCount} 車種
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                  クーペ/ハッチバックなど順次追加
                </span>
              </div>
            </GlassCard>

            <GlassCard padding="md" className="bg-gradient-to-br from-tiffany-50/80 to-white">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                LEGEND
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-slate-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>やさしい（国産中心/故障リスク低め）</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-slate-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>標準的（輸入車エントリー〜ミドル）</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-slate-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>気を使う（ハイパフォーマンス/旧車 etc.）</span>
                </span>
              </div>
            </GlassCard>
          </section>
        </Reveal>

        {/* 絞り込みフォーム */}
        <Reveal delay={200}>
          <section className="mb-6 rounded-3xl bg白/80 p-4 shadow-soft-card sm:p-5">
            {/* 省略なし・先ほどのフォーム部分そのまま */}
            {/* ... ここは前回版と同じなので、上から丸ごと貼ればOK */}
          </section>
        </Reveal>

        {/* 一覧 */}
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
              {sorted.length !== all.length && (
                <span>
                  FILTERED{" "}
                  <span className="font-semibold text-tiffany-600">
                    {sorted.length}
                  </span>
                </span>
              )}
            </div>
          </div>

          {sorted.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
              条件に合うクルマはなし
              絞り込み条件を少し緩めて再検索する想定
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((car) => {
                // ここで常にプレースホルダーを使う
                const thumbnail = "/images/cars/placeholder.jpg";

                return (
                  <Link
                    key={car.id}
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                  >
                    <GlassCard
                      as="article"
                      padding="md"
                      interactive
                      className="group relative h-full overflow-hidden rounded-3xl bg-white/90 shadow-soft-card transition-transform duration-500 hover:-translate-y-[3px] hover:shadow-soft-card"
                    >
                      {/* カード内の光 */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                      </div>

                      <div className="relative z-10 flex h-full flex-col gap-3">
                        {/* サムネイル */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <img
                            src={thumbnail}
                            alt={car.name ?? car.slug}
                            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>

                        {/* テキスト部 */}
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="text-[11px] font-semibold tracking-[0.28em] text-tiffany-700">
                            {car.maker}
                          </div>
                          <h3 className="text-sm font-semibold tracking-[0.03em] text-slate-900">
                            {car.name}
                          </h3>
                          <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                            {car.summary ??
                              "この車種についての詳細なインプレッションは順次追加予定。"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            {car.bodyType && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                                {car.bodyType}
                              </span>
                            )}
                            {car.segment && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                                {car.segment}
                              </span>
                            )}
                            <span
                              className={[
                                "rounded-full border px-3 py-1",
                                difficultyBadgeClass(car.difficulty),
                              ].join(" ")}
                            >
                              維持難易度: {mapDifficultyLabel(car.difficulty)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
