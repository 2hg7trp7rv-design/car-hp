import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentRowCard } from "@/components/content/ContentRowCard";

import type { CarItem, HeritageItem, HeritageSection } from "@/lib/content-types";
import { getCarsBySlugs } from "@/lib/cars";
import { getGuidesBySlugs } from "@/lib/guides";
import {
  extractHeritageCarSlugs,
  extractHeritageGuideSlugs,
  getAllHeritage,
  getHeritageBySlug,
  getHeritagePreviewText,
  getNextReadHeritageV12,
} from "@/lib/heritage";
import { cn } from "@/lib/utils";

type PageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const all = await getAllHeritage();
  return all.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getHeritageBySlug(params.slug);
  if (!item) return { title: "HERITAGE" };

  const preview = getHeritagePreviewText(item);
  const description = preview || item.summary || "HERITAGE";

  return {
    title: `${item.title} | HERITAGE`,
    description,
    openGraph: {
      title: `${item.title} | HERITAGE`,
      description,
      images: item.heroImage ? [item.heroImage] : undefined,
    },
  };
}

type ContentBlock =
  | { type: "heading"; heading: { level: 3; id: string; text: string } }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "hr" };

type HeritageChapter = {
  id: string;
  title: string;
  summary?: string;
  carSlugs: string[];
  blocks: ContentBlock[];
};

function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-")
    .slice(0, 80);
}

function normalizeKey(t: string): string {
  return t
    .replace(/[【】]/g, "")
    .replace(/[\s\u3000]/g, "")
    .replace(/[：:]/g, "")
    .toLowerCase();
}

function parseHeritageChapters(
  body: string | undefined,
  sections: HeritageSection[] | null | undefined,
): HeritageChapter[] {
  const text = (body ?? "").trim();
  if (!text) return [];

  // 章タイトル照合に使うため、title が確実に存在するセクションだけを対象にする。
  // （null は Domain/Repo で正規化済みだが、欠損はあり得る）
  const meta = (Array.isArray(sections) ? sections : []).filter(
    (s): s is HeritageSection & { title: string } =>
      typeof s?.title === "string" && s.title.trim().length > 0,
  );

  const findMetaByTitle = (title: string): HeritageSection | undefined => {
    const key = normalizeKey(title);
    const exact = meta.find((s) => normalizeKey(s.title) === key);
    if (exact) return exact;
    // ゆるい一致（序章/第◯章表記の揺れ吸収）
    return meta.find((s) => {
      const k = normalizeKey(s.title);
      return k.includes(key) || key.includes(k);
    });
  };

  const lines = text.split(/\r?\n/);

  const chapters: HeritageChapter[] = [];
  let current: HeritageChapter | null = null;

  let paraBuf: string[] = [];
  let listBuf: string[] = [];

  const commitChapter = (chapter: HeritageChapter | null) => {
    if (!chapter) return;
    const hasContent = chapter.blocks.some((b) => b.type !== "hr");
    if (hasContent) chapters.push(chapter);
  };

  const flushParagraph = () => {
    if (!current) return;
    const joined = paraBuf
      .map((l) => l.replace(/\s+$/g, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (joined) current.blocks.push({ type: "paragraph", text: joined });
    paraBuf = [];
  };

  const flushList = () => {
    if (!current) return;
    const items = listBuf.map((s) => s.trim()).filter(Boolean);
    if (items.length) current.blocks.push({ type: "list", items });
    listBuf = [];
  };

  const startChapter = (title: string) => {
    // close prev
    flushParagraph();
    flushList();
    commitChapter(current);

    const m = findMetaByTitle(title);
    const id = (m?.id ? m.id : slugifyId(title)) || `section-${chapters.length + 1}`;

    current = {
      id,
      title,
      summary: m?.summary,
      carSlugs: Array.isArray(m?.carSlugs) ? (m?.carSlugs ?? []) : [],
      blocks: [],
    };
  };

  const ensureChapter = () => {
    if (current) return;
    startChapter("本文");
  };

  const isListLine = (l: string) => {
    const t = l.trim();
    return /^(-\s+|\*\s+|・)/.test(t);
  };

  const stripListMarker = (l: string) => {
    const t = l.trim();
    if (t.startsWith("-")) return t.replace(/^-\s+/, "").trim();
    if (t.startsWith("*")) return t.replace(/^\*\s+/, "").trim();
    if (t.startsWith("・")) return t.replace(/^・\s*/, "").trim();
    return t;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, "");
    const trimmed = line.trim();

    // Chapter heading: 【...】
    const chapterMatch = trimmed.match(/^【(.+?)】$/);
    if (chapterMatch) {
      const title = chapterMatch[1]?.trim();
      if (title) startChapter(title);
      continue;
    }

    ensureChapter();

    // Special heading
    if (trimmed.startsWith("__SPEC_HEADING__")) {
      flushParagraph();
      flushList();
      const t = trimmed.replace("__SPEC_HEADING__", "").trim();
      if (t) {
        current!.blocks.push({
          type: "heading",
          heading: { level: 3, id: `spec-${slugifyId(t)}` || `spec-${Date.now()}`, text: t },
        });
      }
      continue;
    }

    // Sub heading (### ...)
    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      flushParagraph();
      flushList();
      const t = (h3[1] ?? "").trim();
      if (t) {
        current!.blocks.push({
          type: "heading",
          heading: { level: 3, id: `h-${slugifyId(t)}` || `h-${Date.now()}`, text: t },
        });
      }
      continue;
    }

    // Divider
    if (trimmed === "---") {
      flushParagraph();
      flushList();
      current!.blocks.push({ type: "hr" });
      continue;
    }

    // Blank
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // List
    if (isListLine(trimmed)) {
      flushParagraph();
      listBuf.push(stripListMarker(trimmed));
      continue;
    }

    // Paragraph
    flushList();
    paraBuf.push(trimmed);
  }

  // last
  flushParagraph();
  flushList();
  commitChapter(current);

  return chapters;
}

