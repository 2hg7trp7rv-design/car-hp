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
        border: "border-amber-300/35",
        bg: "bg-amber-400/10",
        title: "text-amber-900",
        body: "text-amber-950/80",
      };
    case "note":
      return {
        border: "border-slate-200/70",
        bg: "bg-slate-100/50",
        title: "text-slate-900",
        body: "text-slate-700",
      };
    case "accent":
      return {
        border: "border-[#0ABAB5]/35",
        bg: "bg-[#0ABAB5]/10",
        title: "text-[#0B3B3A]",
        body: "text-[#0B3B3A]/80",
      };
    default:
      return {
        border: "border-sky-300/35",
        bg: "bg-sky-400/10",
        title: "text-sky-950",
        body: "text-sky-950/80",
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
  // 本文中の JSON を “落とさない” ための最低限。
  // 見た目は控えめにしつつ、データは確認可能にする。
  const pretty = JSON.stringify(config, null, 2);
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#222222]/10 bg-white shadow-soft">
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
          RICH BLOCK
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/75">
          このブロックは type が未対応のため、データをそのまま表示しています。
        </p>
      </div>
      <pre className="max-h-[520px] overflow-auto border-t border-[#222222]/10 bg-[#0B1220] p-5 text-[11px] leading-relaxed text-white/80">
        {pretty}
      </pre>
    </div>
  );
}

export function CbjRichBlock({ config, className }: Props) {
  if (!asObject(config)) return null;

  const type = safeString(config.type).toLowerCase();

  // ---- callout
  if (type === "callout") {
    const c = config as unknown as CalloutConfig;
    const tone = (c.tone ?? "accent") as Tone;
    const styles = toneClasses(tone);
    const title = safeString(c.title) || "NOTE";
    const body = safeString(c.body);
    const items = safeStringArray(c.items);

    return (
      <div
        className={cn(
          "mt-6 overflow-hidden rounded-2xl border shadow-soft",
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
            <p className={cn("mt-2 text-[12px] leading-relaxed", styles.body)}>{body}</p>
          ) : null}

          {items.length ? (
            <ul className={cn("mt-3 space-y-2 text-[12px]", styles.body)}>
              {items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[0.55em] h-[5px] w-[5px] shrink-0 rounded-full bg-current opacity-60" />
                  <span className="flex-1">{it}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    );
  }

  // ---- steps
  if (type === "steps") {
    const c = config as unknown as StepsConfig;
    const title = safeString(c.title) || "STEP";
    const steps = safeStringArray(c.steps);
    if (!steps.length) return null;

    return (
      <div
        className={cn(
          "mt-6 overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur",
          className,
        )}
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] text-white/70">{title}</p>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.15em] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#0ABAB5] text-[11px] font-bold">
                {i + 1}
              </span>
              <span className="cb-stage-body cb-stage-body-strong text-white/85">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // ---- cards
  if (type === "cards") {
    const c = config as unknown as CardsConfig;
    const title = safeString(c.title);
    const cards = Array.isArray(c.cards) ? c.cards : [];
    if (!cards.length) return null;

    return (
      <div className={cn("mt-6", className)}>
        {title ? (
          <p className="text-[10px] font-semibold tracking-[0.22em] text-white/70">{title}</p>
        ) : null}
        <div className={cn("mt-3 grid gap-3", cards.length >= 2 ? "sm:grid-cols-2" : "")}
        >
          {cards.map((card, i) => {
            const t = safeString(card?.title) || "";
            const b = safeString(card?.body);
            const href = safeString(card?.href);
            const badge = safeString(card?.badge);

            const inner = (
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur transition hover:bg-white/10">
                <div className="flex items-center gap-2">
                  {badge ? (
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/85">
                      {badge}
                    </span>
                  ) : null}
                  <p className="serif-heading text-[14px] text-white">{t}</p>
                </div>
                {b ? (
                  <p className="mt-3 text-[12px] leading-relaxed text-white/75">{b}</p>
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

  // ---- kv (key-value)
  if (type === "kv") {
    const c = config as unknown as KvConfig;
    const title = safeString(c.title);
    const rows = Array.isArray(c.rows) ? c.rows : [];
    if (!rows.length) return null;

    return (
      <div
        className={cn(
          "mt-6 overflow-hidden rounded-2xl border border-[#222222]/10 bg-white shadow-soft",
          className,
        )}
      >
        {title ? (
          <div className="border-b border-[#222222]/10 px-5 py-4">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">{title}</p>
          </div>
        ) : null}
        <dl className="divide-y divide-[#222222]/10">
          {rows.map((pair, i) => {
            const k = safeString(pair?.[0]);
            const v = safeString(pair?.[1]);
            if (!k && !v) return null;
            return (
              <div key={i} className="grid gap-2 px-5 py-4 sm:grid-cols-[160px_1fr]">
                <dt className="text-[11px] font-semibold tracking-[0.14em] text-[#222222]/70">
                  {k}
                </dt>
                <dd className="text-[12px] leading-relaxed text-[#222222]/80">{v}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  }

  return renderFallback(config);
}
