// lib/content/inline.ts
// Tokenizer for inline formatting used by content blocks.
// Supports:
// - **bold**
// - URLs (http/https)

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "url"; value: string };

export function tokenizeInline(text: string): InlineToken[] {
  const source = text ?? "";
  if (!source) return [];

  const tokenRegex = /(\*\*.+?\*\*|https?:\/\/[^\s]+)/g;
  const out: InlineToken[] = [];

  let lastIndex = 0;
  for (const match of source.matchAll(tokenRegex)) {
    const start = match.index ?? 0;
    const token = match[0] ?? "";

    if (start > lastIndex) out.push({ type: "text", value: source.slice(lastIndex, start) });

    if (token.startsWith("**") && token.endsWith("**")) {
      out.push({ type: "bold", value: token.slice(2, -2) });
    } else if (/^https?:\/\//.test(token)) {
      out.push({ type: "url", value: token });
    } else {
      out.push({ type: "text", value: token });
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < source.length) out.push({ type: "text", value: source.slice(lastIndex) });

  return out.filter((t) => t.value.length > 0);
}
