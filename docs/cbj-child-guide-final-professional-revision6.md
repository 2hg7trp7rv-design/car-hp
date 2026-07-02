# CBJ 子GUIDE最終プロ品質改修レポート 6

## 対象

- `data/articles/guides/aftermarket-air-cleaner-risk-guide.json`
- `data/articles/guides/car-suspension-hard-soft-merit-demerit.json`
- `data/articles/guides/electronic-damper-coilover-risk-guide.json`
- `data/articles/guides/adas-lowered-car-aiming-risk-guide.json`
- `data/articles/guides/tv-canceller-can-risk-guide.json`
- `data/articles/guides/used-custom-car-check-guide.json`
- `data/articles/columns/modern-car-custom-regret-reason-column.json`
- `components/articleDesignSystem/ArticleHero.tsx`
- `scripts/verify-guide-decision-json.mjs`
- `scripts/verify-article-design-system.mjs`

## 判断

前回版は主要方向は入っていたが、検証側に `cbj-world-v1` の子GUIDEを通過させる抜けがあった。これは公開品質管理として不十分だったため、対象を迂回で逃がさず、検証対象に含める形へ修正した。

## 改修内容

### 1. ヒーロー表示の逃げを削除

`ArticleHero.tsx` で `heroLead` が無い場合に `article.lead` や `article.body` へフォールバックする処理を削除した。

- 修正前: `heroLead || article.lead || article.body || article.title`
- 修正後: `heroLead` が存在する場合だけ表示

理由: ヒーローコピーと本文導入の重複を、表示側のフォールバックで隠さないため。

### 2. 子GUIDE検証の抜けを削除

`verify-guide-decision-json.mjs` は以前 `decision-v1` / `guide-board-v2` のみ検証していた。現在の子GUIDEは `cbj-world-v1` のため、主要な子GUIDE検証が抜ける状態だった。

- `isStructuredGuide()` を使い、`cbj-world-v1` も検証対象へ追加
- `dialogue` / `quote` / `divider` も正式なブロックとして検証
- 子GUIDEの固定 `decisionCards` を禁止
- 子GUIDE本文内の `tone=info` callout を禁止
- 子GUIDEごとの主役UIを必須化
- `heroLead` と `lead` の同義重複を禁止
- 公開本文・更新履歴の内部作業語を禁止

### 3. 記事別の主役UIを強化

| 記事 | 追加・強化したUI |
|---|---|
| 社外エアクリーナー | 純正戻しで比べる条件 |
| 足回り | 試乗条件を揃える |
| 電子制御ダンパー | 施工先に確認する質問 |
| ADASローダウン | 施工店に確認する質問 |
| TVキャンセラー | 方式別に残す記録 |
| カスタム済み中古車 | 販売店に確認する質問 |

### 4. 公開更新履歴を整理

前回の `updateReason` に内部作業語が残っていたため、公開側でも自然に読める文へ修正した。

- 修正後: `親記事との役割差を整理し、各ガイドの判断導線・確認表・締めの要点を再構成`

## 可視HTML検査

`.next/server/app/guide/*.html` を生成後、script/style/noscript を除いた可視テキストを検査した。

| 検査項目 | 結果 |
|---|---:|
| `この記事で判断できること：` | 各GUIDE 1回 |
| `POINT` | 各GUIDE 1回 |
| `最終結論` | 各GUIDE 1回 |
| `SYSTEM 01` | 各GUIDE 0回 |
| `Lesson` | 各GUIDE 1回 |

## 実行結果

```text
npm run prebuild：OK
npx next build --webpack：OK
生成静的ページ：199 pages
```

## 未確認

- Vercel Preview URL
- 実機スマホ表示
- 本番反映後の表示
- Google Search Console 上のクロール状態

実機表示は未確認のため、実機確認済みとは扱わない。
