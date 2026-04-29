import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MetaItem = {
  label: string;
  value: string;
};

type Props = {
  href: string;
  label: string;
  count: number;
  eyebrow?: string;
  summary?: string;
  samples?: string[];
  meta?: MetaItem[];
  searchHref?: string;
  searchLabel?: string;
  primaryLabel?: string;
  layout?: "feature" | "standard";
  className?: string;
};

export function TaxonomyHubCard({
  href,
  label,
  count,
  eyebrow = "一覧",
  summary,
  samples = [],
  meta = [],
  searchHref,
  searchLabel = "条件検索へ",
  primaryLabel = "一覧を見る",
  layout = "standard",
  className,
}: Props) {
  const isFeature = layout === "feature";

  return (
    <GlassCard
      as="article"
      interactive
      padding={isFeature ? "lg" : "md"}
      className={cn(
        "h-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] text-[var(--text-primary)]",
        "hover:border-[rgba(27,63,229,0.35)] hover:shadow-none",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="cb-kicker">{eyebrow}</p>
            <Link
              href={href}
              className={cn(
                "mt-4 block font-semibold leading-[1.18] tracking-[-0.04em] text-[var(--text-primary)] transition hover:text-[var(--accent-strong)]",
                isFeature ? "text-[28px] sm:text-[34px]" : "text-[22px]",
              )}
            >
              {label}
            </Link>
          </div>

          <div className="shrink-0 rounded-[20px] border border-[rgba(27,63,229,0.18)] bg-[var(--accent-subtle)] px-4 py-3 text-right">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
              掲載車種
            </div>
            <div
              className={cn(
                "mt-2 font-semibold leading-none text-[var(--accent-strong)]",
                isFeature ? "text-[30px]" : "text-[24px]",
              )}
            >
              {count}
            </div>
          </div>
        </div>

        {summary ? (
          <p className="max-w-[38rem] text-[14px] leading-[1.9] text-[var(--text-secondary)]">
            {summary}
          </p>
        ) : null}

        {samples.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
              代表車種
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {samples.slice(0, isFeature ? 5 : 4).map((sample) => (
                <span
                  key={sample}
                  className="rounded-full border border-[rgba(14,12,10,0.08)] bg-[var(--surface-2)] px-3 py-1 text-[10px] tracking-[0.14em] text-[var(--text-secondary)]"
                >
                  {sample}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {meta.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {meta.slice(0, 4).map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-[18px] border border-[rgba(14,12,10,0.08)] bg-[rgba(251,248,243,0.6)] px-4 py-3"
              >
                <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                  {item.label}
                </div>
                <div className="mt-2 text-[13px] leading-[1.75] text-[var(--text-primary)]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button asChild variant="primary" size={isFeature ? "md" : "sm"}>
            <Link href={href}>{primaryLabel}</Link>
          </Button>

          {searchHref ? (
            <Button asChild variant="outline" size={isFeature ? "md" : "sm"}>
              <Link href={searchHref}>{searchLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

export default TaxonomyHubCard;
