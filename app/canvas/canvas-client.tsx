"use client";

import { useMemo, useState } from "react";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { CompareAddButton } from "@/components/compare/CompareAddButton";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { pickExistingLocalPublicAssetPath } from "@/lib/public-assets";

export type CanvasCarIndexItem = {
  id: string;
  slug: string;
  maker: string;
  name: string;

  heroImage?: string | null;

  bodyType?: string | null;
  segment?: string | null;
  drive?: string | null;
  releaseYear?: number | null;
  difficulty?: string | null;

  priceUsed?: string | null;
  priceNew?: string | null;

  maintenanceCostYenPerYear?: number | null;
  purchasePriceSafe?: string | null;
  fuelEconomy?: string | null;
  powerPs?: number | null;
  torqueNm?: number | null;
  zeroTo100?: number | null;

  summary?: string | null;
  summaryLong?: string | null;
};

type PriorityMode = "balanced" | "lowRisk" | "performance" | "practical";

type Scored = {
  car: CanvasCarIndexItem;
  score: number;
  badges: string[];
  reasons: string[];
  flags: string[];
};

function uniqSorted(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "ja"));
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function normalizeDifficulty(raw: string | null | undefined): number {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "basic") return 1;
  if (s === "intermediate") return 2;
  if (s === "advanced") return 3;
  return 2; // unknown → intermediate 扱い
}

function labelDifficulty(level: number): string {
  if (level <= 1) return "basic";
  if (level === 2) return "intermediate";
  return "advanced";
}

/**
 * Price strings like:
 * - "250万〜800万円（年式/状態）"
 * - "800万〜1200万円"
 * - "6000万〜1.2億円（相場変動）"
 * - "3.5億〜6.5億円"
 *
 * Policy:
 * - Return values in "万円" (man-yen).
 * - 1億 = 10,000万.
 */
