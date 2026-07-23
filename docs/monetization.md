# マネタイズ導線 セットアップ

## 全体像

| 層 | 場所 |
|---|---|
| パートナー情報の単一ソース | `data/monetize/partners.json` |
| 参照ヘルパ | `lib/monetize.ts` |
| CTA カードコンポーネント | `components/monetize/MonetizeCtaCard.tsx` |
| 表示フラグ | `lib/feature-flags.ts`（`NEXT_PUBLIC_ENABLE_MONETIZATION`） |
| 記事上部の PR バッジ | `components/articleDesignSystem/CbjWorldArticlePage.tsx` |

## 表示のゲート

- **`NEXT_PUBLIC_ENABLE_MONETIZATION=true` のときだけ**、マネタイズ CTA と記事上部の PR バッジ（「この記事には広告・PRを含みます」）が表示されます。
- 未設定／`false` では一切描画されません（デフォルト OFF）。

## パートナーの登録

`data/monetize/partners.json` の各パートナー:

| フィールド | 説明 |
|---|---|
| `id` | 計測（`affiliate_click` の `partner`）に使う識別子 |
| `category` | `sell` / `inspection` / `insurance` |
| `name` | パートナー名 |
| `url` | アフィリエイト URL。**`"#"` はプレースホルダー**で、CTA は「準備中」表示になりクリックできません |
| `ctaLabel` | ボタン文言 |
| `description` | カード内の説明文 |

正式な URL が決まったら `#` を差し替えてください。推測で単価や報酬条件を記載しないでください。

## 法務・計測の約束

- **景表法**: PR を含む導線には必ず明示します（記事上部バッジ＋CTA カードの「PR」表記）。
- **リンク属性**: 外部 CTA は常に `rel="nofollow sponsored noopener noreferrer"` を付与します（`MonetizeCtaCard` 内で保証）。
- **計測**: クリック時に `affiliate_click`（partner / position / content_id）を GA4 へ送信します。イベント規約は `docs/measurement.md` を参照。
- 保険カテゴリの CTA には「特定の保険商品を推奨するものではありません」の注記を付けています。

## 旧来のマネタイズ資産との関係

`components/monetize/HubCtaCard.tsx` と `data/monetizeMap.json` は既存資産として残しています。新規の導線は `MonetizeCtaCard` + `data/monetize/partners.json` を使い、段階的に統合してください。
