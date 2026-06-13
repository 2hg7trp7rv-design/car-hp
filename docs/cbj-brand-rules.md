# CBJ Brand / Design Rules

This document is an internal repository note. It must not be rendered on the public website.

## CBJの定義

CAR BOUTIQUE JOURNALは、車選び、維持、整備修理、カスタム、売却、車やメーカーの歴史まで、車の全てを扱う自動車メディア

## 固定コピー

### サイト説明

CAR BOUTIQUE JOURNALは、車選び、維持、整備修理、カスタム、売却、車やメーカーの歴史まで、車の全てを扱う自動車メディア

### ブランドコピー

車に関する全てがここにある

### フッター文言

車選びから売却、整備修理、カスタム、車や自動車メーカーの歴史まで見られる自動車メディア

## 使用しないコピー

短い説明は使わない。

## 句点ルール

「。」は記事内本文でしか使わない。

### 使ってよい場所

- 記事本文
- FAQ回答
- 記事内注記
- 出典説明
- 更新履歴本文

### 使わない場所

- Heroタイトル
- Heroリード
- カード見出し
- カード説明
- ボタン
- ナビ
- フッター
- メタ情報
- Legal / About / Contact / Privacy / Terms の見出し・導線コピー

## デザイン方針

CBJの各ページは別々のページではなく、同じ世界観の中にある。

- 黒いナビ
- 紙面感のある本文背景
- 青緑アクセント
- 静かなカード
- 黒フッター

Legal / About / Contact / Privacy / Terms も、CBJの世界観から外さない。

## 実装方針

固定コピーは各ページへ直書きせず、`lib/brand/cbj-copy.ts` の定数を優先して使う。

句点ルールは、最初はこの文書で管理する。検証スクリプト化は、誤検知の出ない対象範囲を決めてから行う。
