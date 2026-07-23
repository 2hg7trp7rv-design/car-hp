# 計測（GA4）セットアップ

## 初期化

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_GA4_ID` | GA4 の測定 ID（例: `G-XXXXXXXXXX`）。未設定時は GA を読み込まない |
| `NEXT_PUBLIC_GA_DEBUG` | `1` で `debug_mode` 有効化（DebugView 用） |

- ローダー: `components/analytics/GoogleAnalytics.tsx`（Consent Mode v2 対応）
- 同意バナー: `components/analytics/ConsentBanner.tsx`。拒否時は `analytics_storage: denied` のまま計測しません。
- SPA 遷移の page_view は `components/analytics/PageViewTracker.tsx` が送信します。

## イベント一覧

送信ヘルパは `lib/analytics/events.ts`。

| イベント | 主なパラメータ | 発火箇所 |
|---|---|---|
| `page_view` | page_path 等 | 全ページ（PageViewTracker） |
| `outbound_click` | url, partner, position, content_id, monetize_key | 外部リンク（TrackedLink / HubCtaCard 等） |
| `affiliate_click` | partner, position, content_id, page_type, monetize_key, url | マネタイズCTA（MonetizeCtaCard） |
| `cta_impression` | monetize_key, cta_id, position, content_id | CTA 表示時（HubCtaCard 等） |
| `internal_nav_click` | from_type, to_type, to_id, nav_id | 内部リンク |
| `internal_nav_impression` | shelf_id 等 | 内部導線の表示 |
| `scroll_depth` | percent | ScrollDepthTracker |
| `site_search` | search_term | `/search` |

### affiliate_click パラメータ規約

- `partner`: `data/monetize/partners.json` の `id`（例: `sell_appraisal`）
- `position`: 設置位置の識別子（例: `decide_hub_sell`, `article_top`）
- `content_id`: 記事スラッグ。`/decide` 等の固定ページでは `decide_hub` のような固定識別子を渡す
- `"unknown"` の `content_id` は送信前に空へ正規化します（データ汚染回避）

## UTM 規約

外部メディア・SNS からの流入計測に使う UTM は以下の命名で統一します。

| パラメータ | 規約 | 例 |
|---|---|---|
| `utm_source` | 媒体名（小文字） | `x`, `instagram`, `newsletter` |
| `utm_medium` | 流入種別 | `social`, `email`, `referral` |
| `utm_campaign` | 施策名（スネークケース） | `decide_hub_launch` |
| `utm_content` | クリエイティブ／設置位置 | `profile_link`, `story_202607` |

- アフィリエイトリンク側の UTM は各 ASP の規約に従い、ここでは付与しません。
