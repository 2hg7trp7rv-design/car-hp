# COLUMN / GUIDE 共通記事ブロック

正式レンダラーは `CbjWorldArticlePage` で、記事JSONの `detailSections[].blocks[]` を任意の数・順番で描画する。

## 意味ブロック

- `paragraph`
- `subheading`
- `image`
- `list`
- `quote`
- `divider`
- `comparisonTable`
- `callout`
- `flow`
- `timeline`
- `decisionCards`
- `editorialBoard`
- `caseStudy`

旧Visual/Kinto用の `characterComment`、`diagram`、`riskCheck`、`systemCards`、`steps`、`editorNote` は使用しない。

## 表示選択

各ブロックは `presentation` で同じ世界観の表示候補を選ぶ。

```json
{
  "presentation": {
    "variant": "soft",
    "width": "wide",
    "motion": "fade-up"
  }
}
```

### variant

- `default`
- `soft`
- `outline`
- `emphasis`
- `compact`
- `lead`: 章冒頭の要約・問題提起用。章色を使った薄い面で通常本文より強く表示
- `section`: 長い章を複数テーマに分ける中見出し用。章色の小型アイコン付きカード

### width

- `normal`
- `wide`
- `bleed`

### motion

- `none`
- `fade-up`
- `fade-left`
- `fade-right`
- `scale-in`

## comparisonTable.display

- `cards`: 内容別カード
- `contrast`: NG / OKの対比
- `checklist`: 順番に確認する縦カード
- `table`: 数値・複数列の表

表示形式は実行時にランダム選択せず、記事内容を確認した上でJSONへ明示する。

## 会話

会話は `articleDesign.introDialogue`、`sectionDialogues`、`closingDialogue` へ配置する。

- `bubble`
- `lead`
- `aside`
- `compact`

会話の数、登場人物、位置は固定しない。
