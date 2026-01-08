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
