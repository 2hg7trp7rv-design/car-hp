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
import { hasRealEditorialImage } from "@/lib/editorial-media";
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

  const effectiveSlugs = slugs.length > 0 ? slugs : initialFromServer;

  const pendingInit = useRef<string[] | null>(null);

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

  useEffect(() => {
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
        const hay = [c.slug, c.maker, c.name, c.bodyType, c.segment, c.drive]
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

      return groups.slice(0, 2);
    }

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
        get: (c: CompareCarIndexItem) => (c.releaseYear ? `${c.releaseYear}年頃` : "—"),
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
          const out = [c.engine, c.transmission, c.fuel].filter(Boolean).join(" / ");
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
        get: (c: CompareCarIndexItem) => ((c.summary ?? "").trim().length ? c.summary!.trim() : "—"),
      },
    ] as const;

    if (!diffOnly || selectedCars.length < 2) return r;

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
      // noop
    }
  };

  return (
    <div className="space-y-8">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {selectedCars.length === 0
          ? "比較対象は未選択です。"
          : `${selectedCars.length}台を比較中。最大3台まで選べます。`}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">
              選択中
            </div>
            <span className="rounded-full border border-[rgba(122,135,108,0.24)] bg-[var(--surface-moss)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent-strong)]">
              {selectedCars.length}/3
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--border-default)] accent-[var(--accent-base)]"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
              />
              差分のみを表示
            </label>

            <Button type="button" variant="outline" size="sm" onClick={handleShare} disabled={selectedCars.length === 0}>
              {copied ? "コピー済み" : "URL共有"}
            </Button>

            <Button type="button" variant="subtle" size="sm" onClick={handleClear} disabled={selectedCars.length === 0}>
              クリア
            </Button>
          </div>
        </div>

        {selectedCars.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] p-5 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
            まだ車種が選ばれていません。
            <div className="mt-2 text-[12px] text-[var(--text-tertiary)]">
              <Link className="cb-link" href="/cars">
                車種一覧
              </Link>
              や
              <Link className="cb-link" href="/cars/segments">
                用途から絞る
              </Link>
              ページから候補を追加してください。
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/cars/segments" className="cb-chip">
                用途から絞る
              </Link>
              <Link href="/cars" className="cb-chip">
                車種を見る
              </Link>
              <Link href="/site-map" className="cb-chip">
                サイトマップ
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {selectedCars.map((car) => {
              const heroRaw = (car.heroImage ?? "").trim();
              const hero =
                heroRaw.startsWith("http://") || heroRaw.startsWith("https://")
                  ? heroRaw
                  : hasRealEditorialImage(heroRaw)
                    ? pickExistingLocalPublicAssetPath(heroRaw, null)
                    : null;
              const hasHero = Boolean(hero);

              return (
                <div
                  key={car.slug}
                  className="relative overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.78)]"
                >
                  <div className="absolute right-3 top-3 z-10">
                    <Button
                      type="button"
                      variant="subtle"
                      size="xs"
                      magnetic={false}
                      className="h-7 px-2.5"
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
                      hasHero ? (
                        <div className="overflow-hidden bg-[var(--surface-2)]">
                          <img
                            src={hero as string}
                            alt={car.name ?? car.slug}
                            className="h-32 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex h-32 flex-col justify-between border-b border-[rgba(31,28,25,0.08)] bg-[linear-gradient(135deg,rgba(229,235,239,0.72),rgba(251,248,243,0.98))] p-4">
                          <div className="flex items-center justify-between gap-3 text-[10px] font-semibold tracking-[0.18em] text-[var(--accent-slate)]">
                            <span>比較候補</span>
                            <span className="text-[var(--text-tertiary)]">比較カード</span>
                          </div>
                          <p className="max-w-[18ch] text-[14px] font-medium leading-[1.55] text-[var(--text-primary)]">
                            画像がなくても、主要な違いを比較。
                          </p>
                        </div>
                      )
                    ) : null}

                    <div className="p-4">
                      <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-slate)]">
                        {car.maker ?? ""}
                      </div>
                      <div className="mt-2 text-[15px] font-semibold leading-[1.45] text-[var(--text-primary)]">
                        {car.name ?? car.slug}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                        {car.bodyType ? (
                          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">{car.bodyType}</span>
                        ) : null}
                        {car.segment ? (
                          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">{car.segment}</span>
                        ) : null}
                      </div>
                    </div>
                  </TrackedLink>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {suggestGroups.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">
                おすすめ候補
              </div>
              <p className="mt-1 text-[12px] leading-[1.8] text-[var(--text-secondary)]">
                選択中の候補に近い車種を提案します。
              </p>
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">
              追加できない時は <Link className="cb-link" href="/cars">車種一覧</Link> から探す
            </div>
          </div>

          <div className="space-y-3">
            {suggestGroups.map((group) => (
              <ShelfImpression key={group.id} shelfId={`compare_suggest_${group.id}`}>
                <div className="rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[13px] font-semibold text-[var(--text-primary)]">{group.label}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">クリックで比較に追加</div>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {group.items.slice(0, 8).map((car) => (
                      <div
                        key={car.slug}
                        className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.84)] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-slate)]">
                            {car.maker}
                          </div>
                          <div className="mt-1 truncate text-[13px] font-semibold text-[var(--text-primary)]">
                            {car.name}
                          </div>
                          <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                            {car.bodyType ?? ""}{car.segment ? ` / ${car.segment}` : ""}
                          </div>
                        </div>

                        <CompareAddButton
                          slug={car.slug}
                          mode="pill"
                          label="追加"
                          source={`compare_suggest_${group.id}`}
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
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">
              追加する
            </div>
            <p className="mt-1 text-[12px] leading-[1.8] text-[var(--text-secondary)]">
              車種名 / メーカー / ボディ / セグメントで検索して追加
            </p>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例：BMW / セダン / Cセグメント"
            className="cb-input max-w-full rounded-full sm:max-w-sm"
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {candidates.map((car) => (
            <div
              key={car.slug}
              className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.78)] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-slate)]">
                  {car.maker}
                </div>
                <div className="mt-1 truncate text-[13px] font-semibold text-[var(--text-primary)]">
                  {car.name}
                </div>
                <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">
            比較表
          </div>
          {selectedCars.length < 2 ? (
            <div className="text-[11px] text-[var(--text-tertiary)]">2台以上を選ぶと差分が見えます</div>
          ) : null}
        </div>

        {selectedCars.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] p-5 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
            比較表は車種を追加すると表示されます。
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.88)]">
              <table className="min-w-[720px] w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[rgba(229,235,239,0.72)] text-[11px] tracking-[0.12em] text-[var(--text-secondary)]">
                    <th className="w-48 px-4 py-3 text-left font-semibold">項目</th>
                    {selectedCars.map((car) => (
                      <th key={car.slug} className="min-w-[210px] px-4 py-3 text-left font-semibold">
                        {car.name ?? car.slug}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={row.key}
                      className={rowIndex % 2 === 1 ? "bg-[rgba(238,231,222,0.36)]" : undefined}
                    >
                      <td className="border-t border-[rgba(31,28,25,0.08)] px-4 py-3 align-top font-semibold text-[var(--text-primary)]">
                        {row.label}
                      </td>
                      {selectedCars.map((car) => (
                        <td
                          key={car.slug}
                          className="border-t border-[rgba(31,28,25,0.08)] px-4 py-3 align-top text-[var(--text-secondary)]"
                        >
                          <div className={row.key === "summary" ? "leading-[1.85]" : "leading-[1.8]"}>
                            {row.get(car)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] leading-[1.8] text-[var(--text-tertiary)]">
              ※ 数値や装備はグレード / 年式で変動します。候補が固まったら、詳細は各車種ページで確認してください。
            </div>
          </>
        )}
      </section>
    </div>
  );
}