function parsePriceRangeManYen(raw: string | null | undefined): { min?: number; max?: number } | null {
  const s = String(raw ?? "")
    .replace(/,/g, "")
    .replace(/[（(].*?[）)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;

  const vals = Array.from(s.matchAll(/(\d+(?:\.\d+)?)\s*(億|万)/g))
    .map((m) => {
      const n = Number(m[1]);
      const unit = m[2];
      if (!Number.isFinite(n)) return null;
      return unit === "億" ? n * 10_000 : n;
    })
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

  if (vals.length <= 0) return null;

  const a = vals[0];
  const b = vals.length >= 2 ? vals[1] : vals[0];
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;

  return { min, max };
}

function formatManYen(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "";
  if (n >= 10000) return `${Math.round(n / 1000) / 10}億円`;
  return `${Math.round(n)}万円`;
}

function formatYenPerYear(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "";
  if (n >= 1000000) return `年${Math.round(n / 100000) / 10}百万円`;
  return `年${Math.round(n / 10000)}万円`;
}

function asText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function toggle(setter: (next: string[]) => void, values: string[], value: string): void {
  const v = value.trim();
  if (!v) return;
  const has = values.includes(v);
  setter(has ? values.filter((x) => x !== v) : [...values, v]);
}

function scoreCar(
  car: CanvasCarIndexItem,
  input: {
    budgetMaxMan: number;
    difficultyMax: number;
    bodyTypes: string[];
    drives: string[];
    priority: PriorityMode;
  },
): Scored {
  const scoreParts: number[] = [];
  const reasons: string[] = [];
  const badges: string[] = [];
  const flags: string[] = [];

  const diff = normalizeDifficulty(car.difficulty);

  // --- Difficulty ---
  if (diff <= input.difficultyMax) {
    const bonus = input.priority === "lowRisk" ? 10 : 6;
    scoreParts.push(bonus);
    reasons.push(`難易度: ${labelDifficulty(diff)}（許容）`);
  } else {
    scoreParts.push(-30);
    flags.push(`難易度が高い（${labelDifficulty(diff)}）`);
  }

  // --- Budget ---
  const used = parsePriceRangeManYen(car.priceUsed);
  if (!used?.min && !used?.max) {
    scoreParts.push(-6);
    flags.push("相場レンジ不明");
  } else {
    const min = used?.min ?? used?.max ?? input.budgetMaxMan;
    const max = used?.max ?? used?.min ?? min;
    if (min <= input.budgetMaxMan) {
      const within = max <= input.budgetMaxMan;
      scoreParts.push(within ? 18 : 10);
      reasons.push(`相場: ${formatManYen(min)}〜${formatManYen(max)}（予算上限 ${formatManYen(input.budgetMaxMan)}）`);
      if (within) badges.push("予算内");
      else badges.push("条件次第で予算内");
    } else {
      scoreParts.push(-40);
      flags.push(`予算超え（下限 ${formatManYen(min)}）`);
    }
  }

  // --- Preference match ---
  const bt = asText(car.bodyType);
  if (input.bodyTypes.length > 0) {
    if (bt && input.bodyTypes.includes(bt)) {
      scoreParts.push(10);
      reasons.push(`ボディ: ${bt}（一致）`);
      badges.push(bt);
    } else {
      scoreParts.push(-4);
    }
  } else if (bt) {
    reasons.push(`ボディ: ${bt}`);
  }

  const drv = asText(car.drive);
  if (input.drives.length > 0) {
    if (drv && input.drives.includes(drv)) {
      scoreParts.push(8);
      reasons.push(`駆動: ${drv}（一致）`);
      badges.push(drv);
    } else {
      scoreParts.push(-3);
    }
  } else if (drv) {
    reasons.push(`駆動: ${drv}`);
  }

  // --- Maintenance ---
  const maint = car.maintenanceCostYenPerYear;
  if (typeof maint === "number" && Number.isFinite(maint)) {
    // Rough normalization: 30万〜150万/年 の想定
    const norm = clamp((1500000 - maint) / (1500000 - 300000), 0, 1);
    const w = input.priority === "lowRisk" ? 26 : input.priority === "practical" ? 20 : 10;
    scoreParts.push(Math.round(norm * w));
    reasons.push(`維持費目安: ${formatYenPerYear(maint)}`);
    if (maint <= 600000) badges.push("維持費低め");
  } else {
    if (input.priority === "lowRisk" || input.priority === "practical") {
      scoreParts.push(-6);
      flags.push("維持費目安が未設定");
    }
  }

  // --- Performance hints (soft) ---
  if (input.priority === "performance") {
    const ps = typeof car.powerPs === "number" ? car.powerPs : null;
    const z = typeof car.zeroTo100 === "number" ? car.zeroTo100 : null;

    if (ps != null) {
      // 120〜450ps を想定
      const norm = clamp((ps - 120) / (450 - 120), 0, 1);
      scoreParts.push(Math.round(norm * 18));
      reasons.push(`出力: ${ps}ps`);
      if (ps >= 300) badges.push("高出力");
    }

    if (z != null) {
      // 3.0〜10.0 秒
      const norm = clamp((10 - z) / (10 - 3), 0, 1);
      scoreParts.push(Math.round(norm * 14));
      reasons.push(`0-100: ${z}s`);
      if (z <= 5.0) badges.push("速い");
    }
  }

  // --- Practical hints ---
  if (input.priority === "practical") {
    const seg = asText(car.segment);
    const eco = asText(car.fuelEconomy);
    if (eco) {
      scoreParts.push(6);
      reasons.push(`燃費感: ${eco}`);
    }
    if (seg) {
      reasons.push(`セグメント: ${seg}`);
    }
  }

  // --- Final ---
  const rawScore = scoreParts.reduce((a, b) => a + b, 0);
  const score = Math.round(rawScore);
  const uniqBadges = Array.from(new Set(badges.filter(Boolean))).slice(0, 4);
  const uniqReasons = Array.from(new Set(reasons.filter(Boolean))).slice(0, 5);
  const uniqFlags = Array.from(new Set(flags.filter(Boolean))).slice(0, 4);

  return { car, score, badges: uniqBadges, reasons: uniqReasons, flags: uniqFlags };
}

function BudgetPresets({ onPick }: { onPick: (man: number) => void }) {
  const presets = [200, 300, 500, 800, 1200, 2000, 3000];
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <Button
          key={p}
          type="button"
          size="sm"
          variant="outline"
          magnetic
          onClick={() => onPick(p)}
          className="h-10 rounded-full px-4 text-[12px]"
        >
          {p}万
        </Button>
      ))}
    </div>
  );
}

