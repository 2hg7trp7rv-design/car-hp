# QA Review — NEWS (Feed / Filter / Detail)

対象: `/news` / `/news/[id]`

## 優先度
NEWSは “道具” のページ。
ここが「押しづらい」「解除できない」「状態が分からない」だと、アーカイブ全体の信頼感が落ちる。

## 赤入れ（改修前に起きやすい問題）
1) 期間プリセット（7日/30日/全期間）が、既存フィルタ（maker/source/tag等）をリセットしてしまう
2) ACTIVE FILTERS が “表示のみ” で、個別解除ができない（現在地は分かるが摩擦が残る）
3) フィルタ入力（input/select）、チップ（プリセット/クイック）や CLEAR が 44px 基準を満たしづらい
4) FEATUREDカードが見た目はインタラクティブだが、タイトル以外は遷移しない（誤タップ誘発）
5) 詳細ページで、タグ/元記事リンク/戻る導線が小さくなりやすい

## 実施した改修（規格適用）
- クエリ維持のため `buildQueryString()` と `baseQueryParams` を導入
- 期間プリセットチップ
  - 既存フィルタを保持したまま period だけ切り替え
  - 選択中の状態をスタイルで明示
  - `.cb-tap` を付与（44px）
- ACTIVE FILTERS
  - “解除できるチップ” に変更（各チップ1タップで該当パラメータのみ除去）
  - `RESET ALL` を常設
  - `.cb-tap` を付与（44px）
- フィルタフォーム
  - input/select に `.cb-tap` を付与（min-heightで底上げ）
  - CLEAR / submit ボタンも `.cb-tap`
- FEATURED
  - カード全体を Link でラップして、どこを押しても詳細へ遷移（誤タップを排除）
- NEWS詳細
  - 元記事リンク / タグチップ / NEWS一覧へ戻る を `.cb-tap` 化
  - 右カラムの関連リンクカードも `.cb-tap` を付与し、タップの安定性を確保

## 変更ファイル
- `app/news/page.tsx`
- `app/news/[id]/page.tsx`

## 目視で最終確認すべき項目（Vercel Preview）
- makerを選んだ状態で period チップを切り替えても maker が保持されるか
- ACTIVE FILTERS の各チップ解除が想定通りか（誤解除がないか）
- FEATUREDカードをタイトル以外でタップしても遷移するか
- NEWS詳細で「元記事を開く」「タグ」「NEWS一覧に戻る」が片手でストレスなく押せるか
