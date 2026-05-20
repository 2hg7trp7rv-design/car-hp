import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { HeritageItem } from "@/lib/content-types";
import {
  getAllHeritage,
  getHeritageBySlug,
  getHeritagePreviewText,
} from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";
import { resolveOgImageUrl } from "@/lib/public-assets";
import { isIndexableHeritage } from "@/lib/seo/indexability";
import { INDEX_ROBOTS, NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { pickRelatedSameGroup, tagOverlapScore } from "@/lib/seo/related";
import { resolveHeritageCardImage } from "@/lib/display-tag-media";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeritageCinematicMotion } from "@/components/heritage/HeritageCinematicMotion";

async function getSameCategoryHeritageRelated(item: HeritageItem, limit = 3): Promise<HeritageItem[]> {
  const all = await getAllHeritage();
  return pickRelatedSameGroup(item, all, {
    limit,
    getGroupKey: (entry) => String(entry.displayTag ?? entry.kind ?? ""),
    getFallbackGroupKey: (entry) => String(entry.maker ?? entry.brandName ?? ""),
    getSecondaryScore: (base, entry) =>
      tagOverlapScore(base.tags, entry.tags) + tagOverlapScore(base.intentTags, entry.intentTags),
  });
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

type HeritageGeneration = {
  code: string;
  years: string;
  name: string;
  title: string;
  lead: string;
  body?: string;
  image?: string;
};

type HeritageDnaCard = {
  number: string;
  title: string;
  text: string;
};

type HeritageChapter = {
  id: string;
  kicker: string;
  title: string;
  subtitle?: string;
  body: string[];
  image?: string;
  theme?: "paper" | "dark" | "mist";
  specs?: { label: string; value: string }[];
  stats?: { value: string; unit?: string; label: string; sub?: string }[];
  cards?: HeritageDnaCard[];
  note?: string;
};

type HeritageSpecRow = {
  code: string;
  years: string;
  ps: number;
  engine?: string;
  drivetrain?: string;
  weight?: string;
};

type HeritageGuideCard = {
  badge: string;
  title: string;
  text: string;
  tone?: "black" | "gold" | "paper";
  href?: string;
};

type CinematicHeritage = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  heroImage?: string;
  timelineTitle?: string;
  timelineLead?: string;
  generations?: HeritageGeneration[];
  chapters?: HeritageChapter[];
  specRows?: HeritageSpecRow[];
  specTitle?: string;
  specLead?: string;
  specNote?: string;
  guideCards?: HeritageGuideCard[];
  guideLabel?: string;
  guideTitle?: string;
  guideLead?: string;
  closing?: string[];
  showChronicleLead?: boolean;
  showChronicleGenerations?: boolean;
  showFinalNav?: boolean;
  showRelated?: boolean;
};

const FALLBACK_HERO = "/images/cbj/car-nissan-z-rz34-hero.jpg";
const FALLBACK_PAPER = "/images/cbj/heritage-hero.jpg";

export async function generateStaticParams() {
  const all = await getAllHeritage();
  return all.map((h) => ({ slug: h.slug }));
}

function pickHeroImage(item: HeritageItem): string {
  const custom = getCinematicHeritage(item).heroImage;
  return (
    custom ||
    resolveHeritageCardImage(item) ||
    item.heroImage ||
    (item as any).ogImageUrl ||
    FALLBACK_HERO
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getHeritageBySlug(slug);
  if (!item) {
    return {
      title: "系譜",
      description: "歴史・技術・背景を深掘りする読み物。",
      robots: NOINDEX_ROBOTS,
    };
  }

  const cinematic = getCinematicHeritage(item);
  const preview = getHeritagePreviewText(item);
  const description =
    cinematic.subtitle ||
    preview ||
    item.summary ||
    "歴史・技術・背景を深掘りする読み物。";
  const canonical = `${getSiteUrl()}/heritage/${encodeURIComponent(item.slug)}`;
  const image = resolveOgImageUrl((item as any).ogImageUrl || pickHeroImage(item), getSiteUrl());

  return {
    title: item.seoTitle || item.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: item.seoTitle || item.title,
      description,
      url: canonical,
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: item.seoTitle || item.title,
      description,
      images: [image],
    },
    robots: isIndexableHeritage(item) ? INDEX_ROBOTS : NOINDEX_ROBOTS,
  };
}

