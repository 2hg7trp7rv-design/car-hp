import type { ReactNode } from "react";

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; label: string; href: string }
  | { type: "tooltip"; term: string; tip: string };

function pushText(out: InlineToken[], value: string) {
  if (!value) return;
  // Remove visible asterisks ("*", "＊") as per project rule.
  const cleaned = value.replace(/[＊*]/g, "");
  if (!cleaned) return;

  const prev = out[out.length - 1];
  if (prev && prev.type === "text") {
    prev.value += cleaned;
    return;
  }
  out.push({ type: "text", value: cleaned });
}

function parseInlineMarkdown(input: string): InlineToken[] {
  const text = (input ?? "").toString();
  const out: InlineToken[] = [];

  let i = 0;
  while (i < text.length) {
    const nextLink = text.indexOf("[", i);
    const nextBold = text.indexOf("**", i);
    const nextTooltip = text.indexOf("{{", i);

    const candidates = [
      { kind: "link" as const, idx: nextLink },
      { kind: "bold" as const, idx: nextBold },
      { kind: "tooltip" as const, idx: nextTooltip },
    ].filter((x) => x.idx >= 0);

    if (candidates.length === 0) {
      pushText(out, text.slice(i));
      break;
    }

    candidates.sort((a, b) => a.idx - b.idx);
    const next = candidates[0];

    if (next.idx > i) {
      pushText(out, text.slice(i, next.idx));
    }

    const rest = text.slice(next.idx);

    if (next.kind === "tooltip") {
      const end = text.indexOf("}}", next.idx + 2);
      if (end >= 0) {
        const inside = text.slice(next.idx + 2, end);
        const pipeIdx = (() => {
          const i1 = inside.indexOf("|");
          if (i1 >= 0) return i1;
          return inside.indexOf("｜");
        })();

        if (pipeIdx > 0 && pipeIdx < inside.length - 1) {
          const term = inside.slice(0, pipeIdx).trim();
          const tip = inside.slice(pipeIdx + 1).trim();

          if (term && tip) {
            out.push({ type: "tooltip", term, tip });
            i = end + 2;
            continue;
          }
        }
      }

      // Not a valid tooltip token.
      pushText(out, text.slice(next.idx, Math.min(text.length, next.idx + 2)));
      i = next.idx + 2;
      continue;
    }

    if (next.kind === "link") {
      const m = rest.match(/^\[([^\]]+)\]\(([^\)]+)\)/);
      if (m) {
        out.push({ type: "link", label: (m[1] ?? "").trim(), href: (m[2] ?? "").trim() });
        i = next.idx + m[0].length;
        continue;
      }

      // Not a valid markdown link.
      pushText(out, text[next.idx]);
      i = next.idx + 1;
      continue;
    }

    // bold
    const b = rest.match(/^\*\*([^*]+)\*\*/);
    if (b) {
      out.push({ type: "bold", value: b[1] ?? "" });
      i = next.idx + b[0].length;
      continue;
    }

    // Fallback: treat as plain text (but "*" will be stripped by pushText).
    pushText(out, text[next.idx]);
    i = next.idx + 1;
  }

  return out;
}

export function renderInlineMarkdown(text: string): ReactNode {
  const tokens = parseInlineMarkdown(text);

  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === "text") {
          return <span key={idx}>{t.value}</span>;
        }

        if (t.type === "bold") {
          // Allow links inside bold text (rare, but safe).
          return (
            <strong key={idx} className="font-semibold text-white">
              {renderInlineMarkdown(t.value)}
            </strong>
          );
        }

        if (t.type === "tooltip") {
          return (
            <span
              key={idx}
              className="cbj-tooltip"
              data-tip={t.tip}
              tabIndex={0}
              aria-label={`${t.term}：${t.tip}`}
            >
              {renderInlineMarkdown(t.term)}
            </span>
          );
        }

        const href = (t.href ?? "").toString();
        const label = t.label || href;

        // Internal markdown links are intentionally rendered as plain text here,
        // because internal navigation is rendered as cards below (rule (1)).
        if (href.startsWith("/")) {
          return <span key={idx} className="font-medium text-white">{label}</span>;
        }

        return (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/35 underline-offset-4 hover:decoration-[#0ABAB5]"
          >
            {label}
          </a>
        );
      })}
    </>
  );
}
