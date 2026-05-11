# GUIDE / HUB A/B テスト運用メモ

## 目的
HUBページの「入口（主CTA）」を A/B で出し分けし、勝ちパターンを固定して収益効率を上げる。

## 仕組み
- 既定は 50/50（安定ハッシュ）で A/B を割当。
- ブラウザ単位で localStorage に保持されるため、同一ユーザーで表示が頻繁に変わらない。
- 割当（または強制）時に `experiment_assign` を送信（`is_override` と `source` 付き）。

## 勝ちパターンの固定（ピン止め）
環境変数 `NEXT_PUBLIC_AB_OVERRIDES` を設定すると、その実験は強制的に固定できる。

形式: `"<experimentId>=A|B,<experimentId>=A|B"`

例:
- `NEXT_PUBLIC_AB_OVERRIDES="hub_sell_entry=A,hub_insurance_entry=B"`

## QA（表示確認）
URLクエリで強制できる。
- すべての実験を強制: `?ab=A` または `?ab=B`
- 特定実験だけ強制: `?ab_<experimentId>=A|B`
  - 例: `?ab_hub-sell=B`

## ブラウザ単位の強制（手元確認）
localStorage の `cbj:exp_override:<experimentId>` に `A`/`B` を入れると、そのブラウザだけ固定される。


## ショートキー（入力を短くする）
`NEXT_PUBLIC_AB_OVERRIDES` は experimentId が基本ですが、以下のショートキーも使えます。

- `hub-sell` → `hub_sell_entry`
- `hub-sell-price` → `hub_sell_price_entry`
- `hub-sell-prepare` → `hub_sell_prepare_entry`
- `hub-sell-compare` → `hub_sell_compare_entry`
- `hub-sell-loan` → `hub_sell_loan_entry`
- `insurance` → `hub_insurance_entry`
- `lease` → `hub_lease_entry`
- `maintenance` → `hub_maintenance_entry`
- `hub-loan` → `hub_loan_entry`
- `hub-usedcar` → `hub_usedcar_entry`
