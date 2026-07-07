# CAR BOUTIQUE JOURNAL

カスタム・整備・維持判断を、初級者にも読める形で整理する編集サイトです。

## 現在の公開面

- `/` トップ
- `/guide` ガイド一覧
- `/guide/[slug]` ガイド記事
- `/column` コラム一覧
- `/column/[slug]` コラム記事
- `/search` サイト内検索
- `/site-map` サイトマップ
- `/contact` お問い合わせ
- `/legal/*` 法務ページ

## コンテンツ配置

- ガイド記事: `data/articles/guides/*.json`
- コラム記事: `data/articles/columns/*.json`
- 公開アセット索引: `data/_internal/public-assets.json`
- リダイレクト定義: `data/redirects.json`

## 検証コマンド

```bash
npm run prebuild
npm run build
```

`prebuild` は、コンテンツ監査、内部リンク検証、sitemap / robots 生成、公開アセット検証、TypeScript 検証をまとめて実行します。

## 編集方針

現在の編集面はガイドとコラムに集約しています。記事本文は、専門用語を先に並べるのではなく、読者がつまずきやすい判断点から整理します。

タイトルのみで一時保持するガイド記事は `publicState: "noindex"` とし、本文が完成するまで検索面へ出さない運用にします。
