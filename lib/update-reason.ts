function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text);
}

export function humanizeUpdateReason(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value) return "本文を更新しました。";

  if (hasJapanese(value) && !/^[a-z0-9._-]+$/i.test(value)) {
    return value;
  }

  const normalized = value.toLowerCase();

  if (
    normalized === "initial-import" ||
    normalized === "initial import" ||
    normalized === "first-publish" ||
    normalized === "first-release"
  ) {
    return "初版公開";
  }

  if (/pricing|price|market/.test(normalized)) {
    return "価格と相場の情報を更新しました。";
  }

  if (/source|citation|reference/.test(normalized)) {
    return "出典と本文を更新しました。";
  }

  if (/spec|technical/.test(normalized)) {
    return "仕様情報を更新しました。";
  }

  if (/rewrite|refresh|index-upgrade|overhaul|upgrade|expand|content/.test(normalized)) {
    return "本文を見直し、内容を更新しました。";
  }

  if (/seo|title|description/.test(normalized)) {
    return "見出しと説明文を調整しました。";
  }

  return value.replace(/[-_]+/g, " ");
}
