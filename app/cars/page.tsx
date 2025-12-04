// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { getAllCars, type CarItem } from "@/lib/cars";
import { CarCardThumbnail } from "@/components/cars/CarCardThumbnail";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CARS | CAR DATABASE",
  description:
    "主要な車種について 維持の難易度 ボディタイプ セグメントなどの条件で絞り込んで確認できる車種データベース",
};

// Next.js 標準の searchParams 仕様に合わせる
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
    case "difficulty":
      return "維持難易度（やさしい→気を使う）";
    default:
      return "登録順";
  }
}

// 難易度を数値化してソートに利用
function difficultyWeight(
  difficulty: CarItem["difficulty"] | undefined,
): number {
  switch (difficulty) {
    case "basic":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    default:
      return 99;
  }
}

export default async function CarsPage({ searchParams }: PageProps) {
  // ✅ データ取得はコンポーネント内でだけ行う
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
  }
  // sortKey が空のときは登録順（all の順）を維持

  const hasFilter =
    Boolean(q) ||
    Boolean(makerFilter) ||
    Boolean(difficultyFilter) ||
    Boolean(bodyTypeFilter) ||
    Boolean(segmentFilter) ||
    Boolean(sortKey);

  // ----- インデックス用の簡易統計 -----
  const totalModels = all.length;
  const basicCount = all.filter((c) => c.difficulty === "basic").length;
  const intermediateCount = all.filter(
    (c) => c.difficulty === "intermediate",
  ).length;
  const advancedCount = all.filter((c) => c.difficulty === "advanced").length;

  const sedanCount = all.filter((c) => c.bodyType === "セダン").length;
  // 「SUV/クロスオーバー」を含むものを SUV カウントとみなす
  const suvCount = all.filter((c) =>
    c.bodyType?.includes("SUV"),
  ).length;

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
          <span className="mx-2">/</span>
          <span className="text-slate-400">CARS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-5">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              CAR DATABASE
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

        {/* インデックスパネル（overview） */}
        <Reveal delay={160}>
          <section className="mb-8">
            <GlassCard
              padding="md"
              className="relative overflow-hidden border border-white/80 bg-gradient-to-r from-white/95 via-white/85 to-vapor/95 shadow-soft"
            >
              {/* 光のレイヤー */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                <div className="absolute -right-24 bottom-[-40%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.25),_transparent_72%)] blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    CURRENT INDEX
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    登録済みの車種数と 維持の難易度やボディタイプのざっくりした分布を表示
                    データは今後も少しずつ追加 更新していく前提の 小さな図鑑イメージ
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] text-slate-700 sm:grid-cols-4">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      TOTAL MODELS
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                      {totalModels}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      BASIC / STD / CARE
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-emerald-700">
                        {basicCount}
                      </span>
                      <span className="mx-1 text-slate-400">/</span>
                      <span className="font-semibold text-amber-700">
                        {intermediateCount}
                      </span>
                      <span className="mx-1 text-slate-400">/</span>
                      <span className="font-semibold text-rose-700">
                        {advancedCount}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      * 左側ほど扱いやすい目安
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      SEDAN / SUV
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-slate-900">
                        {sedanCount}
                      </span>
                      <span className="mx-1 text-slate-400">/</span>
                      <span className="font-semibold text-slate-900">
                        {suvCount}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Link href="/guide?category=MONEY">
                      <Button
                        variant="subtle"
                        size="xs"
                        className="rounded-full px-3 py-1 text-[9px] tracking-[0.18em]"
                      >
                        維持費の考え方を見る
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </Reveal>

        {/* フィルターエリア */}
        <Reveal delay={220}>
          <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-soft">
            <form className="space-y-4 text-xs sm:text-[11px]">
              <div className="grid gap-3 md:grid-cols-5">
                {/* キーワード */}
                <div className="md:col-span-2">
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
                    {difficultyOptions.map((d) => (
                      <option key={d} value={d ?? ""}>
                        {mapDifficultyLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ソート */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    SORT
                  </label>
                  <select
                    name="sort"
                    defaultValue={sortKey}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">登録順</option>
                    <option value="name">車名順</option>
                    <option value="maker">メーカー順</option>
                    <option value="difficulty">
                      維持難易度（やさしい→気を使う）
                    </option>
                  </select>
                </div>
              </div>

              {/* セグメント + BODY TYPE + クイックプリセット */}
              <div className="grid gap-3 md:grid-cols-5">
                {/* セグメント */}
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
                    {bodyTypes.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* クイックプリセット（フォーム外の補助） */}
                <div className="md:col-span-2">
                  <p className="text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    QUICK PRESET
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                    <Link
                      href="/cars?difficulty=basic&sort=difficulty"
                      className="rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 tracking-[0.16em] text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      初めての輸入車向き
                    </Link>
                    <Link
                      href="/cars?bodyType=セダン&sort=name"
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                    >
                      しっとり系セダン
                    </Link>
                    <Link
                      href={`/cars?bodyType=${encodeURIComponent(
                        "SUV/クロスオーバー",
                      )}&difficulty=advanced&sort=difficulty`}
                      className="rounded-full border border-rose-100 bg-rose-50/90 px-3 py-1 tracking-[0.16em] text-rose-800 transition hover:border-rose-300 hover:bg-rose-50"
                    >
                      手のかかるSUV
                    </Link>
                  </div>
                </div>
              </div>

              {/* 難易度レジェンド */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-slate-400">
                <span className="rounded-full bg-slate-50 px-2 py-0.5">
                  LEGEND
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50/80 px-2 py-0.5 text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  やさしい
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50/80 px-2 py-0.5 text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  標準的
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50/80 px-2 py-0.5 text-rose-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  気を使う
                </span>
                <span className="ml-auto text-[9px] text-slate-400">
                  * 条件は自由に組み合わせて利用可能
                </span>
              </div>

              {/* ボタン */}
              <div className="mt-3 flex items-center justify-end gap-3">
                {hasFilter && (
                  <Link
                    href="/cars"
                    className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                  >
                    CLEAR
                  </Link>
                )}
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="rounded-full px-5 py-2 text-[11px] tracking-[0.2em]"
                  magnetic
                >
                  絞り込み
                </Button>
              </div>
            </form>
          </section>
        </Reveal>

        {/* アクティブフィルター表示 */}
        {hasFilter && (
          <Reveal delay={260}>
            <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px]">
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
                  body:{" "}
                  <span className="font-semibold">{bodyTypeFilter}</span>
                </span>
              )}
              {segmentFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  segment:{" "}
                  <span className="font-semibold">{segmentFilter}</span>
                </span>
              )}
              {sortKey && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  sort:{" "}
                  <span className="font-semibold">
                    {mapSortLabel(sortKey)}
                  </span>
                </span>
              )}
            </div>
          </Reveal>
        )}

        {/* 一覧 */}
        <Reveal delay={280}>
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
                {sorted.map((car) => (
                  <Link
                    key={car.id}
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                  >
                    <GlassCard
                      as="article"
                      padding="md"
                      interactive
                      className="group relative h-full overflow-hidden border border-slate-200/80 bg-white/95 transition-transform duration-500 hover:-translate-y-[3px] hover:shadow-soft-card"
                    >
                      {/* カード内の光 */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                      </div>

                      <div className="relative z-10 flex h-full flex-col gap-3">
                        {/* サムネイル（プレースホルダー付き） */}
                        <CarCardThumbnail
                          src={
                            car.heroImage || (car as any).mainImage || undefined
                          }
                          alt={car.name}
                        />

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
                          <span
                            className={[
                              "rounded-full border px-2 py-1",
                              difficultyBadgeClass(car.difficulty),
                            ].join(" ")}
                          >
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
