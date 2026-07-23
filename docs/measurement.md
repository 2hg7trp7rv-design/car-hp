# 計測設計書（GA4）

## イベント一覧

実装: `lib/analytics/events.ts`。全イベントは `page_type` / `content_id` を基本パラメータに持つ。

| イベント名 | 発火タイミング | 主なパラメータ |
|---|---|---|
| `outbound_click` | 外部リンクのクリック | url, monetize_key, partner, position, cta_id |
| `affiliate_click` | アフィリエイトリンクのクリック（outbound_click と併発） | partner, position, content_id, monetize_key, url, variant |
| `internal_nav_click` | サイト内導線クリック（記事内CTA・フッター等） | from_type, to_type, from_id, to_id, shelf_id, nav_id |
| `internal_nav_impression` | 棚・導線の表示 | shelf_id, variant |
| `cta_impression` | マネタイズCTAの表示（同一ページ×同一CTAで1回） | monetize_key, cta_id, position, variant |
| `scroll_depth` | スクロール深度 | depth |
| `next_read_click` | 次に読む記事のクリック | from_id, to_id |
| `guide_filter_apply` / `cars_filter_apply` | 一覧フィルタ適用 | q, sort, category 等 |
| `site_search` | サイト内検索 | query, results_count |
| `experiment_assign` | A/B テスト配属 | experiment_id, variant |

## 命名規則

- イベント名: snake_case の動詞_対象（例: `affiliate_click`）
- パラメータ: snake_case 基本（`page_type`, `content_id`, `monetize_key`）
- `position`: 画面上の位置。`guide_bottom` / `guide_mid` / `hub_top` / `decide_*` 等
- `partner`: 提携先識別子。`data/monetize/partners.json` のキーと揃える

## UTM 規約（SNS 等の流入用）

- `utm_source`: 媒体名（`instagram`, `x`, `note` 等）
- `utm_medium`: `social` / `social_bio` / `newsletter`
- `utm_campaign`: 企画識別子（例: `decide_launch_2026`）
- `utm_content`: クリエイティブ識別子（任意）

## KPI の見方

- 記事 → ハブ導線: `internal_nav_click` の `to_type=hub` 件数と遷移率
- マネタイズ反応率: `affiliate_click` ÷ `cta_impression`（position / partner 別）
- 判断ハブ: `page_type=hub` かつ `content_id=decide` の PV・`affiliate_click`
- 週次で partner × position の CTR を見て、ブロックの配置と文言を見直す
