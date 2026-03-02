"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CompareAddButton } from "@/components/compare/CompareAddButton";
import { ShelfImpression } from "@/components/analytics/ShelfImpression";
import {
  buildCompareUrl,
  clearCompareSlugs,
  readCompareSlugs,
  removeCompareSlug,
  writeCompareSlugs,
  useCompareSlugs,
} from "@/components/compare/compareStore";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { usePageContext } from "@/lib/analytics/pageContext";
import {
  trackCompareClear,
  trackCompareRemove,
  trackCompareShare,
  trackCompareView,
} from "@/lib/analytics/events";
import { ENABLE_CAR_IMAGES } from "@/lib/features";
import { pickExistingLocalPublicAssetPath } from "@/lib/public-assets";

type CompareCarIndexItem = {
  slug: string;
  id: string;
  maker?: string;
  name?: string;
  heroImage?: string;

  bodyType?: string;
  segment?: string;
  drive?: string;
  releaseYear?: number;

  priceNew?: string;
  priceUsed?: string;

  engine?: string;
  transmission?: string;
  fuel?: string;
  powerPs?: number;
  torqueNm?: number;

  zeroTo100?: number | string;
  fuelEconomy?: string;

  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;

  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
};

function parseCarsParam(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniq(items: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of items) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function formatNum(n?: number, unit?: string): string {
  if (n == null || Number.isNaN(n)) return "—";
  return unit ? `${n.toLocaleString()}${unit}` : n.toLocaleString();
}

function formatText(v?: string | number | null): string {
  if (v == null) return "—";
  const s = String(v).trim();
  return s.length ? s : "—";
}

function formatZeroTo100(v?: number | string | null): string {
  if (v == null) return "—";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return "—";
    return `${v}秒`;
  }
  const s = String(v).trim();
  if (!s) return "—";
  // 既に単位が含まれる場合はそのまま
  if (/[秒s]/i.test(s)) return s;
  return `${s}秒`;
}
export function CompareClient({
  cars,
  initialSlugs = [],
}: {
  cars: CompareCarIndexItem[];
  initialSlugs?: string[];
}) {
  const ctx = usePageContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { slugs } = useCompareSlugs();

  const carBySlug = useMemo(() => {
    const m = new Map<string, CompareCarIndexItem>();
    for (const c of cars) {
      m.set(c.slug, c);
    }
    return m;
  }, [cars]);

  const initialFromServer = useMemo(() => {
    return uniq(initialSlugs)
      .filter((s) => carBySlug.has(s))
      .slice(0, 3);
  }, [initialSlugs, carBySlug]);

  // SSR/JS失敗時に「URLのcars=…」から最低限の比較ができるようにする
  // store(slugs) が空の間だけ、serverから渡した初期値を表示に使う
  const effectiveSlugs = slugs.length > 0 ? slugs : initialFromServer;

  // 初期同期が反映されるまで URL 同期を止める（初回だけ）
  const pendingInit = useRef<string[] | null>(null);

  // 初期化：query -> localStorage へ反映（無効slugは除去）
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const fromQuery = parseCarsParam(searchParams.get("cars"));
    const fromLS = readCompareSlugs();

    const initialRaw = fromQuery.length > 0 ? fromQuery : fromLS;
    const cleaned = uniq(initialRaw)
      .filter((s) => carBySlug.has(s))
      .slice(0, 3);

    pendingInit.current = cleaned;
    writeCompareSlugs(cleaned);

    trackCompareView({
      page_type: ctx.page_type,
      content_id: ctx.content_id,
      count: cleaned.length,
      source: fromQuery.length > 0 ? "query" : "localStorage",
    });
  }, [searchParams, carBySlug, ctx.page_type, ctx.content_id]);

  // slugs が変わったら URL を同期（共有しやすくする）
  useEffect(() => {
    // 初回同期が state に反映されるまで待つ
    if (pendingInit.current) {
      if (!arraysEqual(slugs, pendingInit.current)) return;
      pendingInit.current = null;
    }

    const current = uniq(parseCarsParam(searchParams.get("cars")))
      .filter((s) => carBySlug.has(s))
      .slice(0, 3);
    const target = uniq(slugs).slice(0, 3);

    if (arraysEqual(current, target)) return;
    router.replace(buildCompareUrl(target));
  }, [slugs, router, searchParams, carBySlug]);

  const selectedCars = useMemo(
    () => effectiveSlugs.map((s) => carBySlug.get(s)).filter(Boolean) as CompareCarIndexItem[],
    [effectiveSlugs, carBySlug],
  );

  const [q, setQ] = useState("");
  const [diffOnly, setDiffOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const candidates = useMemo(() => {
    const query = q.trim().toLowerCase();
    const selected = new Set(effectiveSlugs);

    const base = cars.filter((c) => !selected.has(c.slug));
    if (!query) return base.slice(0, 12);

    const scored = base
      .map((c) => {
        const hay = [
          c.slug,
          c.maker,
          c.name,
          c.bodyType,
          c.segment,
          c.drive,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const hit = hay.includes(query);
        return { c, hit };
      })
      .filter((x) => x.hit)
      .map((x) => x.c);

    return scored.slice(0, 12);
  }, [q, cars, effectiveSlugs]);

  type SuggestGroup = {
    id: string;
    label: string;
    items: CompareCarIndexItem[];
  };

  const suggestGroups = useMemo<SuggestGroup[]>(() => {
    if (selectedCars.length === 0) return [];

    const selected = new Set(effectiveSlugs);
    const pool = cars.filter((c) => !selected.has(c.slug));

    // 1台の時は「同セグメント/同ボディ/同メーカー」で分ける（分かりやすさ優先）
    if (selectedCars.length === 1) {
      const base = selectedCars[0];
      const groups: SuggestGroup[] = [];

      const sameSegment = base.segment
        ? pool.filter((c) => c.segment && c.segment === base.segment).slice(0, 8)
        : [];
      if (sameSegment.length > 0) {
        groups.push({ id: "segment", label: `同セグメント（${base.segment}）`, items: sameSegment });
      }

      const sameBody = base.bodyType
        ? pool.filter((c) => c.bodyType && c.bodyType === base.bodyType).slice(0, 8)
        : [];
      if (sameBody.length > 0) {
        groups.push({ id: "body", label: `同ボディタイプ（${base.bodyType}）`, items: sameBody });
      }

      const sameMaker = base.maker
        ? pool.filter((c) => c.maker && c.maker === base.maker).slice(0, 8)
        : [];
      if (sameMaker.length > 0) {
        groups.push({ id: "maker", label: `同メーカー（${base.maker}）`, items: sameMaker });
      }

      // 最大2グループまで（見た目が重くなりすぎないように）
      return groups.slice(0, 2);
    }

    // 2台以上の時は「3台目候補」をスコアで提案
    const score = (c: CompareCarIndexItem): number => {
      let s = 0;
      for (const base of selectedCars) {
        if (base.segment && c.segment && base.segment === c.segment) s += 4;
        if (base.bodyType && c.bodyType && base.bodyType === c.bodyType) s += 3;
        if (base.drive && c.drive && base.drive === c.drive) s += 1;
        if (base.releaseYear && c.releaseYear) {
          const d = Math.abs(base.releaseYear - c.releaseYear);
          if (d <= 2) s += 1;
        }
      }
      // 「全く関係ない」ものは落とす
      return s;
    };

    const ranked = pool
      .map((c) => ({ c, s: score(c) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => {
        if (b.s !== a.s) return b.s - a.s;
        return (a.c.name ?? "").localeCompare(b.c.name ?? "");
      })
      .slice(0, 10)
      .map((x) => x.c);

    if (ranked.length === 0) return [];
    return [
      {
        id: "best3",
        label: "3台目候補（近いモデル）",
        items: ranked,
      },
    ];
  }, [cars, effectiveSlugs, selectedCars]);

  const rows = useMemo(() => {
    const r = [
      {
        key: "maker",
        label: "メーカー",
        get: (c: CompareCarIndexItem) => formatText(c.maker),
      },
      {
        key: "name",
        label: "車名",
        get: (c: CompareCarIndexItem) => formatText(c.name),
      },
      {
        key: "body_segment",
        label: "ボディ / セグメント",
        get: (c: CompareCarIndexItem) => {
          const a = c.bodyType ? c.bodyType : "—";
          const b = c.segment ? c.segment : "—";
          return `${a} / ${b}`;
        },
      },
      {
        key: "drive",
        label: "駆動",
        get: (c: CompareCarIndexItem) => formatText(c.drive),
      },
      {
        key: "year",
        label: "年式（目安）",
        get: (c: CompareCarIndexItem) =>
          c.releaseYear ? `${c.releaseYear}年頃` : "—",
      },
      {
        key: "price",
        label: "価格帯（目安）",
        get: (c: CompareCarIndexItem) => {
          const pn = c.priceNew ? `新車: ${c.priceNew}` : "";
          const pu = c.priceUsed ? `中古: ${c.priceUsed}` : "";
          const out = [pn, pu].filter(Boolean).join(" / ");
          return out || "—";
        },
      },
      {
        key: "powertrain",
        label: "パワートレイン",
        get: (c: CompareCarIndexItem) => {
          const out = [c.engine, c.transmission, c.fuel]
            .filter(Boolean)
            .join(" / ");
          return out || "—";
        },
      },
      {
        key: "performance",
        label: "出力 / トルク",
        get: (c: CompareCarIndexItem) => {
          const ps = c.powerPs != null ? `${c.powerPs}ps` : "—";
          const nm = c.torqueNm != null ? `${c.torqueNm}Nm` : "—";
          return `${ps} / ${nm}`;
        },
      },
      {
        key: "0to100",
        label: "0-100km/h",
        get: (c: CompareCarIndexItem) => formatZeroTo100(c.zeroTo100),
      },
      {
        key: "fuelEco",
        label: "燃費（目安）",
        get: (c: CompareCarIndexItem) => formatText(c.fuelEconomy),
      },
      {
        key: "dimensions",
        label: "サイズ（全長×全幅×全高）",
        get: (c: CompareCarIndexItem) => {
          const l = formatNum(c.lengthMm, "mm");
          const w = formatNum(c.widthMm, "mm");
          const h = formatNum(c.heightMm, "mm");
          return `${l} × ${w} × ${h}`;
        },
      },
      {
        key: "wheelbase",
        label: "ホイールベース",
        get: (c: CompareCarIndexItem) => formatNum(c.wheelbaseMm, "mm"),
      },
      {
        key: "weight",
        label: "車重",
        get: (c: CompareCarIndexItem) => formatNum(c.weightKg, "kg"),
      },
      {
        key: "strengths",
        label: "強み（要点）",
        get: (c: CompareCarIndexItem) => {
          const v = (c.strengths ?? []).filter(Boolean).slice(0, 4);
          return v.length ? v.join(" / ") : "—";
        },
      },
      {
        key: "weaknesses",
        label: "弱み（要点）",
        get: (c: CompareCarIndexItem) => {
          const v = (c.weaknesses ?? []).filter(Boolean).slice(0, 4);
          return v.length ? v.join(" / ") : "—";
        },
      },
      {
        key: "trouble",
        label: "故障・持病（傾向）",
        get: (c: CompareCarIndexItem) => {
          const v = (c.troubleTrends ?? []).filter(Boolean).slice(0, 4);
          return v.length ? v.join(" / ") : "—";
        },
      },
      {
        key: "summary",
        label: "ひとこと",
        get: (c: CompareCarIndexItem) =>
          (c.summary ?? "").trim().length ? c.summary!.trim() : "—",
      },
    ] as const;

    if (!diffOnly || selectedCars.length < 2) return r;

    // 差分のみ: 全列が同じ値 or 全て— の行は除外
    return r.filter((row) => {
      const values = selectedCars.map((c) => row.get(c));
      const uniqValues = uniq(values);
      const allEmpty = uniqValues.length === 1 && (uniqValues[0] === "—" || uniqValues[0] === "");
      const allSame = uniqValues.length === 1;
      return !(allEmpty || allSame);
    });
  }, [diffOnly, selectedCars]);

  const handleRemove = (slug: string) => {
    const next = removeCompareSlug(slug);
    trackCompareRemove({
      page_type: ctx.page_type,
      content_id: ctx.content_id,
      car_slug: slug,
      count: next.length,
      source: "compare_page",
    });
  };

  const handleClear = () => {
    clearCompareSlugs();
    trackCompareClear({
      page_type: ctx.page_type,
      content_id: ctx.content_id,
      count: 0,
      source: "compare_page",
    });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      trackCompareShare({
        page_type: ctx.page_type,
        content_id: ctx.content_id,
        count: selectedCars.length,
        source: "compare_page",
      });
    } catch {
      // clipboard が使えない場合は何もしない
    }
  };

  return (
    <div className="space-y-6">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {selectedCars.length === 0
          ? "比較対象は未選択です。"
          : `${selectedCars.length}台を比較中。最大3台まで選べます。`}
      </div>
      {/* 選択状態 */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/80">
            SELECTED
            <span className="ml-2 rounded-full bg-[#222222]/6 px-2 py-0.5 text-[10px] text-[#222222]/80">
              {selectedCars.length}/3
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-[11px] text-[#222222]/80">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#222222]/16"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
              />
              差分のみ
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={selectedCars.length === 0}
            >
              {copied ? "コピー済み" : "URL共有"}
            </Button>

            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={handleClear}
              disabled={selectedCars.length === 0}
            >
              クリア
            </Button>
          </div>
        </div>

        {selectedCars.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#222222]/12 bg-white/70 p-5 text-[12px] text-[#222222]/65">
            まだ車種が選ばれていません。
            <div className="mt-2 text-[11px] text-[#222222]/55">
              例：<Link className="underline" href="/cars">CARS</Link> で候補を探し、"比較" を押す。
              迷ったら <Link className="underline" href="/canvas">Decision Canvas</Link> から始める。
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/canvas"
                className="cb-tap inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-4 py-2 text-[11px] font-semibold text-[#222222]/75 shadow-soft hover:bg-white"
              >
                Decision Canvas
              </Link>
              <Link
                href="/cars"
                className="cb-tap inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-4 py-2 text-[11px] font-semibold text-[#222222]/75 shadow-soft hover:bg-white"
              >
                CARS
              </Link>
              <Link
                href="/exhibition"
                className="cb-tap inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-4 py-2 text-[11px] font-semibold text-[#222222]/75 shadow-soft hover:bg-white"
              >
                Exhibition Map
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {selectedCars.map((car) => {
              const heroRaw = (car.heroImage ?? "").trim();
              const hero = heroRaw
                ? (heroRaw.startsWith("http://") || heroRaw.startsWith("https://")
                    ? heroRaw
                    : pickExistingLocalPublicAssetPath(heroRaw, "/images/cars/placeholder.jpg") ??
                      "/images/cars/placeholder.jpg")
                : "/images/cars/placeholder.jpg";
              return (
                <div
                  key={car.slug}
                  className="relative overflow-hidden rounded-2xl border border-[#222222]/12 bg-white/80 shadow-soft"
                >
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      type="button"
                      variant="subtle"
                      size="xs"
                      magnetic={false}
                      className="h-7 px-2"
                      onClick={() => handleRemove(car.slug)}
                      aria-label="比較から削除"
                    >
                      ×
                    </Button>
                  </div>

                  <TrackedLink
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                    toType="cars"
                    toId={car.slug}
                    shelfId="compare_selected"
                    ctaId="compare_to_car"
                    fromType={ctx.page_type}
                    fromId={ctx.content_id}
                    className="block"
                  >
                    {ENABLE_CAR_IMAGES ? (
                      <div className="overflow-hidden">
                        <img
                          src={hero}
                          alt={car.name ?? car.slug}
                          className="h-28 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="p-3">
                      <div className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                        {car.maker ?? ""}
                      </div>
                      <div className="mt-1 text-[12px] font-semibold text-[#222222]">
                        {car.name ?? car.slug}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#222222]/65">
                        {car.bodyType && (
                          <span className="rounded-full bg-[#222222]/6 px-2 py-0.5">{car.bodyType}</span>
                        )}
                        {car.segment && (
                          <span className="rounded-full bg-[#222222]/6 px-2 py-0.5">{car.segment}</span>
                        )}
                      </div>
                    </div>
                  </TrackedLink>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* サジェスト（近い候補） */}
      {suggestGroups.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/80">
                SUGGEST
              </div>
              <p className="mt-1 text-[11px] text-[#222222]/65">
                選択中の候補に近い車種を自動で提案します（データが揃うほど精度が上がります）。
              </p>
            </div>
            <div className="text-[10px] text-[#222222]/55">
              追加できない時は <Link className="underline" href="/cars">CARS</Link> から探す
            </div>
          </div>

          <div className="space-y-3">
            {suggestGroups.map((g) => (
              <ShelfImpression key={g.id} shelfId={`compare_suggest_${g.id}`}>
                <div className="rounded-2xl border border-[#222222]/12/70 bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-[#222222]/80">
                      {g.label}
                    </div>
                    <div className="text-[10px] text-[#222222]/55">クリックで比較に追加</div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {g.items.slice(0, 8).map((car) => (
                      <div
                        key={car.slug}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#222222]/12/70 bg-white/80 px-4 py-3"
                      >
                        <div>
                          <div className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                            {car.maker}
                          </div>
                          <div className="mt-1 text-[12px] font-semibold text-[#222222]">
                            {car.name}
                          </div>
                          <div className="mt-1 text-[10px] text-[#222222]/55">
                            {car.bodyType ?? ""}{car.segment ? ` / ${car.segment}` : ""}
                          </div>
                        </div>

                        <CompareAddButton
                          slug={car.slug}
                          mode="pill"
                          label="追加"
                          source={`compare_suggest_${g.id}`}
                          goToCompare={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </ShelfImpression>
            ))}
          </div>
        </section>
      )}

      {/* 追加 */}
      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/80">ADD</div>
            <p className="mt-1 text-[11px] text-[#222222]/65">
              車種名 / メーカー / ボディ / セグメントで検索して追加
            </p>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例：BMW / セダン / Cセグメント"
            className="w-full rounded-full border border-[#222222]/12 bg-white/90 px-4 py-2 text-[12px] text-[#222222]/85 shadow-soft focus:border-tiffany-300 focus:outline-none sm:max-w-sm"
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {candidates.map((car) => (
            <div
              key={car.slug}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#222222]/12/70 bg-white/70 px-4 py-3"
            >
              <div>
                <div className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                  {car.maker}
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#222222]">
                  {car.name}
                </div>
                <div className="mt-1 text-[10px] text-[#222222]/55">
                  {car.bodyType ?? ""}{car.segment ? ` / ${car.segment}` : ""}
                </div>
              </div>

              <CompareAddButton
                slug={car.slug}
                mode="pill"
                label="追加"
                source="compare_page_picker"
                goToCompare={false}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 比較表 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/80">TABLE</div>
          {selectedCars.length < 2 && (
            <div className="text-[11px] text-[#222222]/55">2台以上を選ぶと差分が見えます</div>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#222222]/12 bg-white/80">
          <table className="min-w-[720px] w-full text-[11px]">
            <thead className="bg-[#222222]/5 text-[10px] font-semibold tracking-[0.16em] text-[#222222]/55">
              <tr>
                <th className="w-40 px-4 py-3 text-left">ITEM</th>
                {selectedCars.map((car) => (
                  <th key={car.slug} className="min-w-[200px] px-4 py-3 text-left">
                    {car.name ?? car.slug}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.key} className="align-top">
                  <td className="bg-white/50 px-4 py-3 font-semibold text-[#222222]/80">
                    {row.label}
                  </td>
                  {selectedCars.map((car) => (
                    <td key={car.slug} className="px-4 py-3 text-[#222222]/80">
                      <div className={row.key === "summary" ? "leading-relaxed" : ""}>
                        {row.get(car)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[10px] text-[#222222]/55">
          ※ 数値や装備はグレード/年式で変動します。候補が固まったら、詳細は各車種ページで確認。
        </div>
      </section>
    </div>
  );
}
