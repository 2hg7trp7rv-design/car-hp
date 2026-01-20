// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

import { Reveal } from "@/components/animation/Reveal";
import { HeroSection } from "@/components/home/HeroSection";
import { Button } from "@/components/ui/button";

import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";

type ShortcutKind = "cars" | "column" | "guide" | "heritage" | "database";

function ShortcutIcon({ kind, className = "h-4 w-4" }: { kind: ShortcutKind; className?: string }) {
  switch (kind) {
    case "cars":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M3 15v-2.5a2 2 0 0 1 1.3-1.87l2.8-1.06 1.6-2.8A2 2 0 0 1 10.43 6h3.14a2 2 0 0 1 1.73.97l1.6 2.8 2.8 1.06A2 2 0 0 1 22 12.5V15" />
          <path d="M5.5 15h13" />
          <path d="M7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          <path d="M17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      );
    case "column":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M9 8h8" />
          <path d="M9 12h8" />
          <path d="M9 16h6" />
        </svg>
      );
    case "guide":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M8 4h10a2 2 0 0 1 2 2v14l-5-2-5 2-5-2V6a2 2 0 0 1 2-2Z" />
          <path d="M10 8h8" />
          <path d="M10 12h8" />
        </svg>
      );
    case "heritage":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
          <path d="M9 20h6" />
          <path d="M12 13v7" />
          <path d="M5 6v2a3 3 0 0 0 3 3" />
          <path d="M19 6v2a3 3 0 0 1-3 3" />
        </svg>
      );
    case "database":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M12 4c5 0 9 1.34 9 3s-4 3-9 3-9-1.34-9-3 4-3 9-3Z" />
          <path d="M3 7v5c0 1.66 4 3 9 3s9-1.34 9-3V7" />
          <path d="M3 12v5c0 1.66 4 3 9 3s9-1.34 9-3v-5" />
        </svg>
      );
  }
}

