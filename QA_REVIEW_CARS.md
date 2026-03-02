# QA Review — CARS (Index / Filter / Pagination)

対象: `/cars`

## 優先度
CARSは “道具” のページ。ここが押しづらい/迷う/解除できない だと、体験品質が一気に落ちる。

## 赤入れ（改修前に起きやすい問題）
1) 適用中フィルタは表示されるが、解除ができない（現在地は分かるが摩擦が残る）
2) ページネーション、VIEW切替が小さくなりがち（タップ領域が44pxに届かない）
3) フィルタ入力（input/select）の高さが小さく、スマホで“雑”に見える

## 実施した改修（規格適用）
- ACTIVE FILTERS を “解除できるチップ” に変更
  - 各チップは 1タップで該当パラメータだけを除去
  - 年式/価格レンジは両端をまとめて解除
  - `RESET ALL` を常設
- VIEW切替リンクを `inline-flex` 化し `.cb-tap` が効く状態に統一
- ページネーション（PREV/NEXT/ページ番号）を `inline-flex` + `.cb-tap` で44px基準へ
- フィルタ入力（input/select）へ `.cb-tap` を付与（min-heightで底上げ）

## 変更ファイル
- `app/cars/page.tsx`

## 目視で最終確認すべき項目（Vercel Preview）
- iPhoneで ACTIVE FILTERS の各チップを連打しても誤タップ/誤解除しないか
- ページネーションが片手で押しやすいか（特にPREV/NEXT）
- FILTERの展開/閉じる→入力→自動反映 の導線が迷わないか