function getCinematicHeritage(item: HeritageItem): CinematicHeritage {
  const custom = (item as any).cinematicHeritage;
  if (custom && typeof custom === "object") return custom as CinematicHeritage;

  const sections = parseFallbackSections(item.body || "");
  const timelineSections = sections.slice(0, 6);
  const chapterSections = sections.slice(6);

  return {
    eyebrow: "HERITAGE / 系譜",
    title: item.heroTitle || item.title,
    subtitle:
      item.subtitle ||
      item.lead ||
      item.summary ||
      "歴史と技術の流れを、ひとつの系譜として読む。",
    heroImage:
      resolveHeritageCardImage(item) || item.heroImage || FALLBACK_PAPER,
    timelineTitle: item.title,
    timelineLead:
      item.summary ||
      item.lead ||
      "時代の変化を追いながら、その車が何を残したのかを読む。",
    generations: timelineSections.map((section, index) => ({
      code: String(index + 1).padStart(2, "0"),
      years: item.years || "",
      name: section.title,
      title: section.title,
      lead: section.body[0] || item.summary || "",
      body: section.body.slice(1).join(""),
      image: resolveHeritageCardImage(item) || item.heroImage || FALLBACK_PAPER,
    })),
    chapters: chapterSections.map((section, index) => ({
      id: section.id,
      kicker: `Turning Point ${String(index + 1).padStart(2, "0")}`,
      title: section.title,
      body: section.body,
      image:
        index % 2 === 0
          ? resolveHeritageCardImage(item) || item.heroImage || FALLBACK_PAPER
          : undefined,
      theme: index % 3 === 1 ? "dark" : "paper",
    })),
    closing: [item.title, "次の物語へ。"],
  };
}

function parseFallbackSections(
  body: string,
): { id: string; title: string; body: string[] }[] {
  const lines = body.split(/\r?\n/);
  const out: { id: string; title: string; body: string[] }[] = [];
  let current: { id: string; title: string; body: string[] } | null = null;
  let skipProductionSection = false;
  let acceptedHeadingSeen = false;

  const hiddenProductionTitles = new Set(["hero", "timeline"]);

  const pushCurrent = () => {
    if (current && current.body.length > 0) out.push(current);
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      pushCurrent();
      current = null;
      const level = heading[1]?.length ?? 0;
      const title = heading[2]?.trim() || "本文";
      const normalizedTitle = title.toLowerCase();

      // H1 は記事タイトルとして扱い、本文セクションにはしない。
      // Hero / Timeline は制作上の構造名なので、本文として露出させない。
      skipProductionSection = level === 1 || hiddenProductionTitles.has(normalizedTitle);
      if (skipProductionSection) continue;

      acceptedHeadingSeen = true;
      current = { id: slugify(title), title, body: [] };
      continue;
    }
    if (skipProductionSection) continue;
    if (!current) {
      if (!acceptedHeadingSeen) continue;
      current = { id: "story", title: "Story", body: [] };
    }
    const cleaned = line
      .replace(/^[-*・]\s*/, "")
      .replace(/^>\s*/, "")
      .trim();
    if (cleaned) current.body.push(cleaned);
  }
  pushCurrent();
  return out.length ? out : [{ id: "story", title: "Story", body: [body] }];
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "section"
  );
}

