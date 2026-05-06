function stripMarkdown(text: string): string {
  return String(text ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*(?:[-*•・]|\d+[.)．、])\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripEditorialPrefixes(text: string): string {
  return text
    .replace(
      /^(?:結論|まとめ|要点|要約|本文|導入|序章|補足|チェックポイント|チェックリスト|この記事で分かること|まず押さえるポイント|まず押さえる論点|先に確認しておきたいこと|購入前に確認したいこと|読み進める前に見ておきたい基準|転換点\s*\d+|CHAPTER\s*\d+)\s*[：:－-]?\s*/iu,
      "",
    )
    .replace(/^この記事は[「『].+?[」』]をテーマに、?\s*/u, "")
    .replace(/^第[0-9０-９一二三四五六七八九十]+章\s*[：:－-]?\s*/u, "")
    .replace(/^\s*[「『“”"'＂]+/, "")
    .replace(/[」』“”"'＂]+\s*$/u, "")
    .trim();
}

function splitSentences(text: string): string[] {
  const normalized = String(text ?? "").replace(/\n+/g, " ").trim();
  if (!normalized) return [];
  return (normalized.match(/[^。！？.!?]+[。！？.!?]?/gu) ?? [normalized])
    .map((part) => part.trim())
    .filter(Boolean);
}

function isUsableQuote(text: string): boolean {
  const normalized = String(text ?? "").trim();
  if (!normalized) return false;
  if (normalized.length < 16) return false;
  if (normalized.length > 120) return false;
  if (/^(?:公開|更新)\s*\d/u.test(normalized)) return false;
  if (/^(?:ガイド|視点|系譜|車種)一覧/u.test(normalized)) return false;
  if (/(?:読む順番|静かな誌面|静かな図版)/u.test(normalized)) return false;
  return true;
}

function normalizeCandidate(text: string): string {
  return stripEditorialPrefixes(stripMarkdown(text))
    .replace(/\s*[／/]\s*/g, "、")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildEditorialPullQuote(
  candidates: Array<string | null | undefined>,
): string | null {
  for (const raw of candidates) {
    const normalized = normalizeCandidate(raw ?? "");
    if (!normalized) continue;

    const sentences = splitSentences(normalized);
    if (sentences.length > 0) {
      let picked = "";
      for (const sentence of sentences) {
        const clean = stripEditorialPrefixes(sentence);
        if (!clean) continue;
        if ((picked + clean).length > 92) break;
        picked += clean;
        if (picked.length >= 28) break;
      }
      if (isUsableQuote(picked)) return picked;
    }

    if (isUsableQuote(normalized)) return normalized;
    const shortened = normalized.slice(0, 90).trim();
    if (isUsableQuote(shortened)) return shortened;
  }

  return null;
}
