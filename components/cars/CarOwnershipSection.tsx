"use client";

// components/cars/CarOwnershipSection.tsx

import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animation/Reveal";
import { usePageContext } from "@/lib/analytics/pageContext";
import { trackOutboundClick } from "@/lib/analytics/events";

// lucide-react の依存を削除し、SVGを直接記述します

type Props = {
  carName: string;
  relatedGuides: {
    slug: string;
    title: string;
    category?: string | null;
    summary?: string | null;
    publishedAt?: string | null;
  }[];
  hubHref?: string;

  /**
   * 外部検索（在庫検索）などに飛ばすURL（任意）
   * - 存在する場合、CTA は外部リンクになり outbound_click を送信する
   * - 存在しない場合、従来通り HUB へ遷移する
   */
  affiliateUrl?: string;
};

// アイコンコンポーネント（インラインSVG）
const IconWallet = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const IconCar = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const IconShieldCheck = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export function CarOwnershipSection({
  carName,
  relatedGuides,
  hubHref,
  affiliateUrl,
}: Props) {
  if (relatedGuides.length === 0 && !hubHref && !affiliateUrl) return null;

  const pageContext = usePageContext();
  const fromId =
    typeof pageContext.content_id === "string" && pageContext.content_id.length > 0
      ? pageContext.content_id
      : "";

  const toHubId = hubHref
    ? hubHref.replace(/^\/+/, "").replaceAll("/", "_")
    : "hub";

  return (
    <section className="mb-10 mt-16">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-tiffany-600">
              OWNERSHIP REALITY
            </p>
            <h2 className="serif-heading mt-2 text-xl font-medium text-slate-900 md:text-2xl">
              「{carName}」と付き合う現実
            </h2>
            <p className="mt-2 text-[11px] text-slate-500">
              維持費・トラブル・購入の段取りなど、オーナーになる前に知っておきたいこと。
            </p>
          </div>
          <TrackedLink
            href="/guide"
            fromType="cars"
            fromId={fromId}
            toType="guide"
            toId="index"
            className="hidden text-[11px] font-medium text-tiffany-600 underline-offset-4 hover:underline md:block"
          >
            GUIDE一覧へ →
          </TrackedLink>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左側: 関連ガイドリスト (2カラム) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {relatedGuides.map((guide, idx) => {
            const cat = guide.category || "GUIDE";
            const isMoney = cat === "MONEY" || cat === "MAINTENANCE_COST";
            const isTrouble = cat === "TROUBLE" || cat === "MAINTENANCE";

            return (
              <Reveal key={guide.slug} delay={idx * 100}>
                <TrackedLink
                  href={`/guide/${guide.slug}`}
                  fromType="cars"
                  fromId={fromId}
                  toType="guide"
                  toId={guide.slug}
                  shelfId="cars_shelf_ownership"
                  className="group block h-full"
                >
                  <GlassCard
                    interactive
                    className="flex h-full flex-col justify-between border border-slate-200/80 p-5 transition-all duration-300 hover:border-tiffany-300"
                  >
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        {isMoney && <IconWallet className="h-5 w-5 text-emerald-600" />}
                        {isTrouble && (
                          <IconShieldCheck className="h-5 w-5 text-amber-600" />
                        )}
                        {!isMoney && !isTrouble && (
                          <IconCar className="h-5 w-5 text-blue-600" />
                        )}

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600">
                          {cat}
                        </span>
                      </div>
                      <h3 className="text-[13px] font-bold leading-relaxed text-slate-900 transition-colors group-hover:text-tiffany-700">
                        {guide.title}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center justify-end text-[10px] font-bold tracking-widest text-tiffany-600 decoration-1 underline-offset-4 group-hover:underline">
                      READ MORE
                      <IconArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </GlassCard>
                </TrackedLink>
              </Reveal>
            );
          })}
        </div>

        {/* 右側: アフィリエイト CTA (検索ボタン) */}
        <Reveal delay={200}>
          <GlassCard className="relative flex h-full flex-col items-center justify-center overflow-hidden border-slate-800 bg-slate-900 p-6 text-center text-white shadow-xl">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-tiffany-500/20 blur-3xl" />

            <div className="relative z-10">
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-tiffany-300">
                FIND YOURS
              </p>
              <h3 className="serif-heading mb-4 text-xl leading-tight">運命の1台を探す</h3>

              <Button
                asChild
                className="w-full rounded-full bg-tiffany-600 py-6 font-bold tracking-wider text-white shadow-lg shadow-tiffany-900/20 transition-transform hover:-translate-y-1 hover:bg-tiffany-500"
              >
                {affiliateUrl ? (
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackOutboundClick({
                        href: affiliateUrl,
                        monetizeKey: "inventory_search",
                        pageType: "cars_detail",
                        contentId: fromId,
                        shelf_id: "cars_shelf_ownership",
                      });
                    }}
                  >
                    在庫・価格を見る
                  </a>
                ) : (
                  <TrackedLink
                    href={hubHref || "/guide/hub-usedcar"}
                    fromType="cars"
                    fromId={fromId}
                    toType="hub"
                    toId={toHubId}
                    shelfId="cars_shelf_ownership"
                  >
                    在庫・価格を見る
                  </TrackedLink>
                )}
              </Button>

              <p className="mt-4 text-[10px] text-slate-500">
                {affiliateUrl ? "外部サイトへ移動します" : "HUBページへ移動します"}
              </p>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
