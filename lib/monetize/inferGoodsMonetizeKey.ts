// lib/monetize/inferGoodsMonetizeKey.ts

/**
 * タグ/テキストから「1枠だけ」差し込むための monetizeKey 推定。
 * - Column: タグ/カテゴリ/タイトル中心
 * - Cars: メンテ/弱点テキストも含める
 *
 * ※ 必要に応じて後から精度を上げられるよう、単純なルールベースで実装。
 */

export type GoodsMonetizeKey =
  | "goods_nagara_carwash"
  | "goods_carclub"
  | "goods_hidya"
  | "goods_drive_recorder"
  | "goods_jump_starter"
  | "goods_child_seat"
  | "goods_interior_clean"
  | "goods_car_wash_coating";

type TextLike = string | null | undefined;

type ColumnLike = {
  category?: TextLike;
  title?: TextLike;
  tags?: string[] | null | undefined;
};

type CarLike = {
  name?: TextLike;
  maker?: TextLike;
  bodyType?: TextLike;
  segment?: TextLike;
  tags?: string[] | null | undefined;
  maintenanceNotes?: string[] | null | undefined;
  troubleTrends?: string[] | null | undefined;
};

function norm(s: string): string {
  return s.toLowerCase();
}

function joinText(parts: Array<TextLike | string[] | null | undefined>): string {
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) {
      for (const v of p) {
        if (typeof v === "string" && v.trim()) out.push(v.trim());
      }
      continue;
    }
    if (typeof p === "string" && p.trim()) out.push(p.trim());
  }
  return norm(out.join(" "));
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((k) => haystack.includes(norm(k)));
}

const KEYWORDS: Array<{ key: GoodsMonetizeKey; words: string[] }> = [
  {
    key: "goods_hidya",
    words: [
      "ライト",
      "led",
      "hid",
      "ヘッドライト",
      "フォグ",
      "バルブ",
      "プロジェクター",
      "ウインカー",
      "ウィンカー",
      "カットライン",
      "光量",
      "照射",
      "車検対応",
    ],
  },
  {
    key: "goods_nagara_carwash",
    words: [
      "洗車",
      "コーティング",
      "撥水",
      "親水",
      "艶",
      "シャンプー",
      "フォーム",
      "泡",
      "クロス",
      "マイクロファイバー",
      "スポンジ",
      "ムートン",
      "鉄粉",
      "水垢",
      "ウォータースポット",
      "スノーフォーム",
      "バケツ",
      "グローブ",
    ],
  },
  {
    key: "goods_drive_recorder",
    words: [
      "ドラレコ",
      "ドライブレコーダー",
      "前後カメラ",
      "駐車監視",
      "360度",
    ],
  },
  {
    key: "goods_jump_starter",
    words: [
      "バッテリー",
      "バッテリー上がり",
      "ジャンプスターター",
      "ジャンプスタート",
    ],
  },
  {
    key: "goods_child_seat",
    words: ["チャイルドシート", "ジュニアシート", "isofix", "i-size"],
  },
  {
    key: "goods_interior_clean",
    words: [
      "車内",
      "内装",
      "レザー",
      "革",
      "布",
      "シート",
      "クリーナー",
      "ルームクリーニング",
      "消臭",
    ],
  },
];

function pickFromText(text: string): GoodsMonetizeKey | null {
  for (const row of KEYWORDS) {
    if (includesAny(text, row.words)) return row.key;
  }
  return null;
}

/**
 * Column 用：タグ/カテゴリ/タイトルから推定
 * - まずはキーワードマッチ
 * - それでも無ければ、メンテ/トラブル系は「CARCLUB」に寄せる（汎用カー用品）
 */
export function inferGoodsMonetizeKeyForColumn(input: ColumnLike): GoodsMonetizeKey | null {
  const text = joinText([input.title, input.category, input.tags ?? []]);
  const direct = pickFromText(text);
  if (direct) return direct;

  const cat = norm(String(input.category ?? ""));
  const tagsText = joinText([input.tags ?? []]);

  // メンテ/トラブルは、汎用の「カー用品」導線を 1枠だけ出す
  const isMaintOrTrouble =
    cat.includes("maintenance") || cat.includes("trouble") ||
    includesAny(tagsText, ["メンテナンス", "整備", "故障", "修理", "消耗品", "維持費"]);

  return isMaintOrTrouble ? "goods_carclub" : null;
}

/**
 * Cars 用：車種ページ内のテキスト（弱点/メンテ）も含めて推定
 * - マッチなしの場合は CARCLUB をデフォルト（汎用カー用品）
 */
export function inferGoodsMonetizeKeyForCar(input: CarLike): GoodsMonetizeKey | null {
  const text = joinText([
    input.name,
    input.maker,
    input.bodyType,
    input.segment,
    input.tags ?? [],
    input.maintenanceNotes ?? [],
    input.troubleTrends ?? [],
  ]);

  const direct = pickFromText(text);
  if (direct) return direct;

  return "goods_carclub";
}
