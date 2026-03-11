import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { pickExhibitKvPaths } from "@/lib/exhibit/kv";

export const revalidate = 60 * 60; // 1h

export const metadata: Metadata = {
  title: "EXHIBITION｜Select an Archive",
  description:
    "HOME / CARS / COLUMN / GUIDE / HERITAGE のトップへ直接入るための選択画面。",
  alternates: {
    canonical: "/exhibition",
  },
};

type Room = {
  key: string;
  n: string;
  title: string;
  subtitle: string;
  href: string;
};

const rooms: Room[] = [
  {
    key: "home",
    n: "01",
    title: "HOME",
    subtitle: "Journal entrance",
    href: "/",
  },
  {
    key: "cars",
    n: "02",
    title: "CARS",
    subtitle: "Models and decisions",
    href: "/cars",
  },
  {
    key: "column",
    n: "03",
    title: "COLUMN",
    subtitle: "Editorial notes",
    href: "/column",
  },
  {
    key: "guide",
    n: "04",
    title: "GUIDE",
    subtitle: "Buying, owning, selling",
    href: "/guide",
  },
  {
    key: "heritage",
    n: "05",
    title: "HERITAGE",
    subtitle: "Turning points and context",
    href: "/heritage",
  },
];

export default function ExhibitionPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "EXHIBITION",
        item: `${getSiteUrl()}/exhibition`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground seed="exhibition" />
      <JsonLd id="jsonld-exhibition-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "EXHIBITION" }]} className="mb-6" />

          <header className="mb-10">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">SELECT</p>
              <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,40px)] text-[#222222]">
                すぐに入るための選択画面。
              </h1>
              <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">
                ここでは HOME / CARS / COLUMN / GUIDE / HERITAGE のトップへ直接入れます。
                <br />
                CANVAS / COMPARE は工具なので、この画面には置きません。
              </p>
            </Reveal>
          </header>

          <section aria-label="Selection cards">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room, idx) => (
                <Reveal key={room.key} delay={60 + idx * 40}>
                  <SelectionCard room={room} />
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SelectionCard({ room }: { room: Room }) {
  const kv = pickExhibitKvPaths(`select:${room.href}`);

  return (
    <Link href={room.href} className="block">
      <GlassCard className="relative overflow-hidden border border-[#222222]/10 bg-white/80" padding="none" interactive>
        <div aria-hidden="true" className="absolute inset-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={kv.desktop} />
            <img src={kv.mobile} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-20" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/45 to-[#0ABAB5]/[0.08]" />
        </div>

        <div className="relative z-10 flex min-h-[220px] flex-col justify-between p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">CARD {room.n}</p>
            <h2 className="mt-2 font-serif text-[24px] font-semibold tracking-tight text-[#222222]">{room.title}</h2>
            <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/70">{room.subtitle}</p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-[#0ABAB5]">OPEN</span>
            <span aria-hidden="true" className="text-[#222222]/50">→</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
