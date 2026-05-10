# Column 制作テンプレート

この repo の公開 Column は、**全件 `decision-v1`** へ移行済みです。

- **decision-v1**: `lead / keyPoints / checkpoints / faq / actionBox / detailSections` を使う判断型テンプレート
- **legacy path**: 互換用コードとして一部残っていても、新規制作の標準運用では使いません

今後の新規 Column は、**原則 `decision-v1`** で作る前提です。
`content/columns/<slug>.md` を追加して本文を上書きする運用は、移行後の標準運用ではありません。

---

## decision-v1 で必須にするもの

- `layoutVariant: "decision-v1"`
- `lead`
- `readMinutes`
- `eyebrowLabel`
- `breadcrumbTrail`
- `authorProfile`
- `keyPoints`（3件以上）
- `checkpoints`（3件以上）
- `faq`（2件以上）
- `actionBox.actions`（1件以上）
- `detailSections`（3件以上）
- `detailSections.blocks`（合計6件以上）
- `sources`（3件以上）
- `relatedGuideSlugs`（1件以上）

`body` は移行完了後に残さない前提です。監査や indexability は structured field から生成した本文で見ます。

---

## 基本の流れ

1. 最初に `lead` で記事の判断軸を短く出す
2. `keyPoints` で先に結論を渡す
3. `checkpoints` で読む前の確認項目を出す
4. `detailSections` で本文を組む
5. `faq` で迷いどころを潰す
6. `actionBox` で次の行動へ送る
7. `sources` を必ず 3 件以上入れる

---

## decision-v1 で使える block

- `paragraph`
- `list`
- `comparisonTable`
- `callout`
- `flow`
- `timeline`
- `decisionCards`
- `caseStudy`

block の payload ルールは `docs/guide-decision-json-spec1.md` を共通仕様として見ること。
Column 側のサンプルは `docs/examples/column-decision-v1-template.json` を使う。

---

## 制作時の注意

- `eyebrowLabel` は broad tag のコピーにしない
  - 例: `displayTag: "輸入車"` でも `eyebrowLabel: "個人輸入"` のように記事の論点を絞る
- `related` の見出しは UI 側で `次に読むべき記事` になる
- `sources` は一次情報優先
- `updateReason` は更新履歴でそのまま見えるので、雑に書かない

---

## 最低チェック

- `node scripts/verify-column-decision-json.mjs`
- `node scripts/content-audit.mjs`
- `node scripts/verify-internal-links.mjs`
- `node scripts/generate-sitemaps.mjs`
