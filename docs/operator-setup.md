# 運営者情報 セットアップ

## 単一ソース

運営者情報の単一ソースは **`data/site/operator.json`** です。表示側は必ず `lib/operator.ts` の `OPERATOR` 経由で参照してください（直書き禁止）。

```json
{
  "siteName": "CAR BOUTIQUE JOURNAL",
  "operatorName": "要設定",
  "operatorType": "要設定",
  "representative": "要設定",
  "address": "要設定",
  "contactEmail": "要設定",
  "established": "要設定",
  "businessDescription": "要設定"
}
```

## 設定手順

1. 上記 JSON の各値を実情報に置き換える
2. `npm run build`（prebuild の各種検証を含む）が通ることを確認する
3. `/legal/about` の「運営者情報」セクションに反映されることを確認する

- **「要設定」のまま公開しないこと。** 未設定値はそのまま画面に表示されるため、設定漏れは目視で検出できます。
- 特定商取引法に基づく表記が必要な広告掲載を始める場合は、`/legal/ads-affiliate-policy` と本ページの整合を確認してください。

## キャラクター表記

About ページには「莉奈・JUNA は架空のキャラクターであり、事実確認の責任は運営者と一次資料に帰属する」旨の明記セクションがあります。この文面は運営者情報と一体で管理し、削除・変更する場合は編集方針（`/legal/editorial-policy`）との整合を確認してください。
