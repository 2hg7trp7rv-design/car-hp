import Link from "next/link";

import { cn } from "@/lib/utils";

type Tone = "info" | "note" | "warn" | "accent";

type CalloutConfig = {
  type: "callout";
  tone?: Tone;
  title?: string;
  body?: string;
  items?: string[];
};

type StepsConfig = {
  type: "steps";
  title?: string;
  steps: string[];
};

type CardsConfig = {
  type: "cards";
  title?: string;
  cards: Array<{ title: string; body?: string; href?: string; badge?: string }>;
};

type KvConfig = {
  type: "kv";
  title?: string;
  rows: Array<[string, string]>;
};

type UnknownConfig = Record<string, unknown> & { type?: string };

type Props = {
  config: unknown;
  className?: string;
};

function toneClasses(tone: Tone) {
  switch (tone) {
    case "warn":
      return {
        border: "border-[rgba(192,124,89,0.28)]",
        bg: "bg-[rgba(241,226,216,0.78)]",
        title: "text-[#8F5B3E]",
        body: "text-[var(--text-secondary)]",
      };
    case "note":
      return {
        border: "border-[rgba(31,28,25,0.10)]",
        bg: "bg-[rgba(238,231,222,0.72)]",
        title: "text-[var(--text-primary)]",
        body: "text-[var(--text-secondary)]",
      };
    case "accent":
      return {
        border: "border-[rgba(122,135,108,0.24)]",
        bg: "bg-[rgba(228,235,224,0.76)]",
        title: "text-[var(--accent-strong)]",
        body: "text-[var(--text-secondary)]",
      };
    default:
      return {
        border: "border-[rgba(135,152,166,0.24)]",
        bg: "bg-[rgba(229,235,239,0.78)]",
        title: "text-[var(--text-primary)]",
        body: "text-[var(--text-secondary)]",
      };
  }
}

function asObject(v: unknown): v is UnknownConfig {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function safeString(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function safeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function renderFallback(config: UnknownConfig) {
  const pretty = JSON.stringify(config, null, 2);
  return (
    <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] shadow-soft-card">
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">
          RICH BLOCK
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
          このブロックは type が未対応のため、データをそのまま表示しています。
        </p>
      </div>
      <pre className="max-h-[520px] overflow-auto border-t border-[rgba(31,28,25,0.08)] bg-[rgba(251,248,243,0.96)] p-5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
        {pretty}
      </pre>
    </div>
  );
}

export function CbjRichBlock({ config, className }: Props) {
  if (!asObject(config)) return null;

  const type = safeString(config.type).toLowerCase();

  if (type === "callout") {
    const c = config as unknown as CalloutConfig;
    const tone = (c.tone ?? "accent") as Tone;
    const styles = toneClasses(tone);
    const title = safeString(c.title) || "補足";
    const body = safeString(c.body);
    const items = safeStringArray(c.items);

    return (
      <div
        className={cn(
          "mt-6 overflow-hidden rounded-[24px] border shadow-soft-card",
          styles.border,
          styles.bg,
          className,
        )}
      >
        <div className="px-5 py-4">
          <p className={cn("text-[10px] font-semibold tracking-[0.22em]", styles.title)}>
            {title}
          </p>
          {body ? (
            <p className={cn("mt-2 text-[13px] leading-relaxed", styles.body)}>{body}</p>
          ) : null}

          {items.length ? (
            <ul className={cn("mt-3 space-y-2 text-[13px]", styles.body)}>
              {items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[0.62em] h-[5px] w-[5px] shrink-0 rounded-full bg-current opacity-60" />
                  <span className="flex-1">{it}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    );
  }

  if (type === "steps") {
    const c = config as unknown as StepsConfig;
    const title = safeString(c.title) || "手順";
    const steps = safeStringArray(c.steps);
    if (!steps.length) return null;

    return (
      <div
        className={cn(
          "mt-6 overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] p-5 shadow-soft-card",
          className,
        )}
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">{title}</p>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.15em] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(122,135,108,0.12)] text-[var(--accent-strong)] text-[11px] font-bold">
                {i + 1}
              </span>
              <span className="cb-stage-body cb-stage-body-strong">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (type === "cards") {
    const c = config as unknown as CardsConfig;
    const title = safeString(c.title);
    const cards = Array.isArray(c.cards) ? c.cards : [];
    if (!cards.length) return null;

    return (
      <div className={cn("mt-6", className)}>
        {title ? (
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">{title}</p>
        ) : null}
        <div className={cn("mt-3 grid gap-3", cards.length >= 2 ? "sm:grid-cols-2" : "")}>
          {cards.map((card, i) => {
            const t = safeString(card?.title) || "";
            const b = safeString(card?.body);
            const href = safeString(card?.href);
            const badge = safeString(card?.badge);

            const inner = (
              <div className="overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] p-5 shadow-soft-card transition hover:-translate-y-[1px] hover:border-[rgba(122,135,108,0.32)]">
                <div className="flex items-center gap-2">
                  {badge ? (
                    <span className="inline-flex items-center rounded-full border border-[rgba(122,135,108,0.22)] bg-[rgba(122,135,108,0.12)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--accent-strong)]">
                      {badge}
                    </span>
                  ) : null}
                  <p className="serif-heading text-[16px] text-[var(--text-primary)]">{t}</p>
                </div>
                {b ? (
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">{b}</p>
                ) : null}
              </div>
            );

            if (href && !isHttpUrl(href)) {
              return (
                <Link key={i} href={href} className="block">
                  {inner}
                </Link>
              );
            }
            if (href && isHttpUrl(href)) {
              return (
                <a key={i} href={href} target="_blank" rel="noreferrer" className="block">
                  {inner}
                </a>
              );
            }
            return <div key={i}>{inner}</div>;
          })}
        </div>
      </div>
    );
  }

  if (type === "kv") {
    const c = config as unknown as KvConfig;
    const title = safeString(c.title);
    const rows = Array.isArray(c.rows) ? c.rows : [];
    if (!rows.length) return null;

    return (
      <div
        className={cn(
          "mt-6 overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] shadow-soft-card",
          className,
        )}
      >
        {title ? (
          <div className="border-b border-[rgba(31,28,25,0.08)] px-5 py-4">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">{title}</p>
          </div>
        ) : null}
        <dl className="divide-y divide-[rgba(31,28,25,0.08)]">
          {rows.map((pair, i) => {
            const k = safeString(pair?.[0]);
            const v = safeString(pair?.[1]);
            if (!k && !v) return null;
            return (
              <div key={i} className="grid gap-2 px-5 py-4 sm:grid-cols-[160px_1fr]">
                <dt className="text-[11px] font-semibold tracking-[0.14em] text-[var(--text-secondary)]">
                  {k}
                </dt>
                <dd className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{v}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  }

  return renderFallback(config);
}
