# CBJ COLUMN / GUIDE 記事デザインシステム 実装記録 4

更新日: 2026-06-24

## 基準資料

- 改修原本: `car-hp-article-common-3.zip`
- 現状確認PDF: `車のカスタムで後悔しやすい理由｜現代車で純正を崩す前に考えたいこと CAR BOUTIQUE JOURNAL 34.pdf`
- 理想モック: Kimi Viteモックおよび移植用ZIP

## 今回修正した差分

1. ヒーロー下端の巨大な黒い円弧を削除
2. 本文を一文単位の強制改行から自然な段落フローへ変更
3. 既存JSONの `highlights` を表示へ接続し、過剰な面マーカーではなく抑制した下線強調へ変更
4. 章タイトルと記事目次で意図的な改行を維持
5. `comparisonTable` に `contrast` と `checklist` を追加
6. COLUMNのNG / OKを対比カードへ変更
7. COLUMNの確認項目を縦型チェックカードへ変更
8. GUIDE全6記事へカード、図解、モーションの表示指定を追加
9. GUIDEのSEOタイトルとヒーロー表示タイトルを分離し、スマホでの過剰な多段改行を解消
10. `CbjWorldArticlePage`をHero / Content / End Sectionsへ分割
11. development専用の部品カタログ `/article-system-preview` を追加
12. productionでは部品カタログを404にするガードを追加
13. 旧Visual/Kinto/Common系のコンポーネント・CSS・画像パスが存在しないことを再確認
14. 記事デザイン仕様書とブロック仕様書を現実装に同期

## 実装済みの表示選択

### ブロック共通

- `variant`: default / soft / outline / emphasis / compact
- `width`: normal / wide / bleed
- `motion`: none / fade-up / fade-left / fade-right / scale-in

### comparisonTable

- `cards`
- `contrast`
- `checklist`
- `table`

### 会話

- `bubble`
- `lead`
- `aside`
- `compact`

記事ごとに種類、数、順番をJSONへ明示する。実行時のランダム選択は行わない。

## 検証結果

- `npm run prebuild`: 成功
- TypeScript: 成功
- `npm run lint:strict`: 成功
- Next.js production build: 成功
- 静的ページ199件: 生成成功
- content audit: errors 0 / warnings 94
- internal links: 成功
- sitemap: 生成・検証成功
- robots: 生成・検証成功
- public-assets: 生成・参照検証成功
- indexing surface: 成功
- `npm audit --omit=dev`: 脆弱性0件
- COLUMN 1記事 / GUIDE 6記事: production HTTP 200
- development部品カタログ: production HTTP 404
- 390px / 768px / 1280px: 横方向のはみ出しなし

## 未確認

- iPhone実機Safari
- Android実機Chrome
- 実機でのメニュー、目次、FAQ、上部へ戻る操作
- Kimiモックと実機画面録画を並べたモーションの最終比較
- Vercel Preview

実機未確認のため、実機確認済みとは扱わない。
