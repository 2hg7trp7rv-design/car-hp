# GA4でGUIDE（最後の砦）を“見れる状態”にする手順

このドキュメントは、GUIDE/HUBの改善を回すために「何を見ればいいか」を最短でまとめたものです。
（外部成約が取れない前提でも、内部データで勝ち筋を作れます）

---

## 1. まず確認するイベント（最低限）

### (A) HUB入口の勝ち負け
- event_name: `experiment_assign`
  - params: `experiment_id`, `variant`, `page_type`, `content_id`
- event_name: `outbound_click`
  - params: `monetize_key`, `cta_id`, `page_type`, `content_id`, `position`

見方：
- `experiment_assign` で「A/Bがどう割り当たったか」を確認
- `outbound_click` で「どの入口（cta_id）が踏まれたか」を確認

### (B) 末尾CTAが“見られているか”
- event_name: `cta_impression`
  - params: `monetize_key`, `cta_id`, `page_type`, `content_id`, `position`, `variant`
- event_name: `outbound_click`（クリック）

見方：
- impression が増えない = 末尾まで読まれていない（構成/導線の問題）
- impression はあるが click が伸びない = 末尾CTAの文言/棚構成の問題

### (C) 一覧のフィルタが使われているか
- event_name: `guide_filter_apply`
  - params: `query`, `category`, `tag`, `sort`, `result_count`

見方：
- 使われないなら、入口カード（HUB）を強めるのが先
- 使われるのに result_count が極端に少ないなら、タグ/カテゴリ設計が弱い

---

## 2. GA4での確認（最短）

### DebugView（導入直後の動作確認）
1. GA4 → 管理 → DebugView
2. サイトを開いて以下を実行
   - /guide を開く → フィルタ操作 → `guide_filter_apply`
   - HUBページを開く → `experiment_assign` が飛ぶ
   - GUIDE詳細を開く → 下までスクロール → `cta_impression`

DebugViewで見えれば、計測の配線はOK。

### Explorations（普段見る用）
1. GA4 → 探索（Explorations） → 自由形式
2. 変数に追加
   - ディメンション: `event_name`, `content_id`, `page_type`, `monetize_key`, `cta_id`, `variant`, `experiment_id`
   - 指標: `イベント数`, `ユーザー数`
3. フィルタ
   - event_name = `outbound_click`（or `cta_impression`）
4. 行
   - `content_id` → `cta_id`（or `monetize_key`）

---

## 3. 勝ちパターン固定の判断（データが少ない時のルール）

最低ライン（目安）：
- HUBごとに「主CTAのクリック」が 30 回以上

固定の考え方：
- クリックが明確に多い方を固定（A/Bを止める）
- 差が僅差なら固定しない（もう少し回す）

固定方法：
- Vercel 環境変数 `NEXT_PUBLIC_AB_OVERRIDES` に `hub-sell=A` のように指定

---

## 4. よくある“数字が伸びない”原因（チェック順）

1) `cta_impression` が少ない
- 末尾まで読まれていない（冒頭の価値提示/構成が弱い）

2) `cta_impression` はあるが `outbound_click` が少ない
- CTAの文言が弱い / 棚の順番が弱い / 迷いが残っている

3) HUBは踏まれるが外部クリックが少ない
- 入口カードの約束（ベネフィット）が弱い
- 比較の前提（条件）が揃っていない

---

（補足）
イベント名・paramsは `lib/analytics/events.ts` と各コンポーネント内で送っています。
