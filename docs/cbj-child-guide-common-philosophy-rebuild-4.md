# CBJ 子GUIDE 再設計レポート 4

## 目的

親コラム「車のカスタムで後悔しやすい理由」の思想を維持しつつ、子GUIDEを完全な共通テンプレートへ押し込まず、各記事の検索意図・読者心理・判断導線に合わせて再設計した。

## 基本方針

- 共通テンプレートではなく、共通思想で統一する。
- 親コラムは全体地図として残す。
- 子GUIDEは各疑問に対する単品判断記事として扱う。
- 冒頭の固定3ポイントは無理に使わない。
- 各記事ごとに主役UIを変える。
- CBJの思想「戻せる・説明できる・確認できる」は全記事で維持する。

## 実施内容

### 表示・設計

- `articleDesign.heroPromise` を追加し、ヒーロー内に「この記事で判断できること」を表示。
- `ArticleHero` と型定義、coerce処理を更新。
- `heroPromise` 用CSSを追加。
- GUIDE記事で、ヒーローと本文導入が同じ文にならないように分離。

### 原稿・構成

- 6本の子GUIDEの `lead` / `keyPoints` / `detailSections` / `actionBox` / `closingBlocks` を再設計。
- `POINT 結論` の重複を削除し、最終結論は `articleDesign.closingBlocks` の1回に統一。
- 冒頭の固定3ポイント型 `decisionCards` を削除。
- 各GUIDEに記事別の判断UIを追加。

## 記事別の主役UI

| 記事 | 主役UI |
|---|---|
| 社外エアクリーナー | 付けてもいい / 慎重 / 避ける の判断 |
| 足回りが硬い・柔らかい | 試乗で確認する場面とNG寄りの症状 |
| 電子制御ダンパー | 残るもの / 失う可能性があるもの / 残すべき記録、入れていい / 慎重 / 避ける |
| ADASローダウン | 施工前 / 施工時 / 施工後 の確認フロー |
| TVキャンセラー | 目的別に先に考えること |
| カスタム済み中古車 | 買っていい / 保留 / 避ける の判断 |

## 品質ゲート追加

- `verify-article-design-system.mjs`
  - GUIDEの `articleDesign.heroPromise` 必須化。
  - GUIDEの `lead` と `heroLead` 完全一致を禁止。
  - GUIDE本文中の `結論` calloutを禁止。
  - `closingBlocks` の最終結論を1つだけに制限。
  - 子GUIDE冒頭の固定3ポイントdecisionCardsを禁止。

- `verify-guide-decision-json.mjs`
  - `heroPromise` 必須化。
  - 本文中の `結論` callout禁止。
  - `closingBlocks` の最終結論を1つだけに制限。
  - `actionBox` のリンクラベルに「読む理由」を含めるルールを追加。

## 確認結果

- `npm run prebuild`：OK
- `node scripts/verify-guide-decision-json.mjs`：OK
- `node scripts/verify-article-design-system.mjs`：OK
- sitemap / robots / public-assets / internal-links / indexing surface：OK
- `npm run build`：Next.jsのルート出力まで到達し、199ページ生成・Compiled successfullyを確認。ただしこの実行環境では build コマンドが終了シグナルを返す前にタイムアウトしたため、完全終了とは断定しない。
- 実機確認：未実施。実機確認済みとは扱わない。

## 追加検査 2026-07-02

ユーザー確認「本当に完璧か」に対して、公開HTML上の可視テキストを再検査した。

### 追加修正

- 足回り記事の本文内 `tone=info` callout が `POINT` 表示になっていたため、`NOTE` 表示へ変更。
- カスタム済み中古車記事の本文内 `tone=info` callout が `POINT` 表示になっていたため、`NOTE` 表示へ変更。
- `verify-guide-decision-json.mjs` と `verify-article-design-system.mjs` に、GUIDE本文内 `tone=info` callout を禁止する品質ゲートを追加。

### 追加検査結果

6本の子GUIDEについて、ビルド後HTMLの可視テキストを検査。

- heroLead 可視表示：各記事1回
- この記事で判断できること：各記事1回
- POINT：各記事1回
- 最終結論：各記事1回

### 実行確認

- `npm run prebuild`：OK
- `npm run build`：OK / 199 pages generated

### 未確認

- 実機スマホ表示
- Vercel Preview URL
- Google Search Console / 本番反映後のクロール状態
