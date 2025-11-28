// app/heritage/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import {
  getAllHeritage,
  getHeritageBySlug,
  getHeritageChainForItem,
  getHeritageNeighbors,
  type HeritageItem,
} from "@/lib/heritage";
import { getCarBySlug, type CarItem } from "@/lib/cars";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

type HeadingBlock = {
  id: string;
  text: string;
  level: 2 | 3;
};

type ContentBlock =
  | { type: "heading"; heading: HeadingBlock }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

// ---- 本文パーサ：Markdown ライクをブロックに分解 ----
function parseBody(body: string): {
  blocks: ContentBlock[];
  headings: HeadingBlock[];
} {
  const lines = body.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  const headings: HeadingBlock[] = [];

  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: "paragraph",
        text: currentParagraph.join(" "),
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({
        type: "list",
        items: [...currentList],
      });
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      const text = line.slice(4).trim();
      const heading: HeadingBlock = {
        id: `h3-${index}`,
        text,
        level: 3,
      };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = line.slice(3).trim();
      const heading: HeadingBlock = {
        id: `h2-${index}`,
        text,
        level: 2,
      };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
      return;
    }

    // 通常行 → 段落に追加
    flushList();
    currentParagraph.push(line);
  });

  flushParagraph();
  flushList();

  return { blocks, headings };
}

// ---- メタデータ / SSG ----
export async function generateStaticParams() {
  const items = await getAllHeritage();
  return items.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const item = await getHeritageBySlug(params.slug);

  if (!item) {
    return {
      title: "HERITAGE が見つかりません | CAR BOUTIQUE",
      description: "指定されたヘリテージ記事が見つかりませんでした。",
    };
  }

  const title = `${item.title} | HERITAGE | CAR BOUTIQUE`;
  const description =
    item.lead ??
    item.subtitle ??
    "ブランドやモデルの系譜を静かに味わうためのヘリテージ記事です。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/heritage/${encodeURIComponent(
        item.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ---- 表示用ユーティリティ ----
function kindLabel(kind: HeritageItem["kind"]): string {
  switch (kind) {
    case "ERA":
      return "ERA";
    case "BRAND":
      return "BRAND HERITAGE";
    case "CAR":
      return "MODEL HERITAGE";
    default:
      return "HERITAGE";
  }
}

function heroToneClass(item: HeritageItem): string {
  switch (item.heroTone) {
    case "obsidian":
      return "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800";
    case "tiffany":
      return "bg-gradient-to-br from-tiffany-600 via-cyan-700 to-slate-900";
    default:
      return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700";
  }
}

function heroGlowLayer(item: HeritageItem): JSX.Element {
  if (item.heroTone === "tiffany") {
    return (
      <>
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,216,208,0.45),_transparent_70%)] blur-3xl" />
        <div className="absolute -right-24 bottom-[-20%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.8),_transparent_70%)] blur-3xl" />
      </>
    );
  }

  if (item.heroTone === "obsidian") {
    return (
      <>
        <div className="absolute -left-20 -top-24 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)] blur-3xl" />
        <div className="absolute -right-32 bottom-[-30%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.24),_transparent_70%)] blur-3xl" />
      </>
    );
  }

  return (
    <>
      <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.4),_transparent_70%)] blur-3xl" />
      <div className="absolute -right-24 bottom-[-28%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.2),_transparent_70%)] blur-3xl" />
    </>
  );
}

function metaLine(item: HeritageItem) {
  const chips: string[] = [];
  if (item.eraLabel) chips.push(item.eraLabel);
  if (item.brandName) chips.push(item.brandName);
  if (item.modelName) chips.push(item.modelName);
  if (item.generationCode) chips.push(item.generationCode);
  if (item.years) chips.push(item.years);
  return chips.join(" · ");
}

