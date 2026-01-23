"use client";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { CompareAddButton } from "@/components/compare/CompareAddButton";
import type { CarItem } from "@/lib/cars";

type Props = {
  car: CarItem;
  delay?: number;
  /** どの棚/リストからクリックされたか（CTR分析用） */
  shelfId?: string;
};

function joinMeta(parts: Array<string | number | null | undefined>) {
  return parts
    .map((v) => (typeof v === "number" ? String(v) : v))
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(" / ");
}

export function CarCard({ car, delay = 0, shelfId = "car_card" }: Props) {
  const title = `${car.maker ?? ""} ${car.name ?? ""}`.trim() || car.name;

  const meta = joinMeta([
    car.bodyType,
    car.drive,
    car.segment,
    car.releaseYear ? `${car.releaseYear}年頃` : null,
  ]);

  const excerpt = (car.summaryLong ?? car.summary ?? "").trim();
  const image = (car.heroImage ?? "").trim();

  return (
    <Reveal delay={delay}>
      <div className="relative">
        <div className="absolute right-3 top-3 z-20">
          <CompareAddButton slug={car.slug} mode="icon" source={shelfId} />
        </div>

        <TrackedLink
          href={`/cars/${encodeURIComponent(car.slug)}`}
          toType="cars"
          toId={car.slug}
          shelfId={shelfId}
          ctaId="car_card_open"
          className="block"
        >
        <GlassCard
          as="article"
          padding="md"
          interactive
          className="group h-full border border-slate-200/80 bg-white/90 text-xs shadow-soft transition hover:-translate-y-[2px] hover:border-tiffany-200"
        >
          <div className="flex flex-col gap-3">
            {image && (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={title}
                  className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {car.maker && (
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      {car.maker}
                    </p>
                  )}
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-tiffany-700">
                    {car.name}
                  </h3>
                </div>
              </div>

              {meta && (
                <p className="text-[10px] tracking-[0.14em] text-slate-500">
                  {meta}
                </p>
              )}

              {excerpt && (
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                  {excerpt}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
        </TrackedLink>
      </div>
    </Reveal>
  );
}
