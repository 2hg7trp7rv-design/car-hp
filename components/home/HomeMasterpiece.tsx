// components/home/HomeMasterpiece.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import {
  type EditorialVariant,
  hasRealEditorialImage,
  resolveEditorialImage,
} from "@/lib/editorial-media";
import { EDITORIAL_ASSETS } from "@/lib/editorial-assets";

type 新着Item = {
  href: string;
  title: string;
  meta?: string;
  description?: string;
  imageSrc?: string | null;
  category: string;
};

type Tone = "moss" | "clay" | "slate" | "taupe";

type ThemeLane = {
  href: string;
  label: string;
  title: string;
  description?: string;
  imageSrc: string;
  tone: Tone;
};

const TONE_STYLES: Record<
  Tone,
  {
    eyebrow: string;
    chip: string;
    wash: string;
    border: string;
  }
> = {
  moss: {
    eyebrow: "text-[#7A876C]",
    chip: "border-[#cfd8c7] bg-[#E4EBE0] text-[#5E6A52]",
    wash: "bg-[#E4EBE0]",
    border: "border-[#cfd8c7]",
  },
  clay: {
    eyebrow: "text-[#C07C59]",
    chip: "border-[#e1c5b5] bg-[#F1E2D8] text-[#9e6346]",
    wash: "bg-[#F1E2D8]",
    border: "border-[#e1c5b5]",
  },
  slate: {
    eyebrow: "text-[#8798A6]",
    chip: "border-[#ced8df] bg-[#E5EBEF] text-[#697b88]",
    wash: "bg-[#E5EBEF]",
    border: "border-[#ced8df]",
  },
  taupe: {
    eyebrow: "text-[#8D7E72]",
    chip: "border-[#ddd2c8] bg-[#EEE7DE] text-[#6B655D]",
    wash: "bg-[#EEE7DE]",
    border: "border-[#ddd2c8]",
  },
};

const STORY_LABEL: Record<EditorialVariant, string> = {
  guide: "実用",
  column: "考察",
  car: "車種",
  heritage: "系譜",
  generic: "記事",
};

const STORY_NOTE: Record<EditorialVariant, string> = {
  guide: "答えから見る",
  column: "角度を変える",
  car: "車種を見る",
  heritage: "系譜を見る",
  generic: "記事を見る",
};

const STORY_SURFACE: Record<EditorialVariant, string> = {
  guide:
    "border-[rgba(122,135,108,0.18)] bg-[rgba(228,235,224,0.86)] text-[#5E6A52]",
  column:
    "border-[rgba(192,124,89,0.16)] bg-[rgba(241,226,216,0.9)] text-[#8E5A3F]",
  car:
    "border-[rgba(135,152,166,0.16)] bg-[rgba(229,235,239,0.9)] text-[#637786]",
  heritage:
    "border-[rgba(141,126,114,0.16)] bg-[rgba(238,231,222,0.92)] text-[#6B655D]",
  generic:
    "border-[rgba(141,126,114,0.16)] bg-[rgba(248,244,238,0.94)] text-[var(--text-secondary)]",
};

const THEME_LANES: ThemeLane[] = [
  {
    href: "/guide/maintenance",
    label: "GUIDE",
    title: "整備",
    description: "",
    imageSrc: EDITORIAL_ASSETS.guideHero,
    tone: "moss",
  },
  {
    href: "/guide/hub-import-trouble",
    label: "GUIDE",
    title: "故障",
    description: "",
    imageSrc: EDITORIAL_ASSETS.columnHero,
    tone: "clay",
  },
  {
    href: "/heritage",
    label: "HERITAGE",
    title: "系譜",
    description: "",
    imageSrc: EDITORIAL_ASSETS.heritageHero,
    tone: "taupe",
  },
  {
    href: "/column",
    label: "COLUMN",
    title: "考察",
    description: "",
    imageSrc: EDITORIAL_ASSETS.homeHero,
    tone: "slate",
  },
];

const DIRECTORY_LINKS = [
  { href: "/cars/makers", label: "メーカー別" },
  { href: "/cars/body-types", label: "ボディタイプ別" },
  { href: "/cars/segments", label: "価格帯別" },
] as const;

