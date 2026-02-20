# CAR BOUTIQUE JOURNAL（carboutiquejournal.com）

## Design System（品質規格）
- 規約：`DESIGN_SYSTEM.md`
- トークン：`DESIGN_TOKENS.md`
- コンポーネント仕様：`COMPONENT_SPEC.md`
- QAチェックリスト（Definition of Done）：`DESIGN_QA_CHECKLIST.md`

## README.md は何のための場所？
- **リポジトリの説明書**です（GitHub のトップに表示されることが多いファイル）。
- **サイトの表示やSEOには直接影響しません**。
- このリポジトリでは、README を **運用メモ / 変更履歴 / SEO設定メモ** として使う想定でOKです。

---

## 運用（Vercel）
### ドメイン設定（いまの状態でOK）
- **本番ドメイン**：`carboutiquejournal.com`（Production に接続）
- **既定ドメイン**：`car-hp.vercel.app`
  - これは **308 Permanent Redirect → carboutiquejournal.com** にしておくのが正解です（重複インデックス防止）。

### 環境変数（重要）
- `NEXT_PUBLIC_SITE_URL`：`https://carboutiquejournal.com`（末尾スラッシュなし推奨）
  - canonical / sitemap / OGP のURL生成に使います。

---

## Sitemap / Robots（現状）
### sitemap の入口
- `https://carboutiquejournal.com/sitemap.xml`（200 / 正）
- `https://carboutiquejournal.com/sitemap`（308 → /sitemap.xml / 互換）
  - robots.txt は **/sitemap.xml のみ** を参照します（重複URLのノイズ削減）。

### robots.txt
- `https://carboutiquejournal.com/robots.txt`
  - 本番環境は Allow、Preview 環境は Disallow で生成します（誤インデックス事故防止）。

### 分割 sitemap（index から辿れる）
- `/sitemaps/sitemap-static.xml`
- `/sitemaps/sitemap-cars.xml`
- `/sitemaps/sitemap-makers.xml`
- `/sitemaps/sitemap-body-types.xml`
- `/sitemaps/sitemap-segments.xml`
- `/sitemaps/sitemap-guides.xml`
- `/sitemaps/sitemap-columns.xml`
- `/sitemaps/sitemap-heritage.xml`
- `/sitemaps/sitemap-news.xml`

補足:
- `/sitemaps/sitemap-xxx`（拡張子なし）は **.xml へ 308 リダイレクト**（後方互換）。
- `/sitemaps/sitemap-news.xml` は現状 **空**です。
  - `/news/[id]` 詳細ページを **noindex運用**にしているため、sitemap に入れない方針です。

---

## 「Search Consoleでインデックスが進まない」時の優先チェック（技術側）
Search Console の「未登録」は“バグ”ではなく、**クロールや選別の都合で後回し**になっているケースが多いです。
ただし、下の項目に引っかかると止まるので、優先で確認します。

### 1) リダイレクトの形（ループ/多段がないか）
- 例：`/cars/` → `/cars` の **1回だけ**のリダイレクトになるのが理想。
- Search Console の「リダイレクト エラー」は、過去のクロール時点の状態が残っていることがあります。
  - 設定やコードを直した後は、該当のエラーで **「修正を検証」** を回すのが次の一手です。

### 2) canonical が本番ドメインで固定されているか
- canonical / OGP / sitemap の base URL が `carboutiquejournal.com` で揃っていること。
- 本番以外のドメイン（`*.vercel.app`）が残ると、重複扱いになりやすいです。

### 3) sitemap/robots が取得できるか
- `/sitemap.xml` が **200** で返り、`/sitemap` は **308 → /sitemap.xml** になっている
- `robots.txt` に sitemap が記載されている

### 4) 「クエリ付き一覧」を noindex にできているか（重複URL対策）
- `/cars?maker=...` や `/column?page=...` のような URL は、内容が同じ/近いページを大量に作ります。
- そのため一覧は **クエリ付きは noindex** に寄せています（コード側で実装済み）。

---

## このリポジトリで入っているSEO対策（概要）
- canonical / OGP のURLを `NEXT_PUBLIC_SITE_URL` 基準で固定
- sitemap / robots を build 時に scripts で生成し public に配置（環境差で 4xx になりにくい）
- 一覧ページの `?page= / ?tag= / ?maker=` など **クエリ付きURLは noindex**
- フィルタ/ページネーション等のクエリ付きリンクは `rel="nofollow"`（無限にURLが増えるのを抑制）
- `middleware.ts` で最低限の正規化（末尾スラッシュ除去、ドメイン正規化の保険）


### Cars / Guide / Column の本文は「JSONだけ」で運用する
- スマホ（GitHub UI）運用前提のため、本文は **Markdownファイルを増やさず** `data/articles/**.json` の `body` だけで完結させます。
- `content/` ディレクトリは guardrails で禁止（ビルドを落として事故を防止）。
- 画像は `public/` に実在するものだけが描画されます（存在しないパスは自動でKVにフォールバックし、404を出さない）。
- 追加/編集はここだけ触ればOK：
  - Cars: `data/articles/cars/<slug>.json`
  - Guides: `data/articles/guides/<slug>.json`
  - Columns: `data/articles/columns/<slug>.json`



### B: 統合（リダイレクト）の管理（data/redirects.json）
- 企画書の「B: 統合（意図が被るページは統合して1URLへ）」を回すために、リダイレクトは **データファイル**で管理します。
- 置き場所: `data/redirects.json`
  - 形式: `[{ "source": "/guide/old", "destination": "/guide/hub-xxx", "permanent": true }, ...]`
- 反映箇所:
  - `next.config.mjs` がビルド時に読み込み、`redirects()` に展開します（コードを触らず追加可能）


---

## 変更履歴メモ（運用メモ）
### NEWS棚復活 + START導線 + COMPARE追加
- **/news（メーカー公式NEWS）**
  - ヘッダー / モバイル下部ナビ / フッターに NEWS 導線を追加
  - /news 一覧 + /news/[id] 詳細（外部一次情報リンク + 関連コンテンツ）
  - /news/[id] は現状 noindex（"読み解きガイド" は表示用の補助）

- **/start（目的別の入口）**
  - 買う / 困った / 売る・維持 の3導線
  - 主要HUBへのショートカット

- **HUB（読む順番固定）**
  - /guide/hub-usedcar
  - /guide/hub-loan
  - /guide/insurance
  - /guide/hub-sell

- **/compare（車種比較）**
  - 最大3台（noindex）
  - `?cars=slug1,slug2,...` で共有
  - localStorageで保持、差分表示トグル