export default async function HeritageDetailPage({ params }: PageProps) {
  const item = await getHeritageBySlug(params.slug);
  if (!item) {
    notFound();
  }

  const [chain, neighbors] = await Promise.all([
    getHeritageChainForItem(item),
    getHeritageNeighbors(item),
  ]);

  const { blocks, headings } = parseBody(item.body);

  let linkedCar: CarItem | null = null;
  if (item.carSlug) {
    try {
      linkedCar = await getCarBySlug(item.carSlug);
    } catch {
      linkedCar = null;
    }
  }

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* HERO */}
      <section className="border-b border-slate-200/60 bg-transparent pb-10 pt-24 sm:pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* パンくず */}
          <Reveal>
            <nav
              aria-label="パンくずリスト"
              className="mb-4 text-xs text-slate-500"
            >
              <Link href="/" className="hover:text-slate-800">
                HOME
              </Link>
              <span className="mx-2">/</span>
              <Link href="/heritage" className="hover:text-slate-800">
                HERITAGE
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-400 line-clamp-1 align-middle">
                {item.title}
              </span>
            </nav>
          </Reveal>

          <Reveal delay={60}>
            <div
              className={`relative overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-10 shadow-soft-strong ${heroToneClass(
                item,
              )}`}
            >
              {/* 光のレイヤー */}
              <div className="pointer-events-none absolute inset-0">
                {heroGlowLayer(item)}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)]" />
              </div>

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.26em] text-tiffany-100">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-[1px] w-6 bg-tiffany-200" />
                      HERITAGE
                    </span>
                    <span className="h-[1px] w-6 bg-slate-600/60" />
                    <span className="text-slate-300/80">
                      {kindLabel(item.kind)}
                    </span>
                  </p>

                  <h1 className="serif-heading text-2xl font-medium leading-tight text-white sm:text-3xl lg:text-[2.4rem]">
                    {item.title}
                  </h1>

                  {item.subtitle && (
                    <p className="mt-3 text-[11px] leading-relaxed text-slate-200/85 sm:text-xs">
                      {item.subtitle}
                    </p>
                  )}

                  {metaLine(item) && (
                    <p className="mt-4 text-[10px] tracking-[0.18em] text-slate-300/90">
                      {metaLine(item)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 text-[10px] text-slate-50 md:items-end">
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="rounded-2xl bg-black/20 px-4 py-3 backdrop-blur">
                      <p className="mb-1 text-[9px] font-semibold tracking-[0.22em] text-tiffany-100">
                        KEY HIGHLIGHTS
                      </p>
                      <ul className="space-y-1.5 text-[11px] leading-relaxed text-slate-100">
                        {item.highlights.slice(0, 3).map((h) => (
                          <li key={h} className="flex gap-2">
                            <span className="mt-[6px] block h-[2px] w-4 rounded-full bg-tiffany-300" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-black/25 px-2 py-0.5 text-[9px] tracking-[0.16em] text-slate-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 本文 + サイドバー */}
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-10 sm:px-6 lg:flex-row lg:gap-14 lg:px-8">
        {/* 本文 */}
        <article className="w-full lg:w-[68%]">
          <Reveal>
            <GlassCard className="bg-white/92 px-5 py-6 sm:px-6 sm:py-7">
              {item.lead && (
                <p className="mb-6 text-sm font-medium leading-7 text-slate-700 sm:text-[15px] sm:leading-8">
                  {item.lead}
                </p>
              )}

              {blocks.map((block, index) => {
                if (block.type === "heading") {
                  const Tag = block.heading.level === 2 ? "h2" : "h3";
                  const baseClass =
                    block.heading.level === 2
                      ? "mt-10 mb-4 font-serif text-xl font-medium text-slate-900 sm:text-2xl"
                      : "mt-7 mb-3 text-sm font-semibold tracking-[0.04em] text-slate-800";

                  return (
                    <Reveal
                      key={block.heading.id}
                      delay={index === 0 ? 0 : 60}
                    >
                      <Tag id={block.heading.id} className={baseClass}>
                        {block.heading.text}
                      </Tag>
                    </Reveal>
                  );
                }

                if (block.type === "list") {
                  return (
                    <Reveal key={`list-${index}`} delay={80}>
                      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                        {block.items.map((text) => (
                          <li key={text} className="flex gap-2">
                            <span className="mt-[7px] h-[3px] w-5 rounded-full bg-tiffany-300" />
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  );
                }

                // paragraph
                if (index === 0) {
                  const text = block.text.trim();
                  if (!text) return null;
                  const firstChar = text[0];
                  const rest = text.slice(1);

                  return (
                    <Reveal key={`p-${index}`} delay={100}>
                      <p className="first-letter-float mt-4 text-sm leading-8 text-slate-700 sm:text-[16px] sm:leading-[2rem]">
                        <span className="first-letter-span">{firstChar}</span>
                        {rest}
                      </p>
                    </Reveal>
                  );
                }

                return (
                  <p
                    key={`p-${index}`}
                    className="mt-4 text-sm leading-7 text-slate-700 sm:text-[15px] sm:leading-8"
                  >
                    {block.text}
                  </p>
                );
              })}
            </GlassCard>
          </Reveal>

          {/* PREV / NEXT */}
          {(neighbors.previous || neighbors.next) && (
            <div className="mt-10 space-y-4 border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                LINEAGE NAVIGATION
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {neighbors.previous && (
                  <Link
                    href={`/heritage/${encodeURIComponent(
                      neighbors.previous.slug,
                    )}`}
                  >
                    <GlassCard className="group h-full bg-white/92 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                      <p className="mb-1 text-[9px] font-semibold tracking-[0.24em] text-slate-400">
                        PREVIOUS
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-tiffany-700">
                        {kindLabel(neighbors.previous.kind)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {neighbors.previous.title}
                      </h3>
                      {neighbors.previous.eraLabel && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          {neighbors.previous.eraLabel}
                        </p>
                      )}
                    </GlassCard>
                  </Link>
                )}
                {neighbors.next && (
                  <Link
                    href={`/heritage/${encodeURIComponent(
                      neighbors.next.slug,
                    )}`}
                  >
                    <GlassCard className="group h-full bg-white/92 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                      <p className="mb-1 text-[9px] font-semibold tracking-[0.24em] text-slate-400">
                        NEXT
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-tiffany-700">
                        {kindLabel(neighbors.next.kind)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {neighbors.next.title}
                      </h3>
                      {neighbors.next.eraLabel && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          {neighbors.next.eraLabel}
                        </p>
                      )}
                    </GlassCard>
                  </Link>
                )}
              </div>
            </div>
          )}
        </article>

        {/* サイドバー */}
        <aside className="hidden w-[32%] lg:block">
          <div className="sticky top-28 space-y-5">
            {/* 系譜タイムライン */}
            <GlassCard className="border border-slate-200/80 bg-white/90 p-5 text-[11px] text-slate-600 shadow-sm backdrop-blur">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                LINEAGE
              </p>

              {chain.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  この記事は特定の系譜チェーンに紐づいていません。
                </p>
              ) : (
                <ul className="space-y-2">
                  {chain.map((n) => {
                    const isCurrent = n.id === item.id;
                    return (
                      <li key={n.id}>
                        <Link href={`/heritage/${encodeURIComponent(n.slug)}`}>
                          <div
                            className={[
                              "flex items-start gap-2 rounded-2xl px-2 py-1.5 transition",
                              isCurrent
                                ? "bg-tiffany-50/90 text-slate-900"
                                : "hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <div className="mt-[6px] h-1.5 w-1.5 rounded-full bg-slate-300" />
                            <div className="flex-1">
                              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                                {kindLabel(n.kind)}
                              </p>
                              <p className="line-clamp-2 text-[11px] font-medium leading-relaxed">
                                {n.title}
                              </p>
                              {n.generationCode && (
                                <p className="text-[10px] text-slate-400">
                                  {n.generationCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  href="/heritage"
                  className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs">
                    ←
                  </span>
                  HERITAGE 一覧へ
                </Link>
              </div>
            </GlassCard>

            {/* CARS 詳細へのブリッジ */}
            {linkedCar && (
              <GlassCard className="border border-slate-200/80 bg-white/95 p-5 text-[11px] text-slate-600 shadow-soft">
                <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                  RELATED CAR
                </p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-tiffany-700">
                  {linkedCar.maker}
                </p>
                <h3 className="mt-1 text-[13px] font-semibold leading-relaxed text-slate-900">
                  {linkedCar.name}
                </h3>
                {linkedCar.summary && (
                  <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                    {linkedCar.summary}
                  </p>
                )}

                <Link
                  href={`/cars/${encodeURIComponent(linkedCar.slug)}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-tiffany-400/70 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-tiffany-700 transition hover:bg-tiffany-50"
                >
                  CARS DETAIL を見る
                  <span>→</span>
                </Link>
              </GlassCard>
            )}
          </div>
        </aside>
      </section>

      {/* Drop caps 用スタイル */}
      <style jsx global>{`
        .first-letter-float {
          text-indent: 0;
        }
        .first-letter-span {
          float: left;
          margin-right: 12px;
          margin-top: -6px;
          margin-bottom: -2px;
          font-family: var(--font-bodoni), var(--font-serif), serif;
          font-size: 3.4em;
          line-height: 0.85;
          font-weight: 500;
          color: #0abab5;
        }
      `}</style>
    </main>
  );
}