export const metadata: Metadata = {
  // NOTE: layout.tsx の title.template で末尾にブランドが付く。
  // ここでは “検索でクリックされる” ためのキーワードを先頭に置く。
  title: "車の買い方・維持費・故障・相場を整理する",
  description:
    "輸入車・国産車の車種DB（CARS）と、購入/維持/売却の実用ガイド（GUIDE）、症状・トラブル解決（COLUMN）、ブランドの深掘り（HERITAGE）を横断して判断材料を整理します。",
  openGraph: {
    title: "車の買い方・維持費・故障・相場を整理する | CAR BOUTIQUE",
    description:
      "輸入車・国産車の車種DB（CARS）と、購入/維持/売却の実用ガイド（GUIDE）、症状・トラブル解決（COLUMN）、ブランドの深掘り（HERITAGE）を横断して判断材料を整理します。",
    type: "website",
    url: `${getSiteUrl()}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "車の買い方・維持費・故障・相場を整理する | CAR BOUTIQUE",
    description:
      "輸入車・国産車の車種DB（CARS）と、購入/維持/売却の実用ガイド（GUIDE）、症状・トラブル解決（COLUMN）、ブランドの深掘り（HERITAGE）を横断して判断材料を整理します。",
  },

  alternates: { canonical: "/" },
};

// RSS等の外部取得を含むため、ビルド時の静的生成に依存させない
export const dynamic = "force-dynamic";

type HeroStats = {
  carsCount: number;
  columnsCount: number;
  guidesCount: number;
  heritageCount: number;
};

type CrossTimelineItem = {
  id: string;
  kind: "column" | "guide" | "heritage";
  title: string;
  href: string;
  dateLabel: string | null;
  meta: string;
};

type HomePageData = {
  latestCars: CarItem[];
  latestColumns: ColumnItem[];
  latestGuides: GuideItem[];
  latestHeritage: HeritageItem[];
  crossTimeline: CrossTimelineItem[];
  stats: HeroStats;
};

function safeDateFromISO(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function mapColumnCategoryShort(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術";
    case "OWNER_STORY":
      return "オーナーストーリー";
    default:
      return "コラム";
  }
}

function mapGuideCategoryShort(category?: GuideItem["category"]): string {
  switch (category) {
    case "MONEY":
      return "お金・維持費";
    case "PROCEDURE":
      return "手続き・名義変更";
    case "INSURANCE":
      return "保険・リスク";
    case "BUY":
      return "購入ガイド";
    case "SELL":
      return "売却ガイド";
    default:
      return "ガイド";
  }
}

function buildCrossTimeline(
  columns: ColumnItem[],
  guides: GuideItem[],
  heritage: HeritageItem[],
): CrossTimelineItem[] {
  type ItemWithTime = CrossTimelineItem & { sortTime: number | null };

  const items: ItemWithTime[] = [];

  columns.forEach((c) => {
    const d = safeDateFromISO(c.publishedAt ?? null);
    items.push({
      id: `column-${c.id}`,
      kind: "column",
      title: c.title,
      href: `/column/${encodeURIComponent(c.slug)}`,
      dateLabel: formatDateLabel(d),
      meta: mapColumnCategoryShort(c.category),
      sortTime: d ? d.getTime() : null,
    });
  });

  guides.forEach((g) => {
    const d = safeDateFromISO(g.publishedAt ?? null);
    items.push({
      id: `guide-${g.id}`,
      kind: "guide",
      title: g.title,
      href: `/guide/${encodeURIComponent(g.slug)}`,
      dateLabel: formatDateLabel(d),
      meta: mapGuideCategoryShort(g.category),
      sortTime: d ? d.getTime() : null,
    });
  });

  heritage.forEach((h) => {
    const baseTitle = h.titleJa ?? h.title;
    const d = safeDateFromISO(h.publishedAt ?? h.updatedAt ?? null);
    items.push({
      id: `heritage-${h.id}`,
      kind: "heritage",
      title: baseTitle,
      href: `/heritage/${encodeURIComponent(h.slug)}`,
      dateLabel: formatDateLabel(d),
      meta:
        h.maker && h.eraLabel
          ? `${h.maker} · ${h.eraLabel}`
          : h.maker || h.eraLabel || "HERITAGE",
      sortTime: d ? d.getTime() : null,
    });
  });

  items.sort((a, b) => {
    if (a.sortTime === null && b.sortTime === null) return 0;
    if (a.sortTime === null) return 1;
    if (b.sortTime === null) return -1;
    return b.sortTime - a.sortTime;
  });

  const limited = items.slice(0, 12);
  return limited.map(({ sortTime, ...rest }) => rest);
}

async function getHomePageData(): Promise<HomePageData> {
  const [cars, columns, guides, heritage] = await Promise.all([
    getAllCars(),
    getAllColumns(),
    getAllGuides(),
    getAllHeritage(),
  ]);

  const sortedCars = [...cars].sort((a, b) => {
    const yearA = a.releaseYear ?? 0;
    const yearB = b.releaseYear ?? 0;
    if (yearA !== yearB) return yearB - yearA;
    return a.name.localeCompare(b.name, "ja");
  });
  const latestCars = sortedCars.slice(0, 6);

  const sortedColumns = [...columns].sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
    return a.title.localeCompare(b.title, "ja");
  });
  const latestColumns = sortedColumns.slice(0, 6);

  const sortedGuides = [...guides].sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
    return a.title.localeCompare(b.title, "ja");
  });
  const latestGuides = sortedGuides.slice(0, 6);

  const sortedHeritage = [...heritage].sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
    const titleA = (a.titleJa ?? a.title ?? "").toString();
    const titleB = (b.titleJa ?? b.title ?? "").toString();
    return titleA.localeCompare(titleB, "ja");
  });
  const latestHeritage = sortedHeritage.slice(0, 4);

  const stats: HeroStats = {
    carsCount: cars.length,
    columnsCount: columns.length,
    guidesCount: guides.length,
    heritageCount: heritage.length,
  };

  const crossTimeline = buildCrossTimeline(columns, guides, heritage);

  return {
    latestCars,
    latestColumns,
    latestGuides,
    latestHeritage,
    crossTimeline,
    stats,
  };
}

export default async function HomePage() {
  const overviewShortcuts = [
    { href: "/cars", label: "CARS", desc: "スペックとコメント", kind: "cars" },
    { href: "/column", label: "COLUMN", desc: "整備・トラブル・考え方", kind: "column" },
    { href: "/guide", label: "GUIDE", desc: "判断材料の整理", kind: "guide" },
    { href: "/heritage", label: "HERITAGE", desc: "名車とブランドの背景", kind: "heritage" },
    { href: "/cars/makers", label: "MAKERS", desc: "メーカー別 車種一覧", kind: "database" },
    { href: "/cars/body-types", label: "BODY TYPES", desc: "ボディタイプ別 車種一覧", kind: "database" },
  ] as const;

  const { latestCars, latestColumns, latestGuides, latestHeritage, crossTimeline, stats } =
    await getHomePageData();

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* ヒーロー（セダン × Tiffany メッシュ） */}
      <HeroSection stats={stats} overviewShortcuts={overviewShortcuts} />

      {/* メインコンテンツ */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <div className="space-y-12 sm:space-y-14">
          {/* START：目的から探す */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-soft-sm sm:p-6">
            <Reveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">START</p>
                  <h2 className="serif-heading mt-1 text-lg font-medium tracking-tight text-slate-900 sm:text-xl">
                    目的から探す
                  </h2>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                    買う・困った・売る/維持。迷ったら「読む順番（固定6本）」から。
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/start">OPEN START</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link
                  href="/guide/hub-usedcar"
                  className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft-sm transition hover:border-tiffany-400 hover:bg-white"
                >
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">BUY</p>
                  <p className="mt-1 font-serif text-[15px] font-semibold text-slate-900">買う</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    候補選び → 総額 → 支払いまでを整理
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    <span className="rounded-full bg-slate-50 px-2 py-0.5">中古車</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5">ローン/支払い</span>
                  </div>
                </Link>

                <Link
                  href="/guide/hub-import-trouble"
                  className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft-sm transition hover:border-tiffany-400 hover:bg-white"
                >
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">TROUBLE</p>
                  <p className="mt-1 font-serif text-[15px] font-semibold text-slate-900">困った</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    警告灯・始動・異音など、症状から切り分け
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    <span className="rounded-full bg-slate-50 px-2 py-0.5">症状別</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5">整備</span>
                  </div>
                </Link>

                <Link
                  href="/guide/hub-sell"
                  className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft-sm transition hover:border-tiffany-400 hover:bg-white"
                >
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">SELL / MAINTAIN</p>
                  <p className="mt-1 font-serif text-[15px] font-semibold text-slate-900">売る/維持</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    準備 → 同条件で比較 → タイミング判断
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    <span className="rounded-full bg-slate-50 px-2 py-0.5">売却</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5">保険</span>
                  </div>
                </Link>
              </div>
            </Reveal>
          </section>

          {/* サイト全体の横断タイムライン */}
          <section className="mt-10 border-t border-slate-200/70 pt-8">
            <Reveal>
              <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
                    CROSS CONTENT TIMELINE
                  </p>
                  <h2 className="serif-heading mt-1 text-lg font-medium tracking-tight text-slate-900 sm:text-xl">
                    サイト全体の「最近の動き」
                  </h2>
                </div>
                <p className="max-w-sm text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                  COLUMN / GUIDE / HERITAGE の更新タイムライン（新着順）
                </p>
              </header>
            </Reveal>

            <Reveal delay={120}>
              {crossTimeline.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-xs text-slate-500">
                  コンテンツ未追加
                  <br />
                  COLUMN / GUIDE / HERITAGE を追加すると表示
                </p>
              ) : (
                <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-soft sm:p-5">
                  <ol className="space-y-3 text-xs">
                    {crossTimeline.map((item) => (
                      <li
                        key={item.id}
                        className="group relative flex items-start gap-3"
                      >
                        <div className="mt-[6px] h-[9px] w-[9px] flex-shrink-0 rounded-full bg-gradient-to-br from-tiffany-400 to-slate-400" />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-slate-600">
                              {item.kind === "column"
                                ? "COLUMN"
                                : item.kind === "guide"
                                ? "GUIDE"
                                : "HERITAGE"}
                            </span>
                            {item.meta && (
                              <span className="text-[10px] text-slate-500">
                                {item.meta}
                              </span>
                            )}
                            {item.dateLabel && (
                              <span className="ml-auto text-[10px] text-slate-400">
                                {item.dateLabel}
                              </span>
                            )}
                          </div>
                          <Link href={item.href}>
                            <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-relaxed text-slate-900 group-hover:text-slate-950">
                              {item.title}
                            </p>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Reveal>
          </section>

          {/* CARS ハイライトセクション */}
          <section className="mt-14 border-t border-slate-200/70 pt-10">
            <Reveal>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
                    HIGHLIGHT
                  </p>
                  <h2 className="serif-heading mt-1 text-lg font-medium tracking-tight text-slate-900 sm:text-xl">
                    最近追加された車種
                  </h2>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/cars">OPEN CARS DATABASE</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {latestCars.map((car) => (
                  <Link
                    key={car.slug}
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                  >
                    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-xs shadow-soft-sm transition hover:border-tiffany-400 hover:bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                            {car.maker}
                          </p>
                          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-slate-900 group-hover:text-slate-950">
                            {car.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-[9px] text-slate-500">
                          {car.releaseYear && (
                            <span>{car.releaseYear}年頃</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                        {car.bodyType && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.bodyType}
                          </span>
                        )}
                        {car.segment && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.segment}
                          </span>
                        )}
                        {car.drive && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.drive}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-3 text-[11px] leading-snug text-slate-600">
                        {car.summary}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>
        </div>
      </section>
    </main>
  );
}
