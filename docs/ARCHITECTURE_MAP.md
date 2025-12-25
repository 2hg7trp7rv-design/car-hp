# docs/ARCHITECTURE_MAP

CAR BOUTIQUE の「どこを触ると何が変わるか」を一枚で把握するための地図。

## 主要ディレクトリ
- `app/`
  - ルーティング（Next.js App Router）
  - `app/*/[slug]/page.tsx` が個別記事ページの入口
- `data/`
  - コンテンツの正本（`cars.json / columns.json / guides.json / heritage.json`）
  - 古いデータは `data/_archive/` に隔離（運用では参照しない）
- `components/`
  - UIの部品。ページ直書きを減らし、再利用する
- `lib/`
  - 型・データ取得・整形（viewmodel）・表示用ユーティリティ
- `public/images/`
  - 画像はここ（JSONは `/images/...` で参照）

## 主要ページの入口（代表）
- HERITAGE: `app/heritage/[slug]/page.tsx`
- CARS: `app/cars/[slug]/page.tsx`
- COLUMN: `app/column/[slug]/page.tsx`
- GUIDE: `app/guide/[slug]/page.tsx`

## データから表示まで（流れ）
1) `data/*.json`（コンテンツ）
2) `lib/*`（型 + 整形 + 取得）
3) `components/*`（カード・棚・CTAなど）
4) `app/*`（ページで組み立て）

## 触る場所のガイド
- “見た目を整える” → まず `components/`、次にページ
- “文言/SEO/メタ” → `data/*.json` の該当項目（+ viewmodel）
- “回遊” → `related*Slugs` と `INTERNAL_LINKING_RULES.md`
- “壊れない保証” → `scripts/validate-content.mjs`
