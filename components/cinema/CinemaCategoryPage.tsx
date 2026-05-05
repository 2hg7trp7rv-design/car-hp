import Link from "next/link";

import Navigation from "@/app/components/Navigation";
import FooterSection from "@/app/sections/FooterSection";
import ImageMarquee from "@/components/ImageMarquee";
import { ArrowUpRightIcon } from "@/components/CinemaIcons";

export type CinemaCategoryCard = {
  href: string;
  title: string;
  eyebrow: string;
  meta?: string;
  description?: string;
  image: string;
};

export type CinemaCategoryStat = {
  label: string;
  value: string;
};

export type CinemaCategoryDirectoryLink = {
  href: string;
  label: string;
  note: string;
};

type CinemaCategoryPageProps = {
  eyebrow: string;
  title: string;
  labelJa: string;
  lead: string;
  description: string;
  heroImage: string;
  heroCode: string;
  heroMeta: string;
  stats: CinemaCategoryStat[];
  featured: CinemaCategoryCard[];
  cards: CinemaCategoryCard[];
  directoryLinks: CinemaCategoryDirectoryLink[];
  marqueeImages: string[];
};

const strokeTextStyle = {
  WebkitTextStroke: "1px rgba(255,255,255,0.34)",
  WebkitTextFillColor: "transparent",
} as const;

const faintStrokeTextStyle = {
  WebkitTextStroke: "1px rgba(255,255,255,0.13)",
  WebkitTextFillColor: "transparent",
} as const;

function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
    />
  );
}

function FeaturedCard({ item, index }: { item: CinemaCategoryCard; index: number }) {
  const large = index === 0;

  return (
    <Link
      href={item.href}
      className={[
        "group relative block overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018]",
        large ? "lg:col-span-2 lg:row-span-2" : "",
      ].join(" ")}
    >
      <div className={large ? "relative aspect-[16/12] lg:h-full" : "relative aspect-[16/11]"}>
        <CardImage src={item.image} alt={item.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/28 to-[#0A0A0A]/10" />
        <div className="absolute left-4 top-4 text-[8px] tracking-[0.34em] text-white/45 uppercase sm:left-5 sm:top-5">
          {item.eyebrow}
        </div>
        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.15] text-white/55 transition-all duration-300 group-hover:bg-white group-hover:text-black sm:right-5 sm:top-5">
          <ArrowUpRightIcon size={15} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          {item.meta ? (
            <div className="mb-2 text-[9px] tracking-[0.26em] text-white/35 uppercase">{item.meta}</div>
          ) : null}
          <h2 className={large ? "max-w-[14ch] text-3xl font-medium leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl" : "text-2xl font-medium leading-[1.02] tracking-[-0.05em] text-white sm:text-3xl"}>
            {item.title}
          </h2>
        </div>
      </div>
    </Link>
  );
}

function ArchiveCard({ item, index }: { item: CinemaCategoryCard; index: number }) {
  return (
    <Link
      href={item.href}
      className="group grid gap-4 border-b border-white/[0.07] py-5 transition-colors duration-300 hover:border-white/[0.18] sm:grid-cols-[96px_1fr_auto] sm:items-center sm:py-6"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white/[0.035] sm:aspect-square">
        <CardImage src={item.image} alt={item.title} />
        <div className="absolute inset-0 bg-[#0A0A0A]/18" />
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="text-[8px] tracking-[0.3em] text-white/[0.28] uppercase">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[8px] tracking-[0.3em] text-white/[0.36] uppercase">{item.eyebrow}</span>
          {item.meta ? <span className="text-[10px] text-white/25">{item.meta}</span> : null}
        </div>
        <h3 className="text-xl font-medium leading-[1.14] tracking-[-0.04em] text-white sm:text-2xl">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-3 max-w-2xl text-sm leading-[1.85] text-white/[0.43]">{item.description}</p>
        ) : null}
      </div>
      <div className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] text-white/[0.38] transition-all duration-300 group-hover:bg-white group-hover:text-black sm:flex">
        <ArrowUpRightIcon size={16} />
      </div>
    </Link>
  );
}

