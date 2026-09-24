# CAR BOUTIQUE JOURNAL

自動車のガイド・コラム・車種情報・系譜を公開する Next.js App Router サイトです。
公開サイト: https://carboutiquejournal.com/ · 本番ブランチ: `v1`

## 開発を始める

Node.js 22 と npm 10 を使います。依存関係は `package-lock.json` で固定します。

```sh
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

`http://localhost:3000` を開きます。通常の開発と検査に外部サービスの認証情報は不要です。
本番では `NEXT_PUBLIC_SITE_URL=https://carboutiquejournal.com` と
`NEXT_PUBLIC_AFFILIATE_ENV=prod` を設定してください。解析を使う場合だけ
`NEXT_PUBLIC_GA4_ID` を設定します。秘密情報はリポジトリに追加しません。

## 構成と責務

| 場所 | 役割 |
| --- | --- |
| `data/articles/{guides,columns,cars,heritage}/` | 1記事1JSON。本文・公開状態・出典・関連先の原稿 |
| `lib/repository/` | JSONの読み込み・型への正規化 |
| `lib/content/publication.ts` | 公開可否と検索エンジンへの掲載可否の共通ルール |
| `lib/guides.ts` など | 公開ルールを適用した一覧・詳細・関連記事 |
| `lib/content/article-text.ts` | 原稿の本文・表・FAQを検索用テキストに変換 |
| `app/styles/` | 車種・系譜・一覧のスタイル。共通設定は `app/globals.css` |
| `app/` | URL、メタ情報、静的生成、API |
| `components/editorialArticle/` | Guide / Column 共通の本文表示 |
| `article-types.ts` | 表示に必要な型 |
| `article-blocks.tsx` | 段落・図・表・リストなどのブロック表示 |
| `article-format.ts` | 日付・表示番号の書式 |
| `lib/search/` | 正規化済みの検索索引と一致度による順位付け |
| `lib/learning.ts`, `data/learning/` | トップの学習テーマ、三段階の会話教材、出典と前後関係 |
| `components/analytics/` | 同意設定・計測・Cookie設定の再表示 |
| `scripts/`, `tests/` | 原稿・生成HTML・実際のHTTP応答の検査 |

記事の読み込みと本文表示は Server Components が担当します。クライアントの処理は
検索操作、同意設定、目次・読書進捗などに限定します。フッターはサーバーで生成し、
画面切り替えを扱う `SiteChrome` には表示用のスロットとして渡します。

Guide / Column は `EditorialArticlePage` に統一しています。記事固有の巨大なテンプレートや、
章数によって本文を切り捨てる表示は追加しません。構造化本文 `detailSections` を優先し、
未設定の記事だけ JSON の `body` を読み取ります。FAQ・出典・更新履歴・アクションも原稿から表示します。
`data/article-layouts/` は過去のレイアウト資料であり、公開ページの本文には使いません。

## 記事を追加・更新する

1. 対象の `data/articles/` にJSONを作成・編集します。型は `lib/content-types.ts` を参照します。
2. `status` と `publicState` を明示します。既存URLの統合は `data/redirects.json` に記録します。
3. 図や写真は `public/images/` に配置し、`npm run images:gen` を実行します。本文の画像パスは実在するファイルを指定します。
4. 会話教材は `docs/learning-authoring.md` に従って `data/learning/` へ追加します。関連ガイドは教材の `relatedGuideSlug` で指定します。
5. `npm run check` を実行し、プレビューで本文・図表・スマートフォン表示を確認してPRを作成します。

著者情報は確認済みの `authorProfile` を設定します。未設定時は編集部として扱い、
人物名・資格・監修者・評価点数をコードから生成しません。

## 品質検査

```sh
npm run check
npm run security:audit
```

`check` は次の順序で実行します。

- ESLint（警告も失敗として扱う）、未使用ソースの到達性検査、回帰テスト。
- ビルド前の原稿・内部リンク・画像・PNG・サイトマップ・robots検査。
- Next.jsの本番ビルドと型検査。
- 生成HTMLと原稿の照合。全章・段落全文・FAQ・出典・アクション・画像・目次を検査。
- 全静的HTMLの内部リンクを検査。
- ローカルの本番サーバーでページ、検索API、存在しない記事の404、Cookie設定、SEO関連URLを検査。

GitHub ActionsでもPRごとに同じ検査と依存関係監査を実行します。
`npm run build` 単独でも原稿検査と生成HTML検査が前後に実行されます。
記事内容の編集上の警告は `npm run content:audit` に残ります。出典の信頼性や文章の正確さは
自動検査だけでは保証できないため、編集レビューで確認します。

`npm run verify:production-html` は公開サイトに対する読取専用の確認です。
`BASE_URL` で対象、`CHECK_PATHS` で確認URLを指定できます。本番反映後の確認に使用します。

## 画像・フォント

画像は `next/image` で表示サイズに合わせて配信し、本文画像は遅延読込にします。
`npm run images:gen` で実画像の向きを考慮した寸法を `data/_internal/image-metadata.json` に生成します。
画像追加・差し替え時はこのファイルもコミットします。本番ビルドでも再生成し、
回帰テストは実画像、生成HTML検査は属性値と照合します。画像ファイルをサーバー実行時に読み込む必要はありません。
先頭のメイン画像だけ先読みします。外部画像は現在使用していないため許可ホストは空です。
追加する場合は `next.config.mjs` に必要なホストとパスだけを指定してください。

トップの日本語フォントは表示する文字を含むサブセットをコミットしています。
元フォントは `assets/fonts/`、ライセンスは `app/refbook-fonts/LICENSES.txt` にあります。
文言・ガイドタイトルの変更でテストが失敗したら再生成します。

```sh
python3 -m venv .venv-fonts
.venv-fonts/bin/pip install -r scripts/requirements-fonts.txt
.venv-fonts/bin/python scripts/subset-home-fonts.py
npm test
```

生成された `.woff2` と `charset.json` を一緒にコミットします。
通常のビルドやCIではPythonやフォントのダウンロードは不要です。4書体合計250KBを上限として検査します。
ビルドキャッシュは保持し、配信ファイルへの混入は `outputFileTracingExcludes` で防ぎます。

## 公開と検索のルール

`status: published` と `publicState: index / noindex` の両方を満たす記事だけを公開します。
`publicState: draft / redirect`、または `status: draft / archived` の記事は、一覧・詳細・検索・関連記事に出しません。
`noindex` は公開記事の検索エンジン掲載を止める指定であり、非公開指定ではありません。
明示的な公開指定がない過去データは従来どおり公開扱いに正規化します。新規記事では必ず状態を明示してください。
URLの統合元は `data/redirects.json` に従い、記事の取得対象からも外します。

検索ではタイトル、概要・タグ、本文の順に重みを付けます。Guide / Columnは構造化本文とFAQを検索し、
構造化本文がない旧形式だけ `body` を使います。検索用本文はAPIや初期表示データに含めません。

`npm run verify:structure` は App Router の入口から import / re-export / 文字列指定の dynamic import を辿ります。
使用をやめたUIや補助コードは残さず、履歴が必要な場合はGit履歴を参照してください。
将来、Next.jsの新しい入口規約や別の実行環境を追加する場合は、検査側の入口定義も更新します。
