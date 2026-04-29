import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StickyConclusionCardProps = {
  title: string;
  bullets: string[];
  note?: string;
  cta?: {
    href: string;
    label: string;
  };
  theme?: "light" | "dark";
  className?: string;
};

export function StickyConclusionCard(props: StickyConclusionCardProps) {
  const { title, bullets, note, cta, theme = "light", className } = props;
  const isDark = theme === "dark";

  return (
    <GlassCard
      padding="none"
      magnetic={false}
      className={cn(
        "overflow-hidden rounded-[20px] border",
        isDark ? "border-[var(--border-default)] bg-[var(--surface-1)]" : "border-[var(--border-default)] bg-[rgba(228,219,207,0.42)]",
        className,
      )}
    >
      <div className="p-6">
        <p className={cn("text-[10px] font-semibold tracking-[0.2em]", isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]")}>
          結論
        </p>
        <h3 className={cn("mt-2 cb-sans-heading text-[15px] leading-snug", isDark ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]")}>
          {title}
        </h3>

        <ul className={cn("mt-4 space-y-2 text-[12px] leading-relaxed", isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]")}>
          {bullets.slice(0, 6).map((b, i) => (
            <li key={`${b}-${i}`} className="flex gap-2">
              <span className={cn("mt-[2px] inline-block h-1.5 w-1.5 rounded-full", isDark ? "bg-[rgba(27,63,229,0.8)]" : "bg-accent/80")} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {note ? (
          <p className={cn("mt-4 text-[10px] leading-relaxed", isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]")}>
            {note}
          </p>
        ) : null}

        {cta ? (
          <div className="mt-5">
            <Button asChild variant={isDark ? "surface" : "primary"} size="lg" fullWidth>
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}

export default StickyConclusionCard;
