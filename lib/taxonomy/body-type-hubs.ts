// lib/taxonomy/body-type-hubs.ts

import { normalizeBodyTypeLabel } from "@/lib/taxonomy/body-types";
import { toSlug } from "@/lib/taxonomy/slug";
import { toStableKey } from "@/lib/taxonomy/key";

export type BodyTypeInfo = {
  key: string; // URL/ルーティング用
  label: string; // 表示用（日本語）
  count: number;
};

function safeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
}

/**
 * ボディタイプのキーを決める（手動マップ優先、次に slug、最後に hash）。
 *
 * NOTE:
 * - "SUV/クロスオーバー" のように "/" を含むラベルは URL にそのまま載せられないため必須。
 */
const BODY_TYPE_KEY_OVERRIDES: Record<string, string> = {
  "セダン": "sedan",
  "クーペ": "coupe",
  "オープンカー": "open",
  "SUV/クロスオーバー": "suv-crossover",
  "SUV": "suv-crossover",
  "ハッチバック": "hatchback",
  "軽スポーツ": "kei-sports",
  "軽オープン": "kei-open",
  "軽ハッチバック": "kei-hatchback",
};

export function getBodyTypeKey(rawLabel: unknown): string {
  const label = normalizeBodyTypeLabel(safeString(rawLabel));
  if (!label) return "";

  const override = BODY_TYPE_KEY_OVERRIDES[label];
  if (override) return override;

  // 英字のbodyTypeなら slug化できる
  const slug = toSlug(label);
  if (slug) return slug;

  // 日本語などは hash で安定キーを作る
  return toStableKey(label, "bt");
}

/**
 * CARS配列からボディタイプ一覧（重複排除 + 件数）を作る。
 */
export function buildBodyTypeInfos(
  cars: Array<{ bodyType?: string | null }>,
): BodyTypeInfo[] {
  const map = new Map<string, BodyTypeInfo>();

  for (const car of cars) {
    const label = normalizeBodyTypeLabel(safeString(car?.bodyType));
    if (!label) continue;

    const key = getBodyTypeKey(label);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { key, label, count: 1 });
    } else {
      existing.count += 1;
      // label が違う（表記ゆれ）場合は、長い方を残す
      if (label.length > existing.label.length) {
        existing.label = label;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "ja"),
  );
}

export function resolveBodyTypeLabel(
  bodyTypeKey: string,
  bodyTypes: BodyTypeInfo[],
): string {
  const key = String(bodyTypeKey ?? "").trim();
  if (!key) return "";
  const hit = bodyTypes.find((b) => b.key === key);
  if (hit) return hit.label;
  return key;
}
