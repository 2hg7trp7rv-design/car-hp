# クルマのいろは

はじめてクルマに乗る人のための入門サイト。シュナと莉奈の会話と図解で説明します。
Next.js（App Router）で作り、全ページをビルド時に静的生成します。

## 開発

Node.js 22 を使います。

```sh
npm install
npm run dev
```

iCloud で同期している書類フォルダに置くと、ディスクの空きが少ないときに
ファイルがクラウド側だけに移され、ビルドや git が止まることがあります。
作業用のコピーは iCloud の外（例: `~/Developer`）に置くことを勧めます。

`npm run check` で、ESLint・型検査・本番ビルドをまとめて実行します。

## 構成

| 場所 | 役割 |
| --- | --- |
| `content/articles/` | 1記事1ファイル。会話・図・手順・まとめ・確認した資料を書く |
| `content/types.ts` | 記事の型 |
| `components/figures/` | 記事の図（SVG）。`index.tsx` に登録した名前で記事から呼ぶ |
| `lib/categories.ts` | 5つのカテゴリ |
| `lib/characters.ts` | シュナと莉奈の名前・画像・紹介文 |
| `lib/og.tsx` | SNSで共有したときの画像。ビルド時に Google Fonts から必要な文字だけを取得する |
| `app/` | ページ・サイトマップ・robots |

## 記事を追加する

1. `content/articles/<slug>.ts` を作り、`Article` 型に沿って書く。
2. `content/articles/index.ts` の `ARTICLES` に追加する。
3. 図が要るときは `components/figures/` に SVG のコンポーネントを作り、`index.tsx` に登録する。
   スマホでも文字が読めるよう、横幅480の縦長で描き、文字は20以上にする。
4. 手順や決まりは官公庁・消防・メーカーなどの資料で確かめ、`sources` に載せる。
5. `npm run check` を通し、パソコンとスマホの幅で表示を確かめる。

## 公開URL

`NEXT_PUBLIC_SITE_URL` で指定します（未設定時は https://carboutiquejournal.com ）。
ドメインが決まったら Vercel の環境変数を変えます。