function pickHeroImage(src: string | null | undefined): string {
  const s = (src ?? "").trim();
  if (!s) return "/images/heritage/hero_default.jpg";
  if (s === "/ogp-default.jpg" || s === "/ogp-default.png") return "/images/heritage/hero_default.jpg";
  return s;
}

function pickCarImage(car: CarItem | undefined | null): string | null {
  if (!car) return null;
  return car.heroImage || car.mainImage || null;
}

export default async function HeritageDetailPage({ params }: PageProps) {
  const item = await getHeritageBySlug(params.slug);
  if (!item) notFound();

  const heroImage = pickHeroImage(item.heroImage);

  const chapters = parseHeritageChapters(item.body, item.sections);
  const toc = chapters.map((c) => ({ id: c.id, title: c.title }));

  const carSlugs = extractHeritageCarSlugs(item);
  const relatedCars = carSlugs.length ? await getCarsBySlugs(carSlugs) : [];
  const carBySlug = new Map(relatedCars.map((c) => [c.slug, c] as const));

  const guideSlugs = extractHeritageGuideSlugs(item);
  const relatedGuides = guideSlugs.length ? await getGuidesBySlugs(guideSlugs) : [];

  const relatedHeritage = await getNextReadHeritageV12(item, 2);

  const breadcrumbData = [
    { label: "HOME", href: "/" },
    { label: "HERITAGE", href: "/heritage" },
    { label: item.title },
  ];

  const bgForChapter = (c: HeritageChapter, idx: number): string => {
    for (const s of c.carSlugs) {
      const car = carBySlug.get(s);
      const img = pickCarImage(car);
      if (img) return img;
    }
    // fallback: rotate through available cars
    const rotated = relatedCars[idx % Math.max(1, relatedCars.length)];
    const img = pickCarImage(rotated);
    return img || heroImage;
  };

  return (
    <main>
      {/* Full-page hero */}
      <section className="relative min-h-[92vh] w-full overflow-hidden bg-[#0B0B0B]">
        <Image
          src={heroImage}
          alt={item.heroCaption || item.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/70" />

        <div className="relative z-10">
          <div className="page-shell pt-10 sm:pt-14">
            <Breadcrumb items={breadcrumbData} tone="light" />

            <div className="mt-8 max-w-[860px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] tracking-[0.18em] text-white/75">
                HERITAGE
              </div>

              <h1 className="serif-heading mt-4 text-[32px] leading-[1.15] text-white sm:text-[44px]">
                {item.title}
              </h1>

              {item.summary ? (
                <p className="mt-5 max-w-[48rem] text-[13.5px] leading-[1.9] text-white/85 sm:text-[14.5px]">
                  {item.summary}
                </p>
              ) : null}

              {item.heroCaption ? (
                <p className="mt-6 text-[11px] text-white/55">{item.heroCaption}</p>
              ) : null}
            </div>
          </div>

          <div className="page-shell">
            <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Intro / Highlights + TOC */}
      <section className="page-shell py-12">
        {Array.isArray(item.highlights) && item.highlights.length > 0 ? (
          <div className="rounded-3xl border border-[#222222]/10 bg-white/70 p-7 shadow-soft backdrop-blur">
            <div className="text-[11px] tracking-[0.22em] text-[#222222]/55">HIGHLIGHTS</div>
            <ul className="mt-4 space-y-2">
              {item.highlights.slice(0, 5).map((t, idx) => (
                <li key={idx} className="flex gap-3 text-[13px] leading-[1.85] text-[#222222]/75">
                  <span className="mt-[0.45em] h-[6px] w-[6px] rounded-full bg-[#0ABAB5]" />
                  <span className="flex-1">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {toc.length > 1 ? (
          <div className={cn("mt-10", Array.isArray(item.highlights) && item.highlights.length > 0 ? "" : "mt-0")}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">IN THIS STORY</p>
                <h2 className="serif-heading mt-2 text-[18px]">章立て</h2>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {toc.map((h, idx) => (
                <Link
                  key={h.id}
                  href={`#${h.id}`}
                  className="min-w-[220px] rounded-2xl border border-[#222222]/10 bg-white/60 p-4 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/75"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.2em] text-[#222222]/50">CHAPTER {idx + 1}</span>
                    <span className="text-[10px] tracking-[0.2em] text-[#0ABAB5]">VIEW</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[#222222]/80">{h.title}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Chapters */}
      <div className="space-y-10 pb-6">
        {chapters.map((c, idx) => {
          const alignRight = idx % 2 === 1;
          const bg = bgForChapter(c, idx);

          return (
            <section key={c.id} id={c.id} className="scroll-mt-28">
              <div className="page-shell">
                <div className="relative overflow-hidden rounded-3xl border border-[#222222]/10 shadow-soft">
                  <Image
                    src={bg}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 1100px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/50" />

                  <div className={cn("relative p-8 sm:p-10", alignRight ? "text-right" : "text-left")}>
                    <p className="text-[10px] tracking-[0.22em] text-white/70">CHAPTER {idx + 1}</p>
                    <h2 className="serif-heading mt-3 text-[22px] text-white sm:text-[26px]">{c.title}</h2>

                    {c.summary ? (
                      <p className={cn("mt-4 text-[13px] leading-[1.9] text-white/85", alignRight ? "ml-auto" : "")}
                      >
                        {c.summary}
                      </p>
                    ) : null}

                    <div
                      className={cn(
                        "mt-6 max-w-[48rem] rounded-2xl border border-white/15 bg-white/85 p-6 text-[#222222]/75 backdrop-blur",
                        alignRight ? "ml-auto" : "",
                      )}
                    >
                      <div className="space-y-4">
                        {c.blocks.map((b, bIdx) => {
                          if (b.type === "paragraph") {
                            return (
                              <p key={bIdx} className="text-[13.5px] leading-[1.95]">
                                {b.text}
                              </p>
                            );
                          }
                          if (b.type === "heading") {
                            return (
                              <h3
                                key={bIdx}
                                id={b.heading.id}
                                className="serif-heading scroll-mt-28 text-[16px] text-[#222222]/90"
                              >
                                {b.heading.text}
                              </h3>
                            );
                          }
                          if (b.type === "list") {
                            return (
                              <ul key={bIdx} className="space-y-2">
                                {b.items.map((t, i2) => (
                                  <li key={i2} className="flex gap-3 text-[13.5px] leading-[1.85]">
                                    <span className="mt-[0.55em] h-[6px] w-[6px] rounded-full bg-[#0ABAB5]" />
                                    <span className="flex-1">{t}</span>
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          if (b.type === "hr") {
                            return <div key={bIdx} className="h-px w-full bg-[#222222]/10" />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom navigation */}
      <section className="page-shell py-14">
        {/* Key models (small) */}
        {relatedCars.length > 0 ? (
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">KEY MODELS</p>
                <h2 className="serif-heading mt-2 text-[18px]">登場車</h2>
              </div>
              <Link href="/cars" className="text-[12px] text-[#0ABAB5] hover:underline">
                車種DBへ
              </Link>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {relatedCars.slice(0, 10).map((car) => {
                const img = pickCarImage(car);
                return (
                  <Link
                    key={car.slug}
                    href={`/cars/${car.slug}`}
                    className="flex min-w-[220px] items-center gap-3 rounded-full border border-[#222222]/10 bg-white/70 px-4 py-2 shadow-soft backdrop-blur transition hover:-translate-y-0.5"
                  >
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#222222]/10 bg-[#F4F4F5]">
                      {img ? <Image src={img} alt={car.name} fill className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] text-[#222222]/80">{car.name}</p>
                      {car.brand ? (
                        <p className="truncate text-[11px] text-[#222222]/50">{car.brand}</p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Related guides */}
        {relatedGuides.length > 0 ? (
          <div className={cn("mt-14", relatedCars.length > 0 ? "" : "mt-0")}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">RELATED GUIDE</p>
                <h2 className="serif-heading mt-2 text-[18px]">深掘りする</h2>
              </div>
              <Link href="/guide" className="text-[12px] text-[#0ABAB5] hover:underline">
                GUIDE一覧
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {relatedGuides.slice(0, 3).map((g) => (
                <ContentRowCard
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  title={g.title}
                  excerpt={g.summary}
                  imageSrc={g.heroImage || "/images/guides/hero_default.jpg"}
                  badge={null}
                  date={null}
                  size="md"
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Next story */}
        {relatedHeritage.length > 0 ? (
          <div className={cn("mt-14", relatedCars.length > 0 || relatedGuides.length > 0 ? "" : "mt-0")}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">NEXT STORY</p>
                <h2 className="serif-heading mt-2 text-[18px]">次に読む</h2>
              </div>
              <Link href="/heritage" className="text-[12px] text-[#0ABAB5] hover:underline">
                HERITAGE一覧
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {relatedHeritage.map((h) => (
                <ContentRowCard
                  key={h.slug}
                  href={`/heritage/${h.slug}`}
                  title={h.title}
                  excerpt={getHeritagePreviewText(h) || h.summary}
                  imageSrc={pickHeroImage(h.heroImage)}
                  badge={null}
                  date={null}
                  size="md"
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
