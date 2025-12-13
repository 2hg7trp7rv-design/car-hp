"use client";

import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

import type { CarItem } from "@/lib/cars";

type Props = {
  car: CarItem;
};

export function CarCard({ car }: Props) {
  const title = `${car.maker ?? ""} ${car.series ?? ""}`.trim();
  const meta = [car.bodyType, car.generation].filter(Boolean).join(" / ");

  return (
    <Reveal>
      <Link href={`/cars/${encodeURIComponent(car.slug)}`}>
        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
          <div className="space-y-3">
            <div>
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                {title}
              </h3>
              {meta && (
                <p className="mt-1 text-[10px] tracking-[0.16em] text-slate-500">
                  {meta}
                </p>
              )}
            </div>

            {car.catchCopy && (
              <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                {car.catchCopy}
              </p>
            )}
          </div>
        </GlassCard>
      </Link>
    </Reveal>
  );
}
