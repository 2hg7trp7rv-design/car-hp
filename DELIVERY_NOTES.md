# CAR BOUTIQUE 納品メモ（このZIPの変更点）

## 今回の統合（NEWS棚復活 + SEO/Sitemap最適化）
- **/news（メーカー公式NEWS）を復活**
  - ヘッダー / モバイル下部ナビ / フッターに NEWS 導線を追加
  - /news 一覧 + /news/[id] 詳細（外部一次情報リンク + 関連コンテンツレコメンド）
- **sitemap を拡張・整理**
  - /sitemap（index）に **news sitemap** を追加
  - static sitemap に **/news** を追加
  - /sitemap.xml は **/sitemap に 301** で統一

## 追加した導線（表側）
- **/start** を新設（目的別の入口）
  - 買う / 困った / 売る・維持 の3導線を用意
  - 主要HUB（中古車・ローン・保険・売却）へのショートカット付き
- ヘッダーに **START** ボタンを追加（PC/スマホ両方）
- トップページに **「目的から探す」** セクションを追加

## HUB（1〜4）を “読む順番固定6本” に変更
以下4ページを、**固定6本（STEP 1〜3）→ 比較表 → 行動の入口** の順に整理しました。
- /guide/hub-usedcar
- /guide/hub-loan
- /guide/insurance
- /guide/hub-sell

## COLUMN の改善
- OWNER STORY が 0 件のとき、上部の指標から非表示
- タグ選択は **上位30件（よく使われるもの）** だけ表示し、その他はキーワード検索へ誘導

## 変更ファイル（主要）
- app/start/page.tsx
- components/layout/SiteHeader.tsx
- app/page.tsx
- components/hub/HubReadingPath.tsx
- app/guide/hub-usedcar/page.tsx
- app/guide/hub-loan/page.tsx
- app/guide/insurance/page.tsx
- app/guide/hub-sell/page.tsx
- app/guide/page.tsx
- app/column/page.tsx

## 動作確認（最小）
- ローカルで Next.js を起動し、上記ページの表示とリンク遷移を確認してください。
  - /start
  - /guide/hub-usedcar（#reading / #entry アンカー含む）
  - /guide/hub-loan
  - /guide/insurance
  - /guide/hub-sell
  - /column（タグ選択の件数と表示）

## Search Console（運用メモ）
- sitemap は **毎回削除→追加し直す必要はありません**。
  - 変更後は /sitemap を送信（または再送信）し、反映を待つだけでOK
  - robots.txt も /sitemap を参照しています

---

## NEWS（文字量の底上げ / 読み物としての厚み追加）
- /news/[id] の詳細ページ内に、**「読み解きガイド（編集部メモ）」** を自動生成で追加
  - 公式ソースの内容を勝手に断定せず、
    **対象範囲・条件・時期・費用** を確認するための“読む順番”とチェックリストを提示
  - タイトル/概要/タグからキーワードを抽出して、定型文だけにならないように構成
- RSS/Atom の summary(excerpt) を **やや長めに保持**（詳細ページの情報量と可読性を優先）

---

## COMPARE（車種比較機能）を追加（最大3台）
- **/compare** を新設（noindex）
  - URL 共有用に `?cars=slug1,slug2,...` で状態を表現
  - ローカル保存（localStorage）で、サイト内を回遊しても比較リストを維持
  - 差分のみ表示（DIFF ONLY）トグル
  - 比較表（価格/年式/ボディタイプ/セグメント/駆動/パワトレ/主要スペック/強み・弱みなど）
- 追加導線
  - **/cars（一覧）**：リスト/カード両方に「比較に追加」ボタン
  - **/cars/[slug]（車種詳細）**：Hero に「比較する」ボタン
  - **HUB（メーカー/ボディタイプ/セグメント）**：CarCard に「比較に追加」ボタン
  - **ヘッダー**：COMPARE ボタン + 件数バッジ
  - **フローティングバー**：比較リストが 1 台以上のとき常時表示（開く/クリア）

## 計測（GA4）
- compare_view / compare_add / compare_remove / compare_clear / compare_share を追加
- internal_nav_click の to_type に **compare** を追加

## 変更ファイル（主要）
- app/compare/page.tsx
- app/compare/compare-client.tsx
- components/compare/compareStore.ts
- components/compare/CompareAddButton.tsx
- components/compare/CompareFloatingBar.tsx
- components/compare/CompareIcon.tsx
- components/cars/CarCard.tsx
- app/cars/page.tsx
- app/cars/[slug]/page.tsx
- components/layout/SiteHeader.tsx
- components/layout/SiteFooter.tsx
- lib/analytics/events.ts
- lib/analytics/pageContext.ts
- components/analytics/TrackedLink.tsx
