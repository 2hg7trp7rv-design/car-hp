import { cn } from "@/lib/utils";

type FaqItem = {
  q: string;
  a: string;
};

type Props = {
  items: FaqItem[];
  className?: string;
};

export function InlineFaq({ items, className }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.88)] px-5 py-4"
        >
          <summary className="cursor-pointer list-none text-[15px] font-semibold leading-[1.65] tracking-[-0.02em] text-[var(--text-primary)]">
            <span className="inline-flex items-start gap-3">
              <span className="mt-[2px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(27,63,229,0.18)] bg-[var(--accent-subtle)] text-[11px] font-semibold tracking-[0.12em] text-[var(--accent-strong)]">
                Q
              </span>
              <span>{item.q}</span>
            </span>
          </summary>
          <div className="pl-9 pt-4 text-[13px] leading-[1.9] text-[var(--text-secondary)]">
            {item.a.split("\n").map((line, index) => (
              <p key={`${item.q}-${index}`} className={index === 0 ? "" : "mt-3"}>
                {line}
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default InlineFaq;