const THEME_LANE_LAYOUTS = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-4"] as const;

function uniqueItems(items: Array<新着Item | null | undefined>): 新着Item[] {
  const seen = new Set<string>();
  const out: 新着Item[] = [];

  for (const item of items) {
    if (!item?.href) continue;
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }

  return out;
}

function storyVariant(item?: 新着Item | null): EditorialVariant {
  const category = item?.category ?? "";
  if (category.includes("買い方") || category.includes("維持費")) return "guide";
  if (category.includes("視点")) return "column";
  if (category.includes("歴史") || category.includes("系譜")) return "heritage";
  if (category.includes("車種")) return "car";
  return "generic";
}

function hasImage(item?: 新着Item | null): item is 新着Item {
  return hasRealEditorialImage(item?.imageSrc);
}

function resolveStoryImage(
  item?: 新着Item | null,
  viewport: "desktop" | "card" = "card",
): { src: string; variant: EditorialVariant } {
  const variant = storyVariant(item);
  const resolved = resolveEditorialImage(item?.imageSrc ?? null, variant, viewport, item?.href ?? item?.title ?? variant);
  return {
    src: resolved.src,
    variant,
  };
}

function buildUsedSet(items: Array<新着Item | null | undefined>) {
  const used = new Set<string>();

  for (const item of items) {
    if (item?.href) used.add(item.href);
  }

  return used;
}

function excludeItems(items: 新着Item[], used: Set<string>, limit?: number) {
  const filtered = items.filter((item) => !used.has(item.href));
  if (typeof limit === "number") return filtered.slice(0, limit);
  return filtered;
}

function itemDescription(item?: 新着Item | null, fallback = "記事の概要") {
  const text = item?.description?.trim() || item?.meta?.trim() || "";
  if (text) return text;
  return fallback;
}

function StoryPlaceholder({
  variant,
  size = "card",
}: {
  variant: EditorialVariant;
  size?: "hero" | "lead" | "card" | "thumb";
}) {
  const heading =
    size === "hero"
      ? "記事を見る"
      : size === "thumb"
        ? "記事へ"
        : "入口";

  const headingClass =
    size === "hero"
      ? "max-w-[15ch] text-[28px] sm:text-[34px]"
      : size === "lead"
        ? "max-w-[18ch] text-[20px]"
        : size === "thumb"
          ? "max-w-[10ch] text-[12px]"
          : "max-w-[16ch] text-[18px]";

  const noteClass =
    size === "hero"
      ? "max-w-[24ch] text-[14px]"
      : size === "thumb"
        ? "max-w-[12ch] text-[10px]"
        : "max-w-[22ch] text-[12px]";

  return (
    <div
      className={[
        "flex h-full w-full flex-col justify-between border p-4 sm:p-5",
        STORY_SURFACE[variant],
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold tracking-[0.22em]">{STORY_LABEL[variant]}</span>
        <span className="text-[10px] tracking-[0.16em] opacity-72">イメージ</span>
      </div>

      <div className="space-y-3">
        <p className={["font-semibold leading-[1.45] tracking-[-0.04em]", headingClass].join(" ")}>
          {heading}
        </p>
        <p className={["leading-[1.85] opacity-84", noteClass].join(" ")}>
          {STORY_NOTE[variant]}
        </p>
      </div>
    </div>
  );
}

function StoryArrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5 10h10m-4-4 4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}


function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-8 max-w-[42rem] sm:mb-10">
      <div className="text-[10px] font-semibold tracking-[0.28em] text-[var(--accent-base)] uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-[31px] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[38px] lg:text-[46px]">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-[15px] leading-[1.9] text-[var(--text-secondary)] sm:text-[16px]">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

function StoryMeta({
  category,
  meta,
  tone = "moss",
}: {
  category: string;
  meta?: string;
  tone?: Tone;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={[
          "inline-flex rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.02em]",
          styles.chip,
        ].join(" ")}
      >
        {category}
      </span>
      {meta ? (
        <span className="text-[12px] text-[var(--text-tertiary)]">{meta}</span>
      ) : null}
    </div>
  );
}

function LeadStoryCard({
  item,
  tone = "moss",
  imageFallback,
  className = "",
}: {
  item: 新着Item;
  tone?: Tone;
  imageFallback?: string;
  className?: string;
}) {
  void imageFallback;
  const visual = resolveStoryImage(item, "card");

  return (
    <Link
      href={item.href}
      className={[
        "group block overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-[var(--surface-1)] transition-colors duration-150 hover:border-[rgba(122,135,108,0.34)]",
        className,
      ].join(" ")}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-2)]">
        {visual.src ? (
          <Image
            src={visual.src}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <StoryPlaceholder variant={visual.variant} size="lead" />
        )}
      </div>
      <div className="p-5 sm:p-6 lg:p-7">
        <StoryMeta category={item.category} meta={item.meta} tone={tone} />
        <h3 className="mt-4 text-[26px] font-semibold leading-[1.18] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[30px]">
          {item.title}
        </h3>
        <p className="mt-4 text-[15px] leading-[1.9] text-[var(--text-secondary)]">
          {itemDescription(item)}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-primary)]">
          記事へ
          <StoryArrow />
        </div>
      </div>
    </Link>
  );
}

