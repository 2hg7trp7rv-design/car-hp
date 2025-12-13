// components/guide/GuideMonetizeBlock.tsx
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";

type Props = {
  kind?: "insurance" | "lease" | "maintenance" | "tradein" | "generic";
  title?: string;
  description?: string;
  ctaLabel?: string;
  href?: string;

  // 追加: 表示制御（ページ側から「ここは収益導線を出す/出さない」を決めたい時用）
  enabled?: boolean;
};

const DEFAULTS: Record<
  NonNullable<Props["kind"]>,
  { title: string; description: string; ctaLabel: string; href: string }
> = {
  insurance: {
    title: "保険の比較は「前提の揃え方」から",
    description:
      "年齢条件・運転者範囲・車両保険…まず揃えるべき項目だけ先に。条件が揃うと、見積り差の理由も読める。",
    ctaLabel: "保険の比較ガイドへ",
    href: "/guide/insurance",
  },
  lease: {
    title: "リースは「月額」より「総額/条件」",
    description:
      "走行距離、返却精算、中途解約、メンテ範囲。月額だけで判断せず、条件を読める状態に整える。",
    ctaLabel: "リースの読み方へ",
    href: "/guide/lease",
  },
  maintenance: {
    title: "メンテ用品は「必要になりやすい順」",
    description:
      "洗車・車内・ドラレコ・バッテリー対策。まずは定番だけ、必要になりやすい順に薄く揃える。",
    ctaLabel: "メンテ用品ガイドへ",
    href: "/guide/maintenance",
  },
  tradein: {
    title: "売却は「査定の前」にやることがある",
    description:
      "相場の見方、減点されやすいポイント、書類と段取り。査定に出す前に、損しない準備だけ先に。",
    ctaLabel: "売却ガイドへ",
    href: "/guide/sell",
  },
  generic: {
    title: "次の一手を整理する",
    description:
      "お金・段取り・判断材料。ニュースやコラムを読んだあとに迷いやすいポイントを、ガイドで整理する。",
    ctaLabel: "ガイド一覧へ",
    href: "/guide",
  },
};

export function GuideMonetizeBlock({
  kind = "generic",
  title,
  description,
  ctaLabel,
  href,
  enabled = true,
}: Props) {
  if (!enabled) return null;

  const preset = DEFAULTS[kind];
  const finalTitle = title ?? preset.title;
  const finalDesc = description ?? preset.description;
  const finalCta = ctaLabel ?? preset.ctaLabel;
  const finalHref = href ?? preset.href;

  return (
    <GlassCard className="border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-5 shadow-soft-card sm:p-6">
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
          NEXT STEP
        </p>

        <div>
          <h3 className="serif-heading text-lg font-semibold text-slate-900">
            {finalTitle}
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
            {finalDesc}
          </p>
        </div>

        <div className="pt-1">
          <Link
            href={finalHref}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
          >
            {finalCta}
          </Link>
        </div>

        <p className="text-[10px] leading-relaxed text-slate-500">
          迷いが出やすいところだけ、先に整理できるように入口を用意しています。
        </p>
      </div>
    </GlassCard>
  );
}