export default function CinemaCategoryPage({
  eyebrow,
  title,
  labelJa,
  lead,
  description,
  heroImage,
  heroCode,
  heroMeta,
  stats,
  featured,
  cards,
  directoryLinks,
  marqueeImages,
}: CinemaCategoryPageProps) {
  const archiveItems = cards.slice(0, 18);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      <Navigation />

      <section className="relative min-h-screen overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full scale-105 object-cover opacity-72" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/74 via-[#0A0A0A]/38 to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-[#0A0A0A]/34" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-end px-5 pb-14 pt-24 sm:px-8 sm:pb-20 lg:px-12">
          <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] uppercase tracking-[0.42em] text-white/[0.42]">
            <span>{eyebrow}</span>
            <span className="h-px w-10 bg-white/[0.18]" />
            <span>{labelJa}</span>
          </div>

          <h1 className="font-serif text-[20vw] leading-[0.78] tracking-[-0.08em] sm:text-[16vw] lg:text-[13vw]" style={strokeTextStyle}>
            {title}
          </h1>

          <div className="mt-8 grid gap-8 border-t border-white/[0.08] pt-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="max-w-[12ch] text-4xl font-medium leading-[0.98] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                {lead}
              </p>
            </div>
            <div className="max-w-xl lg:ml-auto">
              <p className="text-sm leading-[1.95] text-white/50 sm:text-base">{description}</p>
              <div className="mt-7 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="font-serif text-3xl leading-none text-white/[0.82] sm:text-4xl">{stat.value}</div>
                    <div className="mt-2 text-[8px] uppercase tracking-[0.28em] text-white/[0.32]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
          <div className="text-[9px] uppercase tracking-[0.4em] text-white/[0.34]">{heroMeta}</div>
          <div className="mx-auto mt-3 h-8 w-px bg-gradient-to-b from-white/[0.36] to-transparent" />
        </div>

        <div className="pointer-events-none absolute right-4 top-24 z-10 hidden text-[18vw] font-serif leading-none text-white/[0.025] lg:block">
          {heroCode}
        </div>
      </section>

      <div className="overflow-hidden py-10">
        <ImageMarquee images={marqueeImages} direction="left" speed={34} imageHeight="160px" />
      </div>

      <section className="relative bg-[#0A0A0A] px-4 py-20 sm:px-6 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 border-b border-white/[0.06] pb-7">
            <p className="mb-2 text-[9px] uppercase tracking-[0.5em] text-white/25">FEATURED</p>
            <h2 className="font-serif text-5xl leading-none sm:text-7xl md:text-8xl" style={faintStrokeTextStyle}>
              EDITORIAL
            </h2>
          </div>

          <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-4">
            {featured.slice(0, 5).map((item, index) => (
              <FeaturedCard key={item.href} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0A0A0A] px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl border-y border-white/[0.07] py-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {directoryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.045]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[9px] uppercase tracking-[0.32em] text-white/[0.28]">INDEX</div>
                  <ArrowUpRightIcon size={15} className="text-white/[0.34] transition-colors duration-300 group-hover:text-white" />
                </div>
                <div className="mt-7 text-2xl font-medium leading-none tracking-[-0.05em] text-white">{link.label}</div>
                <p className="mt-3 text-xs leading-[1.7] text-white/[0.38]">{link.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0A0A0A] px-4 py-20 sm:px-6 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-end justify-between gap-6 border-b border-white/[0.06] pb-7">
            <div>
              <p className="mb-2 text-[9px] uppercase tracking-[0.5em] text-white/25">ARCHIVE</p>
              <h2 className="font-serif text-5xl leading-none sm:text-7xl md:text-8xl" style={faintStrokeTextStyle}>
                STORIES
              </h2>
            </div>
            <div className="hidden text-right text-[9px] uppercase tracking-[0.3em] text-white/[0.24] sm:block">
              {archiveItems.length} SELECTED
            </div>
          </div>

          <div>
            {archiveItems.map((item, index) => (
              <ArchiveCard key={`${item.href}-${index}`} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <div className="overflow-hidden py-10">
        <ImageMarquee images={[...marqueeImages].reverse()} direction="right" speed={38} imageHeight="140px" />
      </div>

      <FooterSection />
    </main>
  );
}