function splitSentences(text: string): string[] {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/(?<=。)|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function Paragraphs({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={["cbj-heritage-paragraphs", className]
        .filter(Boolean)
        .join(" ")}
    >
      {items.flatMap((text, index) =>
        splitSentences(text).map((sentence, subIndex) => (
          <p key={`${index}-${subIndex}`}>{sentence}</p>
        )),
      )}
    </div>
  );
}

function FilmImage({
  src,
  alt,
  className = "",
  metaLeft,
  metaRight,
}: {
  src?: string;
  alt: string;
  className?: string;
  metaLeft?: string;
  metaRight?: string;
}) {
  const resolved = src || FALLBACK_PAPER;
  return (
    <div className={["cbj-heritage-film", className].filter(Boolean).join(" ")}>
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes="(max-width: 768px) 88vw, 760px"
        className="object-cover"
      />
      {metaLeft ? (
        <span className="cbj-heritage-film-meta cbj-heritage-film-meta-left">
          {metaLeft}
        </span>
      ) : null}
      {metaRight ? (
        <span className="cbj-heritage-film-meta cbj-heritage-film-meta-right">
          {metaRight}
        </span>
      ) : null}
    </div>
  );
}


function fitHeritageTitleStyle(text?: string | null): CSSProperties {
  const count = Math.max(4, Array.from(String(text ?? "").replace(/\s+/g, "").trim()).length);
  const vw = Math.min(13.8, Math.max(3.2, 124 / count));
  return { "--cbj-title-vw": `${vw.toFixed(3)}vw` } as CSSProperties;
}

function ChapterVisual({
  chapter,
  imageSrc,
  index,
}: {
  chapter: HeritageChapter;
  imageSrc: string;
  index: number;
}) {
  return (
    <div className="cbj-heritage-chapter-visual" data-heritage-reveal>
      <Image
        src={imageSrc}
        alt={`${chapter.title}の章ビジュアル`}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="cbj-heritage-chapter-visual-shade" aria-hidden="true" />
      <div className="cbj-heritage-chapter-visual-copy">
        <SectionLabel
          label={
            chapter.kicker ||
            `Turning Point ${String(index + 1).padStart(2, "0")}`
          }
        />
        <h2 style={fitHeritageTitleStyle(chapter.title)}>{chapter.title}</h2>
        {chapter.subtitle ? <p>{chapter.subtitle}</p> : null}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="cbj-heritage-label">
      <span aria-hidden="true" />
      {label}
    </p>
  );
}

function PowerBars({ rows }: { rows: HeritageSpecRow[] }) {
  const maxPower = Math.max(...rows.map((row) => row.ps), 1);

  return (
    <div className="cbj-heritage-bars" aria-label="世代別最高出力の推移">
      {rows.map((row) => {
        const width = Math.max(12, Math.round((row.ps / maxPower) * 100));
        return (
          <div
            key={`${row.code}-bar`}
            className="cbj-heritage-bar-row"
            style={{ "--bar": `${width}%` } as CSSProperties}
          >
            <span>{row.code}</span>
            <em>{row.years}</em>
            <i aria-hidden="true" />
            <strong>
              {row.ps}
              <small>ps</small>
            </strong>
          </div>
        );
      })}
      <div className="cbj-heritage-bar-scale" aria-hidden="true">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
      </div>
    </div>
  );
}

function DnaCards({ chapter }: { chapter: HeritageChapter }) {
  const fallbackCards: HeritageDnaCard[] = chapter.body
    .slice(1, 5)
    .map((text, index) => ({
      number: String(index + 1).padStart(2, "0"),
      title:
        [
          "ロングノーズ・ショートデッキ",
          "水平基調の美しさ",
          "時代性の継承",
          "機能美としてのZ",
        ][index] || chapter.title,
      text,
    }));
  const cards =
    chapter.cards && chapter.cards.length > 0 ? chapter.cards : fallbackCards;

  return (
    <div className="cbj-heritage-dna-cards">
      {cards.map((card) => (
        <article
          key={`${chapter.id}-${card.number}`}
          className="cbj-heritage-dna-card"
        >
          <span>{card.number}</span>
          <h3>{card.title}</h3>
          <Paragraphs items={[card.text]} />
        </article>
      ))}
    </div>
  );
}


function HeroFilmDeck({
  generations,
  fallbackImage,
}: {
  generations: HeritageGeneration[];
  fallbackImage: string;
}) {
  const deck = (generations.length ? generations : [])
    .slice(0, 6)
    .map((gen, index) => ({
      ...gen,
      image: gen.image || fallbackImage,
      year: gen.years.split("-")[0] || gen.years || String(index + 1),
    }));

  if (deck.length === 0) {
    return (
      <div className="cbj-heritage-hero-card is-active" data-hero-card>
        <FilmImage src={fallbackImage} alt="HERITAGE記事のヒーロービジュアル" />
      </div>
    );
  }

  return (
    <>
      {deck.map((gen, index) => (
        <div
          key={`${gen.code}-${gen.year}-hero`}
          className={["cbj-heritage-hero-card", index === 0 ? "is-active" : ""]
            .filter(Boolean)
            .join(" ")}
          data-hero-card
          data-index={index}
        >
          <FilmImage
            src={gen.image}
            alt={gen.name}
            metaLeft={gen.code}
            metaRight={gen.year}
          />
        </div>
      ))}
    </>
  );
}

export default async function HeritageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getHeritageBySlug(slug);
  if (!item) notFound();

  const cinematic = getCinematicHeritage(item);
  const relatedHeritage = await getSameCategoryHeritageRelated(item, 3);
  const generations = cinematic.generations || [];
  const chapters = cinematic.chapters || [];
  const heroImage = pickHeroImage(item);
  const heritageUrl = `${getSiteUrl()}/heritage/${encodeURIComponent(item.slug)}`;
  const heroImageUrl = heroImage.startsWith("http") ? heroImage : `${getSiteUrl()}${heroImage}`;
  const jsonDescription = cinematic.subtitle || getHeritagePreviewText(item) || item.summary || item.lead || "";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${getSiteUrl()}/` },
      { "@type": "ListItem", position: 2, name: "系譜", item: `${getSiteUrl()}/heritage` },
      { "@type": "ListItem", position: 3, name: item.title, item: heritageUrl },
    ],
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.seoTitle || item.title,
    description: jsonDescription,
    url: heritageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": heritageUrl },
    image: [heroImageUrl],
    datePublished: item.publishedAt || item.createdAt,
    dateModified: item.updatedAt || item.publishedAt || item.createdAt,
    inLanguage: "ja",
    author: { "@type": "Organization", name: "CAR BOUTIQUE JOURNAL" },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: getSiteUrl(),
      logo: { "@type": "ImageObject", url: `${getSiteUrl()}/icon-512x512.png` },
    },
  };
  const showChronicleLead = cinematic.showChronicleLead !== false;
  const showChronicleGenerations = cinematic.showChronicleGenerations !== false;

  return (
    <main className="cbj-heritage-page">
      <HeritageCinematicMotion />
      <JsonLd id={`ld-breadcrumb-heritage-${item.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`ld-heritage-${item.slug}`} data={articleJsonLd} />
      <section className="cbj-heritage-hero" aria-labelledby="heritage-title">
        <div className="cbj-heritage-hero-bg">
          <Image
            src={heroImage}
            alt={`${item.title}のヒーロービジュアル` }
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="cbj-heritage-hero-grain" aria-hidden="true" />
        <div className="cbj-heritage-hero-inner">
          <Breadcrumb
            tone="light"
            className="mb-6"
            items={[
              { label: "ホーム", href: "/" },
              { label: "系譜", href: "/heritage" },
              { label: item.title },
            ]}
          />
          <div className="cbj-heritage-hero-copy">
            <SectionLabel label={cinematic.eyebrow || "HERITAGE / 系譜"} />
            <h1 id="heritage-title" style={fitHeritageTitleStyle(cinematic.title || item.title)}>{cinematic.title || item.title}</h1>
            {cinematic.subtitle ? <p>{cinematic.subtitle}</p> : null}
          </div>

          <div className="cbj-heritage-hero-stage" data-heritage-hero-stage>
            <HeroFilmDeck generations={generations} fallbackImage={heroImage} />
          </div>

          {generations.length > 0 ? (
            <nav
              className="cbj-heritage-hero-years"
              aria-label="世代ナビゲーション"
            >
              <span className="cbj-heritage-hero-progress" aria-hidden="true"><i /></span>
              {generations.map((gen, index) => (
                <a
                  key={gen.code}
                  href={`#generation-${slugify(gen.code)}`}
                  className={index === 0 ? "is-active" : undefined}
                >
                  <strong>{gen.years.split("-")[0] || gen.years}</strong>
                  <span>{gen.code}</span>
                </a>
              ))}
            </nav>
          ) : null}

          <div className="cbj-heritage-scroll" aria-hidden="true">
            <span>SCROLL</span>
            <i />
          </div>
        </div>
      </section>

      <section
        className="cbj-heritage-paper cbj-heritage-timeline"
        aria-labelledby="timeline-title"
      >
        <div className="cbj-heritage-container">
          <div className="sr-only">
            <h2 id="timeline-title">{cinematic.timelineTitle || "系譜"}</h2>
            {showChronicleLead && cinematic.timelineLead ? <p>{cinematic.timelineLead}</p> : null}
          </div>

          <div className="cbj-heritage-chronicle" data-heritage-reveal>
            <SectionLabel label="CHRONICLE" />
            <h2>{cinematic.timelineTitle || "6世代、53年の系譜"}</h2>
            {showChronicleLead && cinematic.timelineLead ? <p>{cinematic.timelineLead}</p> : null}
          </div>

          {showChronicleGenerations && generations.length > 0 ? (
            <div className="cbj-heritage-generations">
              {generations.map((gen, index) => (
                <article
                  key={`${gen.code}-${gen.name}`}
                  id={`generation-${slugify(gen.code)}`}
                  className={[
                    "cbj-heritage-generation",
                    index % 2 === 1 ? "is-reverse" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-heritage-reveal
                >
                  <div className="cbj-heritage-generation-grid">
                    <div className="cbj-heritage-generation-copy">
                      <div className="cbj-heritage-generation-head">
                        <span>{gen.code}</span>
                        <i />
                        <em>{gen.years}</em>
                      </div>
                      <h3>{gen.name}</h3>
                      <p className="cbj-heritage-generation-title">
                        {gen.title}
                      </p>
                      <Paragraphs
                        items={[gen.lead, gen.body || ""].filter(Boolean)}
                      />
                    </div>
                    <div className="cbj-heritage-generation-media">
                      <FilmImage
                        src={
                          gen.image ||
                          (index % 2 === 0 ? heroImage : FALLBACK_PAPER)
                        }
                        alt={gen.name}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {chapters.map((chapter, index) => {
        const dark = chapter.theme === "dark";
        const dna = chapter.theme === "mist" || chapter.cards;

        if (dna) {
          return (
            <section
              key={chapter.id}
              id={chapter.id}
              className="cbj-heritage-chapter cbj-heritage-dna-section"
              data-heritage-reveal
            >
              <ChapterVisual chapter={chapter} imageSrc={chapter.image || heroImage} index={index} />
              <div className="cbj-heritage-container">
                <div className="cbj-heritage-dna-head">
                  {chapter.body[0] ? (
                    <Paragraphs items={[chapter.body[0]]} />
                  ) : null}
                </div>
                <DnaCards chapter={chapter} />
              </div>
            </section>
          );
        }

        return (
          <section
            key={chapter.id}
            id={chapter.id}
            className={[
              "cbj-heritage-chapter",
              dark ? "is-dark" : "is-paper",
              index === 0 ? "is-turning-point" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-heritage-reveal
          >
            {dark ? (
              <div className="cbj-heritage-dark-bg" aria-hidden="true">
                <Image
                  src={chapter.image || heroImage}
                  alt={`${chapter.title}の背景ビジュアル`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <ChapterVisual chapter={chapter} imageSrc={chapter.image || heroImage} index={index} />

            <div className="cbj-heritage-container">
              <div
                className={
                  dark ? "cbj-heritage-dark-copy" : "cbj-heritage-chapter-copy"
                }
              >
                <Paragraphs items={chapter.body} />

                {chapter.specs && chapter.specs.length > 0 ? (
                  <dl className="cbj-heritage-spec-list">
                    {chapter.specs.map((spec) => (
                      <div key={`${chapter.id}-${spec.label}`}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {chapter.stats && chapter.stats.length > 0 ? (
                  <div className="cbj-heritage-stats">
                    {chapter.stats.map((stat) => (
                      <div key={`${chapter.id}-${stat.label}`}>
                        <strong>
                          {stat.value}
                          {stat.unit ? <small>{stat.unit}</small> : null}
                        </strong>
                        <span>{stat.label}</span>
                        {stat.sub ? <em>{stat.sub}</em> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {chapter.note ? (
                  <p className="cbj-heritage-note">{chapter.note}</p>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}

      {cinematic.specRows && cinematic.specRows.length > 0 ? (
        <section
          className="cbj-heritage-paper cbj-heritage-data"
          aria-labelledby="spec-title"
          data-heritage-reveal
        >
          <div className="cbj-heritage-container">
            <SectionLabel label="DATA" />
            <h2 id="spec-title">{cinematic.specTitle || "世代別スペック比較"}</h2>
            {cinematic.specLead ? (
              <p className="cbj-heritage-lead">{cinematic.specLead}</p>
            ) : null}
            <PowerBars rows={cinematic.specRows} />
            {cinematic.specNote ? (
              <p className="cbj-heritage-data-note">{cinematic.specNote}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {cinematic.guideCards && cinematic.guideCards.length > 0 ? (
        <section
          className="cbj-heritage-guide"
          aria-labelledby="guide-title"
          data-heritage-reveal
        >
          <div className="cbj-heritage-container">
            <SectionLabel label={cinematic.guideLabel || "USED GUIDE"} />
            <h2 id="guide-title">{cinematic.guideTitle || "中古車の見極めポイント"}</h2>
            {cinematic.guideLead ? (
              <p className="cbj-heritage-lead">{cinematic.guideLead}</p>
            ) : null}
            <div className="cbj-heritage-guide-grid">
              {cinematic.guideCards.map((card, index) => {
                const content = (
                  <>
                    <header>
                      <strong className={`is-${card.tone || "paper"}`}>
                        {card.badge}
                      </strong>
                      <i aria-hidden="true" />
                    </header>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </>
                );

                return card.href ? (
                  <Link
                    key={`${card.title}-${index}`}
                    href={card.href}
                    className="cbj-heritage-guide-card"
                  >
                    {content}
                  </Link>
                ) : (
                  <article
                    key={`${card.title}-${index}`}
                    className="cbj-heritage-guide-card"
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section
        className="cbj-heritage-closing"
        aria-label="結び"
        data-heritage-reveal
      >
        <div className="cbj-heritage-container">
          {(cinematic.closing || ["CAR BOUTIQUE JOURNAL"]).map(
            (line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ),
          )}
          {cinematic.showFinalNav !== false ? (
            <div className="cbj-heritage-final-nav">
              <Link href="/heritage">系譜一覧</Link>
              {showChronicleGenerations
                ? generations.slice(0, 6).map((gen) => (
                    <a key={gen.code} href={`#generation-${slugify(gen.code)}`}>
                      {gen.code}
                    </a>
                  ))
                : chapters.slice(0, 6).map((chapter) => (
                    <a key={chapter.id} href={`#${chapter.id}`}>
                      {chapter.kicker?.replace(/\s*\/\s*\d+$/i, "") || "章"}
                    </a>
                  ))}
            </div>
          ) : null}
        </div>
      </section>

      {cinematic.showRelated !== false && relatedHeritage.length > 0 ? (
        <section className="cbj-heritage-related" aria-label="次に読む">
          <div className="cbj-heritage-container">
            <SectionLabel label="関連記事3選" />
            <div className="cbj-heritage-related-grid">
              {relatedHeritage.map((related) => (
                <Link key={related.slug} href={`/heritage/${related.slug}`}>
                  <span>{related.eraLabel || "HERITAGE"}</span>
                  <strong>{related.title}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
