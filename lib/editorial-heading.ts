function normalizeDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  );
}

export function normalizeEditorialHeadingLabel(raw: string | null | undefined): string {
  const original = String(raw ?? "").trim();
  if (!original) return "";

  let text = original
    .replace(/[【】]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[「」『』]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  text = text.replace(/^(?:序章|第[0-9０-９一二三四五六七八九十]+章)\s*[：:－-]?\s*/u, "");
  text = text.replace(/^CHAPTER\s*[0-9０-９]+\s*[：:－-]?\s*/iu, "");

  text = text.replace(/^STEP\s*([0-9０-９]+)\s*[：:．.、－-]?\s*/iu, (_, rawStep) => {
    return `手順${normalizeDigits(String(rawStep))} `;
  });
  text = text.replace(/^STEP([0-9０-９]+)\s*[：:．.、－-]?\s*/iu, (_, rawStep) => {
    return `手順${normalizeDigits(String(rawStep))} `;
  });

  text = text.replace(/^FAQ\s*[：:－-]?\s*/iu, "よくある質問 ");
  text = text.replace(/^Q\s*[：:－-]?\s*/iu, "Q. ");
  text = text.replace(/^A\s*[：:－-]?\s*/iu, "A. ");

  text = text.replace(/^\d+(?:\.\d+)?\s*[.．、:：－-]?\s*/, "");

  text = text
    .replace(/^(?:結論|まとめ|要点|要約)\s*[：:－-]?\s*/u, "")
    .replace(/^(?:チェックリスト|チェックポイント)\s*[：:－-]?\s*/u, "");

  if (/^(?:本文|本題)$/u.test(text)) return "ここから読む";
  if (/(?:実務メモ|補足)/u.test(text)) return "確認しておきたいこと";

  return text.trim() || original;
}
