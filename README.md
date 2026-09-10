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
| `lib/guides.ts` など | 公開判定・並び順・関連記事の選択 |
| `app/` | URL、メタ情報、静的生成、API |
| `components/editorialArticle/` | Guide / Column 共通の本文表示 |
| `article-types.ts` | 表示に必要な型 |
| `article-blocks.tsx` | 段落・図・表・リストなどのブロック表示 |
| `article-format.ts` | 日付・表示番号の書式 |
| `lib/search/` | 正規化済みの検索索引と一致度による順位付け |
| `lib/home-topics.ts` | トップのトピックと記事の対応。件数は公開記事から算出 |
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
3. 図や写真は `public/images/` に配置します。本文の画像パスは実在するファイルを指定します。
4. トップに掲載するガイドは `lib/home-topics.ts` の該当トピックへ追加します。
5. `npm run check` を実行し、プレビューで本文・図表・スマートフォン表示を確認してPRを作成します。

著者情報は確認済みの `authorProfile` を設定します。未設定時は編集部として扱い、
人物名・資格・監修者・評価点数をコードから生成しません。

## 品質検査

```sh
npm run check
npm run security:audit
```

`check` は次の順序で実行します。

- ESLint（警告も失敗として扱う）と回帰テスト。
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
