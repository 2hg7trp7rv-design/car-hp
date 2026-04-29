"use client";

// components/cars/CarOwnershipSection.tsx

import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animation/Reveal";
import { usePageContext } from "@/lib/analytics/pageContext";
import { trackOutboundClick } from "@/lib/analytics/events";

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
  affiliateUrl?: string;
};

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

function categoryChip(category: string) {
  if (category === "MONEY" || category === "MAINTENANCE_COST") {
    return "border-[rgba(27,63,229,0.22)] bg-[var(--surface-glow)] text-[var(--accent-strong)]";
  }
  if (category === "TROUBLE" || category === "MAINTENANCE") {
    return "border-[rgba(27,63,229,0.22)] bg-[var(--surface-wash)] text-[var(--accent-base)]";
  }
  return "border-[rgba(27,63,229,0.22)] bg-[var(--surface-fog)] text-[var(--accent-base)]";
}

export function CarOwnershipSection({
  carName,
  relatedGuides,
  hubHref,
  affiliateUrl,
}: Props) {
  const pageContext = usePageContext();
  if (relatedGuides.length === 0 && !hubHref && !affiliateUrl) return null;

  const fromId =
    typeof pageContext.content_id === "string" && pageContext.content_id.length > 0
      ? pageContext.content_id
      : "";

  const toHubId = hubHref ? hubHref.replace(/^\/+/, "").replaceAll("/", "_") : "hub";

  return (
    <section className="mb-10 mt-16">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-base)]">
              OWNERSHIP REALITY
            </p>
            <h2 className="cb-sans-heading mt-2 text-[26px] font-semibold leading-[1.25] text-[var(--text-primary)] md:text-[30px]">
              「{carName}」と付き合う現実
            </h2>
            <p className="mt-2 text-[13px] leading-[1.8] text-[var(--text-secondary)]">
              維持費・トラブル・購入の段取りなど、オーナーになる前に知っておきたいこと。
            </p>
          </div>
          <TrackedLink
            href="/guide"
            fromType="cars"
            fromId={fromId}
            toType="guide"
            toId="index"
            className="hidden text-[12px] font-medium text-[var(--accent-strong)] underline-offset-4 hover:underline md:block"
          >
            ガイド一覧へ
          </TrackedLink>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {relatedGuides.map((guide, idx) => {
            const cat = guide.category || "ガイド";
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
                    className="flex h-full flex-col justify-between border border-[var(--border-default)] bg-[var(--surface-1)] p-5 transition-all duration-200 hover:border-[rgba(27,63,229,0.30)]"
                  >
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        {isMoney && <IconWallet className="h-5 w-5 text-[var(--accent-strong)]" />}
                        {isTrouble && (
                          <IconShieldCheck className="h-5 w-5 text-[var(--accent-base)]" />
                        )}
                        {!isMoney && !isTrouble && (
                          <IconCar className="h-5 w-5 text-[var(--accent-base)]" />
                        )}

                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em]",
                            categoryChip(cat),
                          ].join(" ")}
                        >
                          {cat}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-semibold leading-[1.6] text-[var(--text-primary)] transition-colors duration-120 group-hover:text-[var(--accent-strong)]">
                        {guide.title}
                      </h3>
                    </div>
                    <div className="mt-5 flex items-center justify-end text-[11px] font-semibold tracking-[0.12em] text-[var(--accent-strong)]">
                      読む
                      <IconArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </GlassCard>
                </TrackedLink>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <GlassCard className="relative flex h-full flex-col justify-center overflow-hidden border border-[rgba(27,63,229,0.18)] bg-[linear-gradient(135deg,rgba(241,226,216,0.96),rgba(251,248,243,0.98))] p-6 shadow-soft-card">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[rgba(27,63,229,0.12)] blur-3xl" />

            <div className="relative z-10">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-base)]">
                FIND YOURS
              </p>
              <h3 className="cb-sans-heading text-[28px] leading-[1.18] text-[var(--text-primary)]">
                運命の1台を探す
              </h3>
              <p className="mt-3 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                整理した判断軸を、相場や在庫の確認へつなげます。
              </p>

              <Button
                asChild
                size="lg"
                className="mt-6 w-full rounded-full text-[12px] font-semibold tracking-[0.08em]"
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

              <p className="mt-4 text-[10px] text-[var(--text-tertiary)]">
                {affiliateUrl ? "外部サイトへ移動します" : "ページへ移動します"}
              </p>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
