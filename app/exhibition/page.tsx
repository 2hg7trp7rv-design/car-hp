import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";

import { getIndexCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { getAllHeritage } from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";
import { pickExhibitKvPaths } from "@/lib/exhibit/kv";
import { getExhibitionRoutes, type ExhibitionRoute } from "@/lib/exhibit/routes";

export const revalidate = 60 * 60; // 1h

export const metadata: Metadata = {
  title: "EXHIBITION MAP｜CAR BOUTIQUE JOURNAL",
  description:
    "CARS / GUIDE / COLUMN / HERITAGE を“展示室”としてつなぎ、目的別に読む順番を示すエキシビションマップ。",
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
  countLabel: string;
  peek: Array<{ href: string; label: string; meta?: string }>;
};

function safeIsoDate(value?: string | null): string {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default async function ExhibitionPage() {
  const [cars, guides, columns, heritage] = await Promise.all([
    getIndexCars(),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
  ]);

  const rooms: Room[] = [
    {
      key: "start",
      n: "00",
      title: "START",
      subtitle: "目的から入る",
      href: "/start",
      countLabel: "入口",
      peek: [
        { href: "/start", label: "目的別の入口" },
        { href: "/site-map", label: "サイトマップ" },
      ],
    },
    {
      key: "canvas",
      n: "01",
      title: "CANVAS",
      subtitle: "判断軸を固定",
      href: "/canvas",
      countLabel: "tool",
      peek: [
        { href: "/canvas", label: "Decision Canvas" },
        { href: "/guide/hub-usedcar", label: "中古車検索HUB" },
      ],
    },
    {
      key: "cars",
      n: "02",
      title: "CARS",
      subtitle: "車種データベース",
      href: "/cars",
      countLabel: `${cars.length} models`,
      peek: (cars || []).slice(0, 2).map((c) => ({
        href: `/cars/${encodeURIComponent(c.slug)}`,
        label: c.name || c.slug,
        meta: [c.maker, c.releaseYear ? String(c.releaseYear) : null].filter(Boolean).join(" / "),
      })),
    },
    {
      key: "guides",
      n: "03",
      title: "GUIDE",
      subtitle: "買い方・維持費・売却",
      href: "/guide",
      countLabel: `${guides.length} guides`,
      peek: (guides || []).slice(0, 2).map((g) => ({
        href: `/guide/${encodeURIComponent(g.slug)}`,
        label: g.title || g.slug,
        meta: safeIsoDate(g.publishedAt ?? g.updatedAt),
      })),
    },
    {
      key: "columns",
      n: "04",
      title: "COLUMN",
      subtitle: "編集メモ / 仮説",
      href: "/column",
      countLabel: `${columns.length} columns`,
      peek: (columns || []).slice(0, 2).map((c) => ({
        href: `/column/${encodeURIComponent(c.slug)}`,
        label: c.title || c.slug,
        meta: safeIsoDate(c.publishedAt ?? c.updatedAt),
      })),
    },
    {
      key: "heritage",
      n: "05",
      title: "HERITAGE",
      subtitle: "系譜 / 転換点",
      href: "/heritage",
      countLabel: `${heritage.length} stories`,
      peek: (heritage || []).slice(0, 2).map((h) => ({
        href: `/heritage/${encodeURIComponent(h.slug)}`,
        label: h.title || h.slug,
        meta: h.eraLabel || safeIsoDate(h.publishedAt ?? h.updatedAt),
      })),
    },
  ];

  const routes = getExhibitionRoutes();

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
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "EXHIBITION MAP" }]} className="mb-6" />

          <header className="mb-10">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">EXHIBITION</p>
              <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,40px)] text-[#222222]">
                展示室をつなぐ、読む順番。
              </h1>
              <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">
                ここは“サイトマップ”ではなく“回遊の設計図”。
                <br />
                目的から入って、判断材料だけを拾い、迷いを削る。
              </p>
            </Reveal>
          </header>

          {/* ROOMS */}
          <section aria-label="Rooms" className="mb-10">
            <Reveal delay={40}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">ROOMS</p>
                  <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-[#222222]">
                    展示室
                  </h2>
                  <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#222222]/70">
                    “入口→候補→判断→文脈”の順で迷いが減ります。
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/start">STARTへ</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/site-map">サイトマップへ</Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {rooms.map((room, idx) => (
                <Reveal key={room.key} delay={80 + idx * 40}>
                  <RoomCard room={room} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* CURATOR ROUTES */}
          <section aria-label="Curator routes" className="mt-12">
            <Reveal delay={240}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">CURATOR ROUTES</p>
                  <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-[#222222]">
                    読む順番（目的別）
                  </h2>
                  <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#222222]/70">
                    “1つ読む→次へ移る”だけで迷わないルート。検索/比較より先に、順番を固定します。
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {routes.map((r, idx) => (
                <Reveal key={r.id} delay={280 + idx * 40}>
                  <RouteCard route={r} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* FOOT */}
          <section className="mt-12">
            <Reveal delay={520}>
              <GlassCard className="border border-[#222222]/10 bg-white/70 p-6" padding="none">
                <h2 className="font-serif text-[14px] font-semibold text-[#222222]">補足</h2>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
                  <li>
                    ・このページは“入口の迷い”を減らすための設計図です。網羅は <Link className="underline" href="/site-map">サイトマップ</Link>。
                  </li>
                  <li>
                    ・検索/比較は運用方針上、主要導線には置きません（noindex）。
                  </li>
                </ul>
              </GlassCard>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}

function RoomCard({ room }: { room: Room }) {
  const kv = pickExhibitKvPaths(`room:${room.href}`);

  return (
    <Link href={room.href} className="block">
      <GlassCard className="relative overflow-hidden border border-[#222222]/10 bg-white/80" padding="none" interactive>
        <div aria-hidden="true" className="absolute inset-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={kv.desktop} />
            <img
              src={kv.mobile}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-20"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/40 to-[#0ABAB5]/[0.08]" />
        </div>

        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">ROOM {room.n}</p>
              <h3 className="mt-2 font-serif text-[22px] font-semibold tracking-tight text-[#222222]">
                {room.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">{room.subtitle}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">COUNT</p>
              <p className="mt-2 text-[12px] font-semibold text-[#222222]">{room.countLabel}</p>
            </div>
          </div>

          {room.peek.length ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {room.peek.map((it) => (
                <div key={it.href} className="rounded-2xl border border-[#222222]/10 bg-white/70 px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#222222] line-clamp-2">{it.label}</p>
                  {it.meta ? <p className="mt-1 text-[10px] text-[#222222]/55">{it.meta}</p> : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-[#0ABAB5]">ENTER</span>
            <span aria-hidden="true" className="text-[#222222]/50">→</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

function RouteCard({ route }: { route: ExhibitionRoute }) {
  const first = route.steps[0];
  const last = route.steps[route.steps.length - 1];
  const kv = pickExhibitKvPaths(`route:${route.id}`);

  return (
    <GlassCard className="relative overflow-hidden border border-[#222222]/10 bg-white/80 p-6" padding="none" magnetic>
      <div aria-hidden="true" className="absolute inset-0">
        <picture>
          <source media="(min-width: 768px)" srcSet={kv.desktop} />
          <img src={kv.mobile} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-15" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/85" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">ROUTE</p>
            <h3 className="mt-2 font-serif text-[18px] font-semibold tracking-tight text-[#222222]">
              {route.title}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">{route.lead}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">DURATION</p>
            <p className="mt-2 text-[12px] font-semibold text-[#222222]">{route.duration}</p>
          </div>
        </div>

        <ol className="mt-5 space-y-2">
          {route.steps.map((s, idx) => (
            <li key={s.href} className="flex items-baseline gap-3">
              <span className="w-6 text-[10px] font-semibold tracking-[0.22em] text-[#222222]/45">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <Link href={s.href} className="text-[12px] font-semibold text-[#222222] hover:underline">
                {s.label}
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-[#222222]/55">
            {first ? (
              <>
                Start: <span className="font-semibold text-[#222222]/80">{first.label}</span>
              </>
            ) : null}
            {last ? (
              <>
                <span className="mx-2">→</span>
                End: <span className="font-semibold text-[#222222]/80">{last.label}</span>
              </>
            ) : null}
          </div>

          {first ? (
            <Button asChild variant="primary" size="sm" className="h-10 px-5">
              <Link href={first.href}>この順で読む</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
