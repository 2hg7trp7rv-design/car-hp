# CBJ COLUMN / GUIDE 記事デザインシステム 実装記録 6

更新日: 2026-06-24

## 今回の対象範囲

CBJ全体のブランド再設計は後工程へ分離し、今回は以下7記事の完成に限定した。

### COLUMN

- `modern-car-custom-regret-reason-column`

### GUIDE

- `adas-lowered-car-aiming-risk-guide`
- `aftermarket-air-cleaner-risk-guide`
- `car-suspension-hard-soft-merit-demerit`
- `electronic-damper-coilover-risk-guide`
- `tv-canceller-can-risk-guide`
- `used-custom-car-check-guide`

トップ、CARS、HERITAGE、一覧ページ、サイト全体のグローバルブランド変更は今回の対象外とした。

## 今回完了した内容

### 1. 記事データを単一の編集元へ整理

対象7記事から旧形式のトップレベル `body` を削除し、`detailSections` を本文と表示構成の正本に統一した。

- 旧本文と新本文の二重管理を解消
- 記事ごとの `articleDesign.version` は `cbj-world-v1`
- LESSON番号は17〜23で重複なし
- 公開用の更新理由からKimi、モック、デザインシステム等の内部作業語を除去
- 「後から作る」「今後深掘りする」等、公開時点と矛盾する予定表現を除去

### 2. GUIDE正規化処理の欠落を修正

Guide JSONに保存されていた `presentation` 指定が、リポジトリ読込時に失われていた問題を修正した。

保持対象:

- `variant`
- `width`
- `motion`
- `fit`
- 表の `table` / `cards` / `contrast` / `checklist`

これにより、COLUMNだけでなくGUIDEでも、JSONで選んだ `lead`、`section`、対比カード、チェックリスト等が実際のHTMLへ反映される。

### 3. 画像寸法を記事データへ明示

対象7記事で使う全画像について、実ファイルから幅・高さを取得し、JSONへ保存した。

- 画像ブロックの `width` / `height`
- 関連記事画像の `width` / `height`
- 型定義とGuide正規化処理も対応

ブラウザが描画前に画像領域を確保できるため、記事内のレイアウトシフトを抑えられる構造になった。

### 4. 記事目次と操作性を改善

「この記事の流れ」はJavaScript専用ボタンではなく、実際のアンカーリンクへ変更した。

- `href="#section-id"` を持つ
- JavaScript有効時はスムーズスクロール
- JavaScript無効時も章へ移動可能
- キーボード操作とリンクとしての意味を維持

追加対応:

- 閉じたメニュー内のリンクをフォーカス対象外に変更
- 横スクロール表へラベル付きregionとキーボードフォーカスを追加
- フォーカス表示を追加
- モバイルのアクションリンクをタップしやすい幅へ変更

### 5. 図解と本文の統合を改善

- 図解上部へ章色のアクセントを追加
- `figureWide` を追加
- 既存図解を無理に同一サイズへ引き伸ばさず、用途に応じた幅指定を維持
- TVキャンセラー記事で、カバー画像が本文中にも重複表示されていた状態を解消

### 6. 公開原稿と内部リンクを整理

- COLUMNのアクション文を公開時点に合う現在形へ変更
- ADAS GUIDEから既存の中古カスタム車GUIDEへ正式リンク
- 足回りGUIDEの汎用 `/guide` リンクを具体的な関連記事URLへ変更
- 内容の重複ではなく、親COLUMNと子GUIDEの役割が分かれる導線を維持

### 7. 出典を一次・公式資料中心へ整理

各記事の出典を、行政機関、規格、業界団体、自動車・部品メーカー等の一次・公式情報を中心に整理した。

リンクの数を増やすことではなく、本文の根拠として説明可能な資料を残すことを優先した。

### 8. 専用の自動検証を追加

`scripts/verify-article-design-system.mjs` を追加し、`prebuild`へ組み込んだ。

検証内容:

- 対象7記事の存在
- `cbj-world-v1`
- ヒーロー情報、会話、LESSON番号
- 旧トップレベル `body` の不在
- 公開更新理由への内部実装語混入
- 公開時点と矛盾する予定表現
- 汎用カテゴリURLを使ったアクションリンク
- 章ID重複
- 使用可能なブロック、variant、motion
- ローカル画像の実在
- alt、width、height
- HTTPS出典

## 旧デザインの扱い

今回の対象7記事は新しい共通レンダラーで表示される。旧Common / Visual / Kinto系のコンポーネント名、CSS名、旧画像パスについて、アプリケーションコードからの参照がないことを確認する。

CBJ全体の旧ブランド表現は今回の対象外であり、トップ、CARS、HERITAGE等の改修時に別工程で扱う。

## 検証項目

最終納品前に以下を実行する。

- `npm run prebuild`
- `npm run typecheck`
- `npm run lint:strict`
- Next.js production build
- `npm run postbuild`
- `npm run security:audit`
- 対象COLUMN 1記事とGUIDE 6記事のproduction HTTP 200
- 旧記事コード・旧CSS名の参照確認
- ZIP破損検査

## 今回の完成範囲

コード、記事データ、SEO構造、記事内UI、production buildまでを完成範囲とする。

以下はリポジトリ内だけでは完了を断定しない。

- iPhone実機Safari
- Android実機Chrome
- Vercel Preview
- 本番デプロイ
- GitHub反映
- 実機画面録画によるKimiモックとの最終モーション比較

実機未確認部分を、実機確認済みとは記載しない。