export function CanvasClient({ cars }: { cars: CanvasCarIndexItem[] }) {
  const bodyTypeOptions = useMemo(() => uniqSorted(cars.map((c) => c.bodyType)), [cars]);
  const driveOptions = useMemo(() => uniqSorted(cars.map((c) => c.drive)), [cars]);

  const [budgetMaxMan, setBudgetMaxMan] = useState<number>(800);
  const [difficultyMax, setDifficultyMax] = useState<number>(2);
  const [priority, setPriority] = useState<PriorityMode>("balanced");
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [drives, setDrives] = useState<string[]>([]);

  const scored = useMemo(() => {
    const input = { budgetMaxMan, difficultyMax, bodyTypes, drives, priority };

    const pool: Scored[] = cars
      .map((car) => scoreCar(car, input))
      // hard filters
      .filter((x) => {
        const diff = normalizeDifficulty(x.car.difficulty);
        if (diff > difficultyMax) return false;

        const used = parsePriceRangeManYen(x.car.priceUsed);
        const min = used?.min ?? used?.max;
        if (typeof min === "number" && Number.isFinite(min)) {
          return min <= budgetMaxMan;
        }

        // price unknown → keep, but they will be scored lower
        return true;
      });

    // sort
    pool.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const yA = a.car.releaseYear ?? 0;
      const yB = b.car.releaseYear ?? 0;
      if (yB !== yA) return yB - yA;
      return (a.car.maker || "").localeCompare(b.car.maker || "", "ja");
    });

    return pool;
  }, [cars, budgetMaxMan, difficultyMax, priority, bodyTypes, drives]);

  const top = scored.slice(0, 12);
  const restCount = Math.max(0, scored.length - top.length);

  const reset = () => {
    setBudgetMaxMan(800);
    setDifficultyMax(2);
    setPriority("balanced");
    setBodyTypes([]);
    setDrives([]);
  };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
      {/* Controls */}
      <aside className="space-y-4">
        <GlassCard padding="md" className="bg-white" magnetic={false}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                INPUT
              </p>
              <h2 className="mt-2 font-serif text-[18px] font-semibold tracking-tight text-[#222222]">
                条件
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">
                候補を絞るための「上限」を置きます。まずは雑でOK。
              </p>
            </div>

            <Button
              type="button"
              variant="subtle"
              size="sm"
              magnetic
              onClick={reset}
              className="h-10 rounded-full px-4"
            >
              リセット
            </Button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Budget */}
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.12em] text-[#222222]">
                予算（中古の上限）
              </label>
              <p className="mt-2 text-[12px] text-[#222222]/70">
                上限: <span className="font-semibold text-[#222222]">{budgetMaxMan}万円</span>
              </p>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={budgetMaxMan}
                onChange={(e) => setBudgetMaxMan(Number(e.target.value))}
                className="mt-3 w-full"
                aria-label="予算上限（万円）"
              />
              <div className="mt-3">
                <BudgetPresets onPick={setBudgetMaxMan} />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.12em] text-[#222222]">
                難易度（許容）
              </label>
              <p className="mt-2 text-[12px] text-[#222222]/70">
                {difficultyMax === 1
                  ? "basic（国産〜軽い輸入の感覚）"
                  : difficultyMax === 2
                    ? "intermediate（輸入を普通に扱う）"
                    : "advanced（癖も含めて楽しむ）"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={difficultyMax === 1 ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setDifficultyMax(1)}
                  className="h-10 rounded-full px-4 text-[12px]"
                >
                  basic
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={difficultyMax === 2 ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setDifficultyMax(2)}
                  className="h-10 rounded-full px-4 text-[12px]"
                >
                  intermediate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={difficultyMax === 3 ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setDifficultyMax(3)}
                  className="h-10 rounded-full px-4 text-[12px]"
                >
                  advanced
                </Button>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.12em] text-[#222222]">
                優先
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={priority === "balanced" ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setPriority("balanced")}
                  className="h-11 rounded-2xl text-[12px]"
                >
                  Balanced
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={priority === "lowRisk" ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setPriority("lowRisk")}
                  className="h-11 rounded-2xl text-[12px]"
                >
                  Low risk
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={priority === "performance" ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setPriority("performance")}
                  className="h-11 rounded-2xl text-[12px]"
                >
                  Performance
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={priority === "practical" ? "subtle" : "outline"}
                  magnetic
                  onClick={() => setPriority("practical")}
                  className="h-11 rounded-2xl text-[12px]"
                >
                  Practical
                </Button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-[#222222]/70">
                Low risk は維持費/難易度を強めに見ます。Performance は出力/加速の情報がある車を優先します。
              </p>
            </div>

            {/* Body type */}
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.12em] text-[#222222]">
                ボディ（任意）
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {bodyTypeOptions.map((bt) => {
                  const active = bodyTypes.includes(bt);
                  return (
                    <Button
                      key={bt}
                      type="button"
                      size="sm"
                      variant={active ? "subtle" : "outline"}
                      magnetic
                      onClick={() => toggle(setBodyTypes, bodyTypes, bt)}
                      className="h-10 rounded-full px-4 text-[12px]"
                    >
                      {bt}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Drive */}
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.12em] text-[#222222]">
                駆動（任意）
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {driveOptions.map((d) => {
                  const active = drives.includes(d);
                  return (
                    <Button
                      key={d}
                      type="button"
                      size="sm"
                      variant={active ? "subtle" : "outline"}
                      magnetic
                      onClick={() => toggle(setDrives, drives, d)}
                      className="h-10 rounded-full px-4 text-[12px]"
                    >
                      {d}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      </aside>

      {/* Results */}
      <section className="space-y-4">
        <GlassCard padding="md" className="bg-white" magnetic={false}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                OUTPUT
              </p>
              <h2 className="mt-2 font-serif text-[18px] font-semibold tracking-tight text-[#222222]">
                候補（上位12）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">
                今の条件で <span className="font-semibold text-[#222222]">{scored.length}</span> 件。
                {restCount > 0 ? `（残り ${restCount} 件は同条件で下位）` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" magnetic className="h-11 rounded-full px-4">
                <a href="#cb-canvas-results">スクロール</a>
              </Button>
              <Button asChild variant="outline" size="sm" magnetic className="h-11 rounded-full px-4">
                <a href="/compare">COMPAREを開く</a>
              </Button>
            </div>
          </div>
        </GlassCard>

        <div id="cb-canvas-results" className="grid gap-4 lg:grid-cols-2">
          {top.map((x) => (
            <CanvasResultCard key={x.car.id} item={x} />
          ))}
        </div>

        {scored.length === 0 && (
          <GlassCard padding="md" className="bg-white" magnetic={false}>
            <p className="text-[12px] leading-relaxed text-[#222222]/70">
              条件が厳しすぎて候補が0になっています。まずは予算上限を上げるか、難易度を緩めてください。
            </p>
          </GlassCard>
        )}

        <GlassCard padding="md" className="bg-white" magnetic={false}>
          <h3 className="text-[12px] font-semibold tracking-[0.12em] text-[#222222]">次の手</h3>
          <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
            <li>1) 候補を3〜10台まで落とす（このページ）</li>
            <li>2) 2〜3台を比較表に載せる（COMPARE）</li>
            <li>3) 予算は「車体」ではなく「総額（税/車検/初期整備）」で崩す</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" magnetic className="h-11 rounded-full px-4">
              <a href="/guide/maintenance-cost-simulation">維持費シミュレーション</a>
            </Button>
            <Button asChild variant="outline" size="sm" magnetic className="h-11 rounded-full px-4">
              <a href="/guide/hub-usedcar">中古車検索HUB</a>
            </Button>
            <Button asChild variant="outline" size="sm" magnetic className="h-11 rounded-full px-4">
              <a href="/cars">CARS（車種DB）</a>
            </Button>
          </div>
        </GlassCard>
      </section>

      <CompareFloatingBar />
    </div>
  );
}

function CanvasResultCard({ item }: { item: Scored }) {
  const car = item.car;
  const title = `${car.maker ?? ""} ${car.name ?? ""}`.trim() || car.name;
  const image = pickExistingLocalPublicAssetPath((car.heroImage ?? "").trim() || null, null);

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-20">
        <CompareAddButton slug={car.slug} mode="icon" source="canvas" />
      </div>

      <TrackedLink
        href={`/cars/${encodeURIComponent(car.slug)}`}
        toType="cars"
        toId={car.slug}
        shelfId="canvas_results"
        ctaId="canvas_open_car"
        className="block"
      >
        <GlassCard
          as="article"
          padding="md"
          interactive
          magnetic={false}
          className="h-full border border-[#222222]/10 bg-white text-[#222222]"
        >
          <div className="flex flex-col gap-3">
            {image && (
              <div className="overflow-hidden rounded-2xl border border-[#222222]/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                {car.maker && (
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#222222]/55">
                    {car.maker}
                  </p>
                )}
                <h3 className="mt-1 line-clamp-2 font-serif text-[18px] font-semibold tracking-tight text-[#222222]">
                  {car.name}
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#222222]/55">SCORE</p>
                <p className="text-[20px] font-semibold text-[#0ABAB5]">{item.score}</p>
              </div>
            </div>

            {item.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-[#222222]/10 bg-[#0ABAB5]/[0.10] px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#0A6B69]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            {item.reasons.length > 0 && (
              <ul className="space-y-1 text-[12px] leading-relaxed text-[#222222]/70">
                {item.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            )}

            {item.flags.length > 0 && (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/70 p-3">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-amber-800">
                  注意
                </p>
                <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-amber-900/80">
                  {item.flags.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-[#222222]/70">
              {(car.summaryLong || car.summary || "").slice(0, 120)}
              {(car.summaryLong || car.summary || "").length > 120 ? "…" : ""}
            </p>
          </div>
        </GlassCard>
      </TrackedLink>
    </div>
  );
}
