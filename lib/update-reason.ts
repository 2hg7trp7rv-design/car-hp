const INTERNAL_CODE_PATTERNS: Array<[RegExp, string]> = [
  [/^initial-import$/i, "公開用に内容を整理しました。"],
  [/^index-upgrade$/i, "一覧導線に合わせて内容を整理しました。"],
  [/^content-rewrite-\d{4}-\d{2}-\d{2}$/i, "内容を見直し、説明を更新しました。"],
  [/^redirect-stub-\d{4}-\d{2}-\d{2}$/i, "関連ページへの導線を整理しました。"],
  [/^name-normalize-\d{4}-\d{2}-\d{2}$/i, "名称表記を整理しました。"],
  [/^data-align-\d{4}-\d{2}-\d{2}$/i, "掲載データの表記と構成を整えました。"],
  [/^tone-fix-\d{4}-\d{2}-\d{2}$/i, "本文の表現と構成を整えました。"],
  [/^(?:car|cars)-.*$/i, "公開情報の見出し・要点を見直しました。"],
  [/^heritage-.*$/i, "物語と資料の導線を見直しました。"],
];

const INTERNAL_CODE_RE = /^[a-z0-9._-]+$/i;

export function formatPublicUpdateReason(reason?: string | null): string | null {
  const raw = (reason ?? "").trim();
  if (!raw) return null;

  if (!INTERNAL_CODE_RE.test(raw)) {
    return raw;
  }

  for (const [pattern, label] of INTERNAL_CODE_PATTERNS) {
    if (pattern.test(raw)) {
      return label;
    }
  }

  return "公開情報の整備に合わせて内容を見直しました。";
}