function TextStoryCard({
  item,
  tone = "taupe",
  className = "",
}: {
  item: 新着Item;
  tone?: Tone;
  className?: string;
}) {
  const visual = resolveStoryImage(item, "card");

  return (
    <Link
      href={item.href}
      className={[
        "group block overflow-hidden rounded-[26px] border border-[var(--border-default)] bg-[var(--surface-1)] transition-colors duration-150 hover:border-[rgba(122,135,108,0.34)]",
        className,
      ].join(" ")}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
        {visual.src ? (
          <Image
            src={visual.src}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <StoryPlaceholder variant={visual.variant} />
        )}
      </div>

      <div className="p-5">
        <StoryMeta category={item.category} meta={item.meta} tone={tone} />

        <h3 className="mt-4 text-[22px] font-semibold leading-[1.25] tracking-[-0.035em] text-[var(--text-primary)]">
          {item.title}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.85] text-[var(--text-secondary)]">
          {itemDescription(item, "記事の概要")}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--text-tertiary)] transition-colors duration-150 group-hover:text-[var(--text-primary)]">
          記事へ
          <StoryArrow />
        </div>
      </div>
    </Link>
  );
}

function ThemeLaneCard({
  lane,
  className = "",
}: {
  lane: ThemeLane;
  className?: string;
}) {
  const styles = TONE_STYLES[lane.tone];

  return (
    <Link
      href={lane.href}
      className={[
        "group block overflow-hidden rounded-[28px] border bg-[var(--surface-1)] transition-colors duration-150",
        styles.border,
        className,
      ].join(" ")}
    >
      <div className="grid h-full">
        <div className={["relative aspect-[16/10] overflow-hidden", styles.wash].join(" ")}>
          <Image
            src={lane.imageSrc}
            alt={lane.title}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="p-5 sm:p-6">
          <div className={["text-[10px] font-semibold tracking-[0.24em] uppercase", styles.eyebrow].join(" ")}>
            {lane.label}
          </div>
          <h3 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
            {lane.title}
          </h3>
          {lane.description ? (
            <p className="mt-3 text-[14px] leading-[1.85] text-[var(--text-secondary)]">
              {lane.description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function DirectoryCard() {
  return (
    <div className="rounded-[30px] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 sm:p-8">
      <div className="text-[10px] font-semibold tracking-[0.26em] text-[var(--accent-slate)] uppercase">
        BROWSE
      </div>
      <h3 className="mt-4 text-[29px] font-semibold leading-[1.14] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
        車種を探す
      </h3>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {DIRECTORY_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-full border border-[var(--border-default)] px-4 py-3 text-[14px] text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
          >
            <span>{item.label}</span>
            <span className="text-[var(--text-tertiary)] transition-transform duration-150 group-hover:translate-x-0.5">
              <StoryArrow />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-7">
        <Button asChild size="lg" variant="primary">
          <Link href="/cars">車種一覧</Link>
        </Button>
      </div>
    </div>
  );
}

function CarShelfCard({ item }: { item: 新着Item }) {
  const visual = resolveStoryImage(item, "card");

  return (
    <Link
      href={item.href}
      className="group block overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[var(--surface-1)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
        {visual.src ? (
          <Image
            src={visual.src}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <StoryPlaceholder variant={visual.variant} size="thumb" />
        )}
      </div>
      <div className="p-4">
        <div className="text-[11px] text-[var(--text-tertiary)]">{item.meta || item.category}</div>
        <div className="mt-2 text-[18px] font-medium leading-[1.35] tracking-[-0.03em] text-[var(--text-primary)]">
          {item.title}
        </div>
      </div>
    </Link>
  );
}

export function HomeMasterpiece(props: {
  latestCars: 新着Item[];
  latestHeritage: 新着Item[];
  latestGuides: 新着Item[];
  latestColumns: 新着Item[];
}) {
  const { latestCars, latestHeritage, latestGuides, latestColumns } = props;

  const pooled = uniqueItems([
    ...latestColumns,
    ...latestHeritage,
    ...latestGuides,
    ...latestCars,
  ]);

  const heroVisual =
    latestCars.find(hasImage) ??
    latestHeritage.find(hasImage) ??
    latestGuides.find(hasImage) ??
    latestColumns.find(hasImage) ??
    null;

  const heroContext =
    uniqueItems([
      latestHeritage[0],
      latestColumns[0],
      latestGuides[0],
      latestCars[0],
      ...pooled,
    ]).find((item) => item.href !== heroVisual?.href) ?? null;

  const featuredLead =
    uniqueItems([
      latestHeritage.find(hasImage),
      latestCars.find(hasImage),
      latestGuides.find(hasImage),
      latestColumns[0],
      latestHeritage[0],
      pooled[0],
    ])[0] ?? null;

  const featuredStack = excludeItems(
    uniqueItems([...latestColumns, ...latestGuides, ...latestHeritage, ...latestCars]),
    buildUsedSet([heroContext, featuredLead]),
    2,
  );

  const longRead =
    excludeItems(
      uniqueItems([...latestHeritage, ...latestColumns, ...latestGuides, ...latestCars]),
      buildUsedSet([heroContext, featuredLead, ...featuredStack]),
      1,
    )[0] ?? null;

  const longReadSupport = excludeItems(
    uniqueItems([...latestColumns, ...latestHeritage, ...latestGuides, ...latestCars]),
    buildUsedSet([heroContext, featuredLead, ...featuredStack, longRead]),
    2,
  );

  const practicalLead =
    excludeItems(
      uniqueItems([
        latestGuides.find(hasImage),
        latestGuides[0],
        latestGuides[1],
        latestCars[1],
        ...latestGuides,
        ...pooled,
      ]),
      buildUsedSet([heroContext, featuredLead, ...featuredStack, longRead, ...longReadSupport]),
      1,
    )[0] ?? null;

  const practicalStack = excludeItems(
    uniqueItems([...latestGuides, ...latestCars, ...latestColumns, ...latestHeritage]),
    buildUsedSet([heroContext, featuredLead, ...featuredStack, longRead, ...longReadSupport, practicalLead]),
    2,
  );

  const latestStories = excludeItems(
    uniqueItems([...latestColumns, ...latestGuides, ...latestHeritage, ...latestCars]),
    buildUsedSet([
      heroContext,
      featuredLead,
      ...featuredStack,
      longRead,
      ...longReadSupport,
      practicalLead,
      ...practicalStack,
    ]),
    6,
  );

  const featuredCars = uniqueItems([...latestCars.filter(hasImage), ...latestCars]).slice(0, 3);


  return (
    <main className="pb-24">
      <section className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden lg:min-h-[calc(100svh-72px)]">
        <Image
          src={EDITORIAL_ASSETS.homeHero}
          alt="夜明けの建築前に置かれたシルバーのクーペ"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,18,16,0.02)_0%,rgba(21,18,16,0.05)_38%,rgba(21,18,16,0.18)_68%,rgba(21,18,16,0.46)_100%)]" />
        <div className="absolute inset-0 [background:radial-gradient(circle_at_top_left,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_36%)]" />

        <div className="page-shell relative flex min-h-[calc(100svh-64px)] items-end pb-10 pt-10 sm:pb-12 sm:pt-12 lg:min-h-[calc(100svh-72px)] lg:pb-16 lg:pt-16">
          <div className="max-w-[34rem] text-white">
            <h1 className="text-[46px] font-semibold leading-[0.98] tracking-[-0.068em] text-white sm:text-[62px] lg:text-[92px]">
              CAR BOUTIQUE
              <br />
              JOURNAL
            </h1>
            <p className="mt-5 max-w-[27rem] text-[15px] leading-[1.88] text-white/84 sm:text-[16px] lg:text-[18px]">
              自動車エディトリアル
            </p>
          </div>
        </div>
      </section>

      <div id="home-after-hero" className="scroll-mt-24" />

      {featuredLead ? (
        <section className="page-shell section-gap">
          <Reveal>
            <SectionHeader
              eyebrow="FEATURED"
              title={featuredLead.title}
            />
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-6">
            <Reveal>
              <LeadStoryCard item={featuredLead} tone="taupe" />
            </Reveal>

            <div className="grid gap-5">
              {featuredStack.map((item, index) => (
                <Reveal key={item.href} delay={index * 40}>
                  <TextStoryCard
                    item={item}
                    tone={index === 0 ? "clay" : "slate"}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-shell section-gap">
        <Reveal>
          <SectionHeader
            eyebrow="BROWSE"
            title="テーマから探す"
          />
        </Reveal>

        <div className="grid gap-5 lg:auto-rows-fr lg:grid-cols-6 lg:gap-6">
          {THEME_LANES.map((lane, index) => (
            <Reveal
              key={lane.href}
              delay={index * 40}
              className={THEME_LANE_LAYOUTS[index] ?? "lg:col-span-3"}
            >
              <ThemeLaneCard lane={lane} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      {longRead ? (
        <section className="page-shell section-gap">
          <Reveal>
            <SectionHeader
              eyebrow="COLUMN"
              title="考察"
            />
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="order-2 grid gap-5 lg:order-1">
              {longReadSupport.map((item, index) => (
                <Reveal key={item.href} delay={index * 40}>
                  <TextStoryCard
                    item={item}
                    tone={index === 0 ? "moss" : "taupe"}
                  />
                </Reveal>
              ))}
            </div>

            <Reveal className="order-1 lg:order-2">
              <LeadStoryCard
                item={longRead}
                tone="slate"
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {practicalLead ? (
        <section className="page-shell section-gap">
          <Reveal>
            <SectionHeader
              eyebrow="GUIDE"
              title="ガイド記事"
            />
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-start">
            <Reveal>
              <LeadStoryCard item={practicalLead} tone="clay" />
            </Reveal>

            <div className="grid gap-5">
              {practicalStack.map((item, index) => (
                <Reveal key={item.href} delay={index * 40}>
                  <TextStoryCard
                    item={item}
                    tone={index === 0 ? "taupe" : "moss"}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {latestStories.length > 0 ? (
        <section className="page-shell section-gap">
          <Reveal>
            <SectionHeader
              eyebrow="LATEST"
              title="最新の記事"
            />
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            {latestStories.map((item, index) => (
              <Reveal key={item.href} delay={index * 35}>
                <TextStoryCard
                  item={item}
                  tone={index % 3 === 0 ? "slate" : index % 3 === 1 ? "clay" : "taupe"}
                  className={index === 0 ? "lg:col-span-2" : ""}
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-shell section-gap">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <DirectoryCard />

            <div>
              <div className="mb-6 max-w-[30rem]">
                <div className="text-[10px] font-semibold tracking-[0.28em] text-[var(--accent-slate)] uppercase">
                  BROWSE
                </div>
                <h2 className="mt-3 text-[30px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[36px]">
                  車種を探す
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {featuredCars.map((item, index) => (
                  <Reveal key={item.href} delay={index * 40}>
                    <CarShelfCard item={item} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
