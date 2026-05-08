"use client";

import Image from "next/image";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import type { CarItem } from "@/lib/cars";
import { getEditorialCarCardImageBySlug } from "@/lib/editorial-assets";
import { resolveEditorialImage } from "@/lib/editorial-media";
import { cn } from "@/lib/utils";

type Props = {
  car: CarItem;
  delay?: number;
  shelfId?: string;
  layout?: "feature" | "standard" | "compact";
};

function joinMeta(parts: Array<string | number | null | undefined>) {
  return parts
    .map((v) => (typeof v === "number" ? String(v) : v))
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(" / ");
}

function clampSummary(car: CarItem) {
  return (car.summaryLong ?? car.summary ?? car.description ?? "").trim();
}

export function CarCard({
  car,
  delay = 0,
  shelfId = "car_card",
  layout = "standard",
}: Props) {
  const title = `${car.maker ?? ""} ${car.name ?? ""}`.trim() || car.name;
  const meta = joinMeta([
    car.bodyType,
    car.drive,
    car.segment,
    car.releaseYear ? `${car.releaseYear}年頃` : null,
  ]);

  const excerpt = clampSummary(car);
  const imageRaw = (getEditorialCarCardImageBySlug(car.slug) ?? car.heroImage ?? car.mainImage ?? "").trim();
  const image = resolveEditorialImage(imageRaw || null, "car", "card", car.slug);

  const isFeature = layout === "feature";
  const isCompact = layout === "compact";
  /**
   * Mobile consistency:
   * - The cars archive is mostly consumed on mobile.
   * - Mixed aspect ratios / typography make the list feel "uneven".
   * - Keep ALL layouts aligned on the base (mobile) breakpoint and only diverge on lg+.
   */
  const mediaClass = isFeature
    ? "aspect-[16/10] lg:aspect-auto lg:h-full"
    : isCompact
      ? "aspect-[16/10] lg:aspect-[4/3]"
      : "aspect-[16/10]";

  return (
    <Reveal delay={delay}>
      <div className="relative h-full">
        <TrackedLink
          href={`/cars/${encodeURIComponent(car.slug)}`}
          toType="cars"
          toId={car.slug}
          shelfId={shelfId}
          ctaId="car_card_open"
          className="group block h-full"
        >
          <GlassCard
            as="article"
            padding="none"
            interactive
            className={cn(
              "h-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] text-[var(--text-primary)] transition",
              "hover:border-[rgba(122,135,108,0.35)] hover:shadow-none",
            )}
          >
            <div
              className={cn(
                "flex h-full flex-col",
                isFeature &&
                  "lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-stretch",
              )}
            >
              <div className={cn("relative overflow-hidden", mediaClass)}>
                <Image
                  src={image.src}
                  alt={title}
                  fill
                  sizes={isFeature ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 50vw"}
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,243,0.02),rgba(31,28,25,0.18))]" />
              </div>

              <div
                className={cn(
                  "flex min-h-full flex-col",
                  isFeature ? "p-6 lg:p-7" : isCompact ? "p-6 lg:p-5" : "p-6",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {car.maker ? (
                    <span className="rounded-full border border-[rgba(122,135,108,0.18)] bg-[var(--accent-subtle)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--accent-strong)]">
                      {car.maker}
                    </span>
                  ) : null}
                  {car.releaseYear ? (
                    <span className="text-[10px] tracking-[0.14em] text-[var(--text-tertiary)]">
                      {car.releaseYear}年頃
                    </span>
                  ) : null}
                </div>

                <h3
                  className={cn(
                    "mt-4 font-semibold tracking-[-0.03em] text-[var(--text-primary)] transition group-hover:text-[var(--accent-strong)]",
                    // Base (mobile) is unified; layout differences apply on sm+/lg+.
                    isFeature
                      ? "text-[21px] leading-[1.4] sm:text-[28px] sm:leading-[1.25] lg:text-[34px]"
                      : isCompact
                        ? "text-[21px] leading-[1.4] lg:text-[18px] lg:leading-[1.45]"
                        : "text-[21px] leading-[1.4]",
                  )}
                >
                  {car.name}
                </h3>

                {excerpt ? (
                  <p
                    className={cn(
                      "mt-3 leading-[1.9] text-[var(--text-secondary)]",
                      // Base (mobile) is unified; layout differences apply on lg+.
                      isFeature
                        ? "line-clamp-3 text-[14px] lg:line-clamp-5 lg:text-[15px]"
                        : isCompact
                          ? "line-clamp-3 text-[14px] lg:line-clamp-2 lg:text-[13px]"
                          : "line-clamp-3 text-[14px]",
                    )}
                  >
                    {excerpt}
                  </p>
                ) : null}

                {meta ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meta.split(" / ").map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgba(31,28,25,0.08)] bg-[var(--surface-2)] px-3 py-1 text-[10px] tracking-[0.14em] text-[var(--text-tertiary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto pt-5 text-[11px] font-medium tracking-[0.14em] text-[var(--text-tertiary)] transition group-hover:text-[var(--accent-strong)]">
                  読む →
                </div>
              </div>
            </div>
          </GlassCard>
        </TrackedLink>
      </div>
    </Reveal>
  );
}
