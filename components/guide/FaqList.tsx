import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqListProps = {
  title: string;
  description?: string;
  items: FaqItem[];
  theme?: "light" | "dark";
  className?: string;
};

export function FaqList(props: FaqListProps) {
  const { title, description, items, theme = "light", className } = props;
  const isDark = theme === "dark";

  const headText = isDark ? "text-slate-100" : "text-slate-900";
  const subText = isDark ? "text-slate-300" : "text-slate-700";
  const mutedText = isDark ? "text-slate-400" : "text-slate-600";
  const border = isDark ? "border-white/10" : "border-slate-200/80";

  return (
    <GlassCard
      padding="none"
      magnetic={false}
      className={cn(
        "overflow-hidden",
        "rounded-3xl",
        "border",
        border,
        isDark ? "bg-white/5" : "bg-white/70",
        className,
      )}
    >
      <div className="p-6">
        <h3 className={cn("serif-heading text-lg", headText)}>{title}</h3>
        {description ? (
          <p className={cn("mt-2 text-[12px] leading-relaxed", mutedText)}>{description}</p>
        ) : null}

        <div className="mt-4 space-y-3">
          {items.map((item, idx) => (
            <details
              key={`${item.q}-${idx}`}
              className={cn(
                "rounded-2xl",
                "border",
                isDark ? "border-white/10 bg-white/0" : "border-slate-200/70 bg-white/0",
                "px-4 py-3",
              )}
            >
              <summary
                className={cn(
                  "cursor-pointer list-none",
                  "select-none",
                  "flex items-start justify-between gap-3",
                  headText,
                  "text-[13px] font-semibold",
                )}
              >
                <span className="leading-relaxed">{item.q}</span>
                <span className={cn("mt-0.5 text-[11px] font-normal", mutedText)}>
                  開く
                </span>
              </summary>

              <div className={cn("mt-3 text-[12px] leading-relaxed", subText)}>
                {item.a.split("\n").map((line, i) => (
                  <p key={i} className={cn(i > 0 ? "mt-2" : "")}>{line}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default FaqList;
