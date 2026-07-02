# CBJ COLUMN・GUIDE 記事デザインシステム

更新日: 2026-06-24  
対象: COLUMN / GUIDE  
実装バージョン: `cbj-world-v1`

## 1. 目的

Kimiモック「車のカスタムで後悔しやすい理由」の世界観を、固定テンプレートではなく再利用可能な記事部品として実装する。

統一するもの:

- 色、角丸、枠線、影、余白、文字の大小
- JUNA・莉奈のキャラクター表現
- ヒーロー、章見出し、会話、カード、表、図解、手順、FAQ、出典
- 浮遊、明滅、見出し出現、メニュー、目次、上部へ戻る動作

固定しないもの:

- 章数
- 会話数
- 画像数と位置
- カードの種類と使用順
- COLUMNとGUIDEの本文構成

記事側のJSONが、必要な部品を必要な順番で明示選択する。実行時のランダム選択は行わない。

## 2. 正式な表示経路

- COLUMN: `ColumnEditorialArticlePage` → `CbjWorldArticlePage`
- GUIDE: `GuideEditorialArticlePage` → `CbjWorldArticlePage`

SEOメタデータ、Article/Breadcrumb/FAQ JSON-LD、関連記事取得は既存の詳細ページ側に残す。記事デザインレンダラーは本文表示を担当する。

## 3. 記事の有効化

記事JSONで以下を指定する。

```json
{
  "layoutVariant": "cbj-world-v1",
  "articleDesign": {
    "version": "cbj-world-v1",
    "lessonNumber": 17,
    "difficulty": "初級〜中級",
    "heroGradient": ["#FF6B8A", "#FF8E53"],
    "heroCenterImage": "/images/cbj/article-system/car-illustration.webp"
  }
}
```

スラッグをコードへ直書きして表示を分岐しない。

## 4. 部品の箱

`detailSections[].blocks[]`は任意の数・順番で並べられる。

- `paragraph`
- `subheading`
- `image`
- `list`
- `quote`
- `divider`
- `comparisonTable`
- `callout`
- `flow`
- `timeline`
- `decisionCards`
- `editorialBoard`
- `caseStudy`

既存の意味データを保ちながら、表示候補は次のフィールドで選択する。

```json
{
  "type": "callout",
  "tone": "warn",
  "title": "確認事項",
  "body": "本文",
  "presentation": {
    "variant": "emphasis",
    "width": "normal",
    "motion": "scale-in"
  }
}
```

### presentation.variant

- `default`: 各ブロックの標準デザイン
- `soft`: 白系の柔らかい面
- `outline`: 枠線中心
- `emphasis`: アクセントを強めた表示
- `compact`: 上下余白を圧縮
- `lead`: 章の導入文。章色の細いラインと薄い面で、通常本文より一段強く表示
- `section`: 章内の中見出し。章色を使った小型アイコン付きカードとして表示

未知の値は標準表示へフォールバックする。

### presentation.width

- `normal`
- `wide`
- `bleed`

### presentation.motion

- `none`
- `fade-up`
- `fade-left`
- `fade-right`
- `scale-in`

本文全体をクライアントコンポーネントにせず、常時モーションはCSS、操作が必要なヘッダー・目次・戻るボタンだけを小さなクライアントコンポーネントにする。

## 5. 会話ブロック

会話は `articleDesign.introDialogue`、`sectionDialogues`、`closingDialogue` で任意に配置する。

```json
{
  "character": "juna",
  "text": "会話本文",
  "variant": "lead",
  "image": "/images/cbj/article-system/juna-avatar.webp",
  "label": "JUNA（ジュナ）",
  "motion": "fade-right"
}
```

### variant

- `bubble`: 標準吹き出し
- `lead`: 章導入向け
- `aside`: 補足向け
- `compact`: 一言コメント向け

`image`を指定しなければ共通のJUNA／莉奈画像を使用する。表情差分を追加する場合は、新しい画像パスを記事側で選ぶ。

## 6. モーション基準

Kimi元モックの値を初期基準とする。

- 通常浮遊: 3秒、Y -6px、ease-in-out、無限
- 遅い浮遊: 5秒、Y -4px、回転1度、無限
- スクロール案内: 2秒、Y 4px、無限
- 星の明滅: 4秒、透明度0.3〜0.65、無限
- 章番号: 0.5秒、下12pxから表示
- 章タイトル遅延: 0.1秒
- 章説明遅延: 0.2秒
- 右キャラクター遅延: 1.5秒

元モックにないスクロール連動演出を、再現作業中に勝手に追加しない。端末が `prefers-reduced-motion` を指定している場合だけ継続モーションを抑える。

## 7. 画像管理

共通素材:

```text
public/images/cbj/article-system/
```

記事別素材:

```text
public/images/cbj/article-system/content/<slug>/
```

Base64生成、起動時復元、別JSONからの画像生成は行わない。通常のWebP等を直接管理する。

## 8. COLUMNとGUIDE

同じデザインシステムを使うが、記事の役割は分ける。

COLUMNで優先するもの:

- 問題提起
- 背景と判断軸
- 比較
- 考察
- 子GUIDEへの導線

GUIDEで優先するもの:

- 手順
- チェック
- 注意
- 数値・表
- 適合確認
- 症状別の切り分け

部品数や順番を共通化しない。

## 9. 旧デザインの扱い

旧記事レンダラー、旧CSS、旧Visual/Kinto試作、旧レイアウトJSON、旧記事専用画像は削除済み。復活させない。

旧コンポーネント名や旧画像パスを新コードから参照してはならない。削除後は `prebuild`、型、lint、public-assets、内部リンク、sitemap、robots、本番ビルドで確認する。

## 10. 実装変更時の必須確認

1. 最新リポジトリを確認
2. 対象JSONを確認
3. 表示コンポーネントを確認
4. 共通CSSを確認
5. 画像パスとpublic-assetsを確認
6. sitemap / robots / audit / prebuildを確認
7. 親COLUMNと子GUIDEの役割を比較
8. モック・スクリーンショット・コード想定を照合
9. 実機未確認なら実機確認済みと断定しない
10. 根拠を示してOK/NGを判断

## 11. 2026-06-24 現在の実装範囲

`cbj-world-v1`へ移行済みの記事は7本。

### COLUMN

- `/column/modern-car-custom-regret-reason-column`

### GUIDE

- `/guide/adas-lowered-car-aiming-risk-guide`
- `/guide/aftermarket-air-cleaner-risk-guide`
- `/guide/car-suspension-hard-soft-merit-demerit`
- `/guide/electronic-damper-coilover-risk-guide`
- `/guide/tv-canceller-can-risk-guide`
- `/guide/used-custom-car-check-guide`

全記事を同じ固定構成にはしていない。既存の本文ブロック構造を維持し、記事ごとの章数、画像数、カード数、会話数、表示バリエーションをJSONから選択する。

開発時は `/article-system-preview` で、会話・POINT/CAUTION・NG/OK対比・チェックリスト・数値表・図解・手順の実表示を確認できる。Production buildでは `notFound()` を返し、検索インデックスには公開しない。

2026-06-24の追加改善では、長い章が平坦に見えないよう、`lead`と`section`を追加した。これらも全記事へ自動適用せず、必要な章・中見出しだけ記事JSONで選択する。

## 12. 検証ルールと未確認範囲

改修ごとに以下を実行する。

- `npm run prebuild`
- `npm run lint:strict`
- `npm run typecheck`
- `npm run build`
- `npm audit --omit=dev`
- COLUMN / GUIDE 全7記事のHTTP応答確認
- 390px / 768px / 1280pxの静止表示確認
- 旧レンダラー名・旧CSS名・旧画像パスの参照ゼロ確認

2026-06-24の今回改修では、最新ページPDFとの比較から以下を修正した。

- ヒーロー下端に発生していた巨大な黒い円弧を削除
- 本文の一文ごとの強制改行を廃止し、自然な段落フローへ変更
- JSONの強調語を過剰なマーカーではなく抑制した下線強調として表示
- 章タイトルと記事目次で意図的な改行を保持
- NG / OK、チェックリスト、数値表を別デザインとして選択可能にした
- GUIDEの長いSEOタイトルと、ヒーロー表示用の短いタイトルを分離
- 巨大レンダラーをHero / Content / End Sectionsへ分割
- 開発用の部品カタログを追加

未確認事項:

- 実機iPhone / Androidでの目視・タップ操作
- 実機Safari / Chrome上での継続モーション比較
- Vercel Preview上での表示

実機未確認の状態で、実機確認済みとは記載しない。

## 13. 2026-06-25 対象COLUMNの正本化と原稿修正

`modern-car-custom-regret-reason-column` は、Kimi系モックの見た目を共通レンダラーで維持しつつ、本文を親COLUMNの判断軸へ再整理した。

- 対象JSONを唯一の編集元とする
- prebuild時の圧縮ペイロード復元を禁止する
- 車種差を無視した数値・費用・一律基準を公開本文へ置かない
- CAN / ADAS / 暗電流 / 保証は、車種情報・整備情報・保証条件に基づく表現とする
- 詳細な測定値、作業方法、症状別診断は子GUIDEへ分ける
- 5ステップ図解は同一幅のカードで表示する

詳細は `CBJ_ARTICLE_DESIGN_SYSTEM_IMPLEMENTATION_7.md` を参照する。

## 14. 2026-06-25 対象COLUMN原稿をモック準拠へ復元

デザイン再現を先に確定するため、`modern-car-custom-regret-reason-column` の本文、会話、表、注意書きをKimiモック準拠の状態へ戻した。

- 最後のチェック、関連実用ガイド、著者、関連記事、FAQ、出典、更新履歴は維持する
- 5つの順番、良いカスタムの条件、店舗受け入れのCAUTIONも維持する
- 対象JSONを唯一の編集元とする構成は維持する
- 原稿の事実確認と再編集は、デザイン確定後の別工程とする

詳細は `CBJ_ARTICLE_DESIGN_SYSTEM_IMPLEMENTATION_8.md` を参照する。
