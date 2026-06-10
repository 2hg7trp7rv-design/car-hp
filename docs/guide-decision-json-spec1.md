# Decision Article `decision-v1` JSON 仕様（Guide / Column 共通）

このテンプレートを使うと、Guide / Column の判断型記事を structured JSON で運用できる。Guide 側は `data/articles/guides/*.json`、Column 側は `data/articles/columns/*.json` を追加するだけで共通テンプレートに載る。

## 使い方

- `layoutVariant` に `decision-v1` を入れる
- `keyPoints` / `checkpoints` / `faq` / `actionBox` / `detailSections` を JSON で持つ
- **`body` は任意**
  - レイアウト本体は structured field で描画する
  - `body` を省略した場合は、`lead / keyPoints / checkpoints / detailSections / faq / actionBox` から監査用本文を自動生成する
  - その生成本文を使って audit / sitemap / indexability を判定する
  - つまり、今は **structured JSON だけでも運用できる**
- 新しいガイドを追加するときは **TSX を触らない**
- `data/articles/guides/*.json` だけ追加する

## `decision-v1` で必須にする項目

### 表示の骨格

- `slug`
- `title`
- `summary`
- `seoTitle`
- `seoDescription`
- `lead`
- `displayTag`
- `eyebrowLabel`
- `heroImage`
- `thumbnail`
- `primaryQuery`
- `publishedAt`
- `updatedAt`
- `readMinutes`

### ヘッダー・信用情報

- `breadcrumbTrail`（3件以上）
- `authorProfile`
  - `kind: "person" | "organization"`
  - `name`
  - `credential`
- `sources`（3件以上）
- `updateReason`

### 判断補助ブロック

- `keyPoints`（3件以上）
- `checkpoints`（3件以上）
- `faq`（2件以上）
- `actionBox`
  - `title`
  - `body`
  - `actions`
- `relatedGuideSlugs`（2件以上）
- `detailSections`（3セクション以上）
- `detailSections.blocks` 合計6件以上

## build 前に落ちる条件

`node scripts/verify-guide-decision-json.mjs` で次を見ている。

- `decision-v1` の published guide に必須 field が揃っていない
- `authorProfile.kind` が `person` / `organization` 以外
- `sources` が足りない
- `relatedGuideSlugs` が足りない
- `faq` が薄い
- `detailSections` の block type が未対応
- block ごとの必須 payload が欠けている
- `comparisonTable` の列数が崩れている
- `caseStudy` / `flow` / `timeline` / `decisionCards` が薄い
- **structured body を自動生成した結果が 2500 文字未満**
- **structured body を自動生成した結果の Markdown 見出し数が 4 未満**

つまり、**見た目に必要な JSON が足りないまま deploy されることはない**。

## `detailSections.blocks` で使える type

### `paragraph`

```json
{ "type": "paragraph", "text": "本文" }
```

### `list`

```json
{ "type": "list", "items": ["項目1", "項目2"] }
```

### `comparisonTable`

```json
{
  "type": "comparisonTable",
  "title": "比較表タイトル（任意）",
  "headers": ["項目", "A", "B"],
  "rows": [
    ["年会費", "0円", "4,000円"],
    ["対象", "車", "人"]
  ],
  "note": "注記（任意）"
}
```

### `callout`

```json
{
  "type": "callout",
  "tone": "accent",
  "title": "補足タイトル",
  "body": "補足本文",
  "items": ["補足1", "補足2"]
}
```

`tone` は `info | note | warn | accent`

### `flow`

```json
{
  "type": "flow",
  "steps": [
    { "title": "ステップ1", "body": "説明" },
    { "title": "ステップ2", "body": "説明" }
  ]
}
```

### `timeline`

```json
{
  "type": "timeline",
  "items": [
    {
      "label": "0〜1分",
      "title": "安全確保",
      "body": "短い説明",
      "items": ["やること1", "やること2"]
    }
  ]
}
```

### `decisionCards`

```json
{
  "type": "decisionCards",
  "cards": [
    {
      "badge": "タイプA",
      "title": "街乗り中心",
      "body": "おすすめの考え方",
      "items": ["補足1", "補足2"]
    }
  ]
}
```

### `caseStudy`

```json
{
  "type": "caseStudy",
  "cases": [
    {
      "title": "ケース1",
      "intro": "ケース説明",
      "rows": [
        { "label": "保険付帯", "value": "0円" },
        { "label": "JAF", "value": "4,000円", "note": "注記" }
      ]
    }
  ]
}
```

## 追加時の手順

1. `docs/examples/guide-decision-v1-template.json` を複製
2. `data/articles/guides/<slug>.json` として保存
3. structured field を埋める
4. `body` を書くなら任意で追記する
5. `node scripts/content-audit.mjs`
6. `node scripts/verify-guide-decision-json.mjs`
7. `node scripts/verify-internal-links.mjs`

## すでに `decision-v1` 化済みの例

- `road-service-choice-guide.json`
- `repair-history-used-car-checklist.json`
- `car-accident-first-10-minutes.json`
- `oil-change-frequency-guide.json`


## Column `decision-v1` の追加ルール

Guide と block schema は共通。ただし Column では次を変える。

- `type: "COLUMN"`
- `parentPillarId: "/column"`
- `layoutVariant: "decision-v1"`
- `heroImage` / `thumbnail` は必須にしない
- `readMinutes` は 5〜7 分想定が多い
- `sources` は 3 件以上必須
- `relatedGuideSlugs` は 1 件以上持つ
- `body` は移行完了後に残さない前提

Column 用の実データ例は `docs/examples/column-decision-v1-template.json` を使う。

## Column 側の最低チェック

- `node scripts/verify-column-decision-json.mjs`
- `node scripts/content-audit.mjs`
- `node scripts/verify-internal-links.mjs`
- `node scripts/generate-sitemaps.mjs`
