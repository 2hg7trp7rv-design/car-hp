// components/guide/GuideCardList.tsx

import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

type Props = {
  slugs: string[];
  /**
   * 取得できなかった場合のフォールバック表示数
   * （slugs はあるのに該当guideが存在しないケースの保険）
   */
  fallbackCount?: number;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function pickBySlugOrder(all: GuideItem[], slugs: string[]): GuideItem[] {
  const cleaned = slugs.filter(isNonEmptyString);
  const order = new Map<string, number>();
  cleaned.forEach((s, i) => order.set(s, i));
  const set = new Set(cleaned);

  return all
    .filter((g) => isNonEmptyString(g.slug) && set.has(g.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}

function sortLatest(all: GuideItem[]): GuideItem[] {
  // publishedAt / updatedAt があればそれを優先、なければ順序は維持
  return [...all].sort((a: any, b: any) => {
    const ta =
      a?.publishedAt ? new Date(a.publishedAt).getTime()
      : a?.updatedAt ? new Date(a.updatedAt).getTime()
      : 0;
    const tb =
      b?.publishedAt ? new Date(b.publishedAt).getTime()
      : b?.updatedAt ? new Date(b.updatedAt).getTime()
      : 0;
    return tb - ta;
  });
}

/**
 * slugs 指定で GUIDE カードを並べるための最小ユーティリティ。
 * - Server Component（async）で guides を取得
 * - slugs の並び順を維持して表示
 * - 該当が0件のときは最新からフォールバック（任意）
 */
export async function GuideCardList({ slugs, fallbackCount = 4 }: Props) {
  const all = await getAllGuides();
  const picked = pickBySlugOrder(all, slugs);

  const items =
    picked.length > 0 ? picked : sortLatest(all).slice(0, fallbackCount);

  if (items.length === 0) {
    return <p className="text-[11px] text-slate-500">関連するガイドは準備中です。</p>;
    }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((guide, index) => (
        <Reveal key={guide.id ?? `${guide.slug}-${index}`} delay={80 + index * 30}>
          <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
            <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                {guide.title}
              </h3>
              {guide.summary && (
                <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                  {guide.summary}
                </p>
              )}
              <p className="mt-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                READ →
              </p>
            </GlassCard>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
