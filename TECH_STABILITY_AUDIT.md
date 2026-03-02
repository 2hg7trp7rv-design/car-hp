# Tech Stability Audit (Error Prevention)

目的: 「本番でエラーが出そうな箇所」を潰す。
方針: 削らずに “足りない保険” を追加して、実行時に壊れない方向へ寄せる。

## 実施したチェック
1) ビルド前スクリプト（prebuild）の個別実行
- `node scripts/guardrails.mjs`
- `node scripts/content-audit.mjs`
- `node scripts/generate-sitemaps.mjs`
- `node scripts/generate-robots.mjs`
- `node scripts/verify-robots.mjs`

2) クエリパラメータの型/実行時事故チェック
- Next.js の `searchParams` は `string | string[] | undefined` になり得る
  - 例: `?q=a&q=b` のように重複すると `string[]` になる
  - これを `trim()` などしてクラッシュするケースが典型

3) “client boundary” 事故チェック（目視）
- `window` / `document` を触るファイルが `use client` の内側に閉じているか
- フック使用コンポーネントが server component 直下で import されないか

## 見つかったリスクと修正
### 1) `/news` の searchParams 配列化によるクラッシュ
リスク:
- `searchParams.q` などが `string[]` になった場合、`trim()` / `toLowerCase()` で例外

対処:
- `/news` で `toSingle()` を追加し、必ず単一の `string` に正規化してから処理
- フィルタロジック側（filterNews）も同様に防御

変更ファイル:
- `app/news/page.tsx`

### 2) `/heritage` Map（モーダル）の操作事故
リスク:
- モーダル表示中に Tab で背景へフォーカスが抜ける
- 閉じた後にフォーカスが迷子になる

対処:
- フォーカス開始点（Close）/ フォーカス復帰（Map）/ Tabトラップ / Escape close を追加
- `.cb-tap` で最小タップターゲットを担保

変更ファイル:
- `components/heritage/HeritageTimeArchive.tsx`

## 追加で “本番プレビュー” で確認してほしい項目
- `/news?q=a&q=b` のような重複クエリでも落ちないか
- `/heritage` の Map を開いたまま Tab/Shift+Tab で背景へ抜けないか
- モーダルを閉じたあと、キーボード操作が Map ボタンから継続できるか
