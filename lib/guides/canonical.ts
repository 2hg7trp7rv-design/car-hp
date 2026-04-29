// lib/guides/canonical.ts
// GUIDEカテゴリの単一ソース（型の重複定義によるビルド失敗を防ぐ）

export type CanonicalGuideCategoryKey =
  | "MONEY"
  | "BUY"
  | "SELL"
  | "INSURANCE"
  | "LEASE"
  | "GOODS"
  | "MAINTENANCE"
  | "TROUBLE"
  | "DRIVING"
  | "LIFE"
  | "OTHER";
