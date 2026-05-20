# Content Pack 2026-01

このリポジトリに、PV獲得の入口（症状/手続き/車検/消耗品）と、既存の収益導線（保険/売却/ローン/物販）へ繋ぐための追加コンテンツを同梱しました。

## 追加したHUB（静的ページ）

- /guide/hub-shaken
- /guide/hub-consumables
- /guide/hub-paperwork
- /guide/hub-import-trouble

※ いずれも `/app/guide/` 配下の `hub-*` として追加。

## 追加したGUIDE（データ追加）

`/data/guides6.json` に30本追加。

### 書類・手続き
- meigi-henko-hitsuyou-shorui-futsuu
- meigi-henko-hitsuyou-shorui-kei
- jyuusho-henkou-shaken-shou
- shako-shoumei-torikata
- number-change-kibou-number-guide

### 車検
- shaken-mae-checklist
- shaken-toujitsu-nagare-mochimono
- shaken-ochiyasui-point
- user-shaken-vs-shop

### 消耗品・交換目安
- battery-replacement-timing-signs
- tire-replacement-cost-guide
- oil-change-frequency-guide
- wiper-rubber-change-guide
- aircon-filter-change-guide
- brake-pad-replacement-guide

### トラブル（症状別）
- engine-check-light-first-response
- oil-leak-first-response
- car-noise-diagnosis-guide
- car-smell-trouble-guide
- shift-shock-at-dct-guide
- steering-vibration-guide
- ac-not-cold-guide
- overheat-coolant-leak-guide

### 保険（深掘り）
- sharyou-hoken-necessary
- insurance-deductible-guide
- bengoshi-hiyou-tokuyaku-guide
- tokkyu-hikisugi-chudan-guide

### ローン・残クレ
- car-loan-interest-rate-guide
- car-loan-shinsa-prep-guide
- zancre-cancel-mid-guide

## 収益導線の考え方

- PV入口（症状/手続き/交換目安）→ 既存のHUB（保険/売却/メンテ/車検/ローン）へ内部リンク
- 各GUIDEの下部CTAは、テーマに近い `monetizeKey` を設定
  - 車検/維持費系：shaken_rakuten
  - トラブル系：goods_jump_starter（緊急装備）
  - 保険系：insurance_compare_core / insurance_saving
  - ローン系：loan_precheck / loan_estimate

