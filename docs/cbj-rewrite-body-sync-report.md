# CBJ rewrite body sync report

目的: GUIDE/COLUMN の表示本文 `detailSections` をリライト版の正本として扱い、検索・監査・フォールバックで参照される `body` も同じリライト本文へ同期。画像ファイルと画像ブロックは変更しない。

## 対象

- data/articles/guides/*.json
- data/articles/columns/*.json（raw body 禁止のため detailSections を確認のみ）

## 変更ファイル

- guides/adas-lowered-car-aiming-risk-guide.json: body 0 -> 8955 chars
- guides/aftermarket-air-cleaner-risk-guide.json: body 7030 -> 8878 chars
- guides/car-suspension-hard-soft-merit-demerit.json: body 0 -> 9555 chars
- guides/electronic-damper-coilover-risk-guide.json: body 0 -> 7076 chars
- guides/tv-canceller-can-risk-guide.json: body 0 -> 6620 chars
- guides/used-custom-car-check-guide.json: body 0 -> 7036 chars
- columns/modern-car-custom-regret-reason-column.json: body remains empty by schema; detailSections verified as rewrite source

## 確認方針

- `detailSections` はリライト版本文として維持。
- `image` ブロックの `src` / `alt` / `label` は変更しない。
- `public/images` 配下は未変更。

## 非対象

- Cars / Heritage は、このリポジトリ内に同時並行リライト版の別ソースが存在しないため本文を自動置換していない。
