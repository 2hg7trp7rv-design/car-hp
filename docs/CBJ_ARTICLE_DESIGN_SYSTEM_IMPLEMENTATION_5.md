# CBJ COLUMN / GUIDE 記事デザインシステム 実装記録 5

更新日: 2026-06-24

## 基準資料

- 改修原本: `car-hp-article-common-4.zip`
- 現状確認PDF: `車のカスタムで後悔しやすい理由｜現代車で純正を崩す前に考えたいこと CAR BOUTIQUE JOURNAL 34.pdf`
- 理想基準: Kimi Viteモックおよび移植用ZIP

## 今回の改修目的

前回までにヒーロー、会話、章見出し、各種カード、モーション、COLUMN / GUIDE共通レンダラーは実装済みだった。

今回のPDF確認では、本文量が多い章で通常本文が連続し、章内の話題転換が視覚的に弱いこと、本文中の関連記事カードが旧記事UI寄りであること、出典欄がURL中心で読みにくいことが残っていた。

そこで、固定テンプレート化せずに記事JSONから選べる部品を追加し、長文記事の読書リズムと信頼情報の見せ方を改修した。

## 今回実装した内容

### 1. 章導入用 `lead` バリエーション

`presentation.variant: "lead"` を追加した。

- 章色の細いアクセントライン
- 薄い色面
- 通常本文より少し大きく濃い文字
- 長文をカード化しすぎない抑制した角丸と影

すべての段落へ自動適用せず、記事JSONで選択した章の最初の段落だけへ使用する。

基準COLUMNでは、長文になりやすい第2章以降の主要章へ選択的に設定した。

GUIDE 6記事にも、各記事4章ずつ、役割の強い導入段落へ選択的に設定した。全章同一構成にはしていない。

### 2. 章内見出し用 `section` バリエーション

`presentation.variant: "section"` を追加した。

- 章色を引き継ぐ小型アイコン
- 章色を薄く混ぜた背景
- 長い章の中でテーマが変わる位置を明確化
- 通常のH3見出しよりカード性を持たせる

基準COLUMN第2章の以下3テーマへ使用した。

- 吸気系
- 足回り
- 電装品

### 3. 章色の継承

章番号だけでなく、章内部の `lead`、`section`、通常中見出しも同じ章色を参照できるようにした。

章色は記事ごとの `sectionPalette` から渡される。色をコードへ固定しない。

### 4. 本文内の関連記事カードをCBJ新世界観へ統合

本文中の内部リンクカードへ `cbjWorld` バリエーションを追加した。

- GUIDE / COLUMN / CARS / HERITAGEごとの色分け
- 左アクセント線
- 小型カテゴリバッジ
- 丸型矢印
- 新記事システムと同じ角丸・枠線・影

既存の他ページ用カードは変更せず、新記事レンダラーからのみ新バリエーションを指定する。

### 5. 強調表示の整理

基準COLUMNの強調候補52件を再確認し、16件へ削減した。

NG / OKカード、CHECKカード、章導入面などで既に意味が強調されている箇所では、本文内の重複強調を削除した。

本文の内容は削除せず、装飾対象だけを整理した。

### 6. 出典欄の表示改善

出典を生URLだけで表示する状態から、以下の二段表示へ変更した。

- 一段目: 組織名と資料の内容
- 二段目: ドメインとパス

対象:

- 自動車技術総合機構
- 国土交通省
- 日本自動車整備振興会連合会
- NAPAC / ASEA / JASMA
- トヨタ自動車

リンク先URL自体は変更していない。

### 7. 開発用カタログ更新

`/article-system-preview`へ以下を追加した。

- `lead`段落
- `section`中見出し

Productionでは従来どおり404を返す。

## 変更ファイル

- `components/articleDesignSystem/ArticleContent.tsx`
- `components/articleDesignSystem/ArticleEndSections.tsx`
- `components/articleDesignSystem/ArticleDesignSystemCatalog.tsx`
- `components/articleDesignSystem/article-design-system.module.css`
- `components/content/InternalLinkCard.tsx`
- `components/content/TextWithInternalLinkCards.tsx`
- `data/articles/columns/modern-car-custom-regret-reason-column.json`
- `data/articles/guides/*.json` 6記事
- `docs/CBJ_ARTICLE_DESIGN_SYSTEM.md`
- `docs/CBJ_ARTICLE_DESIGN_SYSTEM_IMPLEMENTATION_4.md`
- `docs/article-redesign/json-blocks.md`

## 検証結果

- `npm run prebuild`: 成功
- TypeScript: 成功
- `npm run lint:strict`: 成功
- Next.js production build: 成功
- postbuild: 成功
- content audit: errors 0 / warnings 94
- internal links: 成功
- sitemap生成・検証: 成功
- robots生成・検証: 成功
- public-assets生成・参照検証: 成功
- indexing surface: 成功
- `npm audit --omit=dev`: 脆弱性0件
- COLUMN 1記事: production HTTP 200
- GUIDE 6記事: production HTTP 200
- development部品カタログ: production HTTP 404

## 未確認

- iPhone実機Safari
- Android実機Chrome
- 実機でのメニュー、目次、FAQ、上部へ戻る操作
- Kimiモックとの実機画面録画比較
- Vercel Preview
- 今回追加した `lead` / `section` の実機上の最終余白調整

実機未確認のため、実機確認済みとは扱わない。
