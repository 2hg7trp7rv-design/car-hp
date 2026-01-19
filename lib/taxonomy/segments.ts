// lib/taxonomy/segments.ts

import { toSlug } from "@/lib/taxonomy/slug";
import { toStableKey } from "@/lib/taxonomy/key";

export type SegmentInfo = {
  key: string; // URL/ルーティング用
  label: string; // 表示名（日本語中心）
  count: number;
};

function safeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim();
}

/**
 * segment の表記ゆれ吸収。
 * - 空白圧縮
 * - スラッシュ周りの空白を統一
 */
export function normalizeSegmentLabel(raw: unknown): string {
  const v = safeString(raw);
  if (!v) return "";

  // 空白圧縮
  let s = v.replace(/\s+/g, " ");

  // " / " の揺れを吸収（"/" の前後の空白を一定化）
  s = s.replace(/\s*\/\s*/g, " / ");

  return s;
}

/**
 * 既知ラベルは“読みやすいキー”に固定。
 * 未知は slug -> hash の順で生成。
 */
const SEGMENT_KEY_OVERRIDES: Record<string, string> = {
  "GT": "gt",
  "クラシックGT": "classic-gt",
  "クラシックスポーツ": "classic-sports",
  "クーペ": "coupe",
  "グランドツアラー": "grand-tourer",
  "スポーツ": "sports",
  "スポーツセダン": "sports-sedan",
  "スーパーカー": "supercar",
  "スーパースポーツ": "super-sports",
  "スーパースポーツ / HPEV": "super-sports-hpev",
  "ハイパーカー": "hypercar",
  "フラッグシップ": "flagship",
  "フラッグシップGT / スポーツ": "flagship-gt-sports",
  "プレミアムGT": "premium-gt",
  "プレミアムSUV": "premium-suv",
  "プレミアムスポーツ": "premium-sports",
  "プレミアムセダン": "premium-sedan",
  "ホットハッチ": "hot-hatch",
  "ホモロゲーション": "homologation",
  "ライトウェイト": "lightweight",
  "ライトスポーツ": "light-sports",
  "ラグジュアリーセダン": "luxury-sedan",
  "ラリー系スポーツ": "rally-sports",
  "軽スポーツ": "kei-sports",
};

export function getSegmentKey(rawLabel: unknown): string {
  const label = normalizeSegmentLabel(rawLabel);
  if (!label) return "";

  const override = SEGMENT_KEY_OVERRIDES[label];
  if (override) return override;

  // 英字中心なら slug化
  const slug = toSlug(label);
  if (slug) return slug;

  // 日本語などは hash
  return toStableKey(label, "seg");
}

export function buildSegmentInfos(
  cars: Array<{ segment?: string | null }>,
): SegmentInfo[] {
  const map = new Map<string, SegmentInfo>();

  for (const car of cars) {
    const label = normalizeSegmentLabel(car?.segment);
    if (!label) continue;

    const key = getSegmentKey(label);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { key, label, count: 1 });
    } else {
      existing.count += 1;
      if (label.length > existing.label.length) {
        existing.label = label;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "ja"),
  );
}

export function resolveSegmentLabel(segmentKey: string, segments: SegmentInfo[]): string {
  const key = String(segmentKey ?? "").trim();
  if (!key) return "";
  const hit = segments.find((s) => s.key === key);
  if (hit) return hit.label;
  return key;
}
