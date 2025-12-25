# docs/DATA_SCHEMAS

JSON（data/）の“最低限守るべき”スキーマ。詳細は `lib/content-types.ts` を参照。

## 共通（BaseContentMeta）必須
- `id` (string): 一意
- `slug` (string): URLに使う。一意
- `type` (string): "HERITAGE" / "CAR" / "COLUMN" / "GUIDE"
- `status` (string): "draft" / "published" / "archived"
- `title` (string)

### 共通 推奨（できれば入れる）
- `summary` / `seoTitle` / `seoDescription`
- `publishedAt`（記事系）
- `heroImage` or `imageUrl`（カード・OGに効く）
- `relatedCarSlugs` / `relatedGuideSlugs` / `relatedColumnSlugs` / `relatedHeritageSlugs`

## HERITAGE（data/heritage.json）
最低限:
- 上の共通必須
- `lead`（導入）
- `sections`（本文ブロックの配列）

推奨:
- `heroImage`
- `kind`（ERA / MODEL / TECHNOLOGY 等）
- `maker` / `brandName`
- `keyModels` / `highlights`

## COLUMN（data/columns.json）
最低限:
- 共通必須
- `body`

推奨:
- `category`
- `heroImage`
- `toc` / `readingTimeMinutes`

## GUIDE（data/guides.json）
最低限:
- 共通必須
- `body`

推奨:
- `category`
- `heroImage`
- `readMinutes`
- `toc`

## CARS（data/cars.json）
最低限:
- 共通必須
- `name`
- `maker`

推奨:
- 画像（`imageUrl` など）
- 回遊（関連スラッグ群）
- スペック/維持（コスト、弱点、注意点）

## 画像パスの原則
- ローカル画像は `/images/...` で参照し、実体は `public/images/...`
- 存在確認は `npm run validate` が警告を出す
 - 表示側の保険として、欠け画像は自動的に `.../images/_fallback/placeholder.svg` にフォールバックする（機能維持のための保護）
