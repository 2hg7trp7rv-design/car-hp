# CBJ 子Guide 最終公開前制作修正レポート 2

対象: 既存Guide 6本と表示基盤  
基準: `modern-car-custom-regret-reason-column` / `CBJ_記事設計方針_親子構造とモックページ記録_v1`  
作業日: 2026-06-30

## 目的

親Columnを正とし、既存Guideを子記事として公開前品質まで引き上げる。  
単なる原稿修正ではなく、記事設計、事実性、読者心理、表示設計、検証導線をまとめて調整する。

## 修正方針

- 親Columnの3軸である「何を変えたいか」「どこまで影響するか」「元に戻せるか」を、Guide側の冒頭・判断カード・次記事導線へ接続する。
- 子Guideは専門家向けの診断記事ではなく、初心者が一つの疑問を必要十分に理解する記事として維持する。
- 「怖がらせる記事」ではなく、「確認すれば楽しめる記事」に寄せる。
- ADAS、保証、車検、電装品、修復歴などは断定しすぎない。
- 記事内に制作側都合の言葉を出さず、読者向けの自然な表現にする。
- 一覧・カード・References 表示も含めて、記事単体ではなく導線全体を確認する。

## 対象記事

- `aftermarket-air-cleaner-risk-guide`
- `car-suspension-hard-soft-merit-demerit`
- `electronic-damper-coilover-risk-guide`
- `adas-lowered-car-aiming-risk-guide`
- `tv-canceller-can-risk-guide`
- `used-custom-car-check-guide`

## 主な修正

### 1. 記事本文・導線

- `公開前の判断` という制作側の見出しを、読者向けの `CBJの判断基準` へ変更。
- `関連する記事` を、行動導線として自然な `次に読む記事` へ変更。
- `親Column` / `このGuide` など、読者に不要な内部設計語を削除。
- 各Guideのリードと末尾を、親Columnから自然に流入した読者が理解できる表現へ調整。
- TVキャンセラー記事では、運転者の走行中視聴を推奨しない姿勢を本文冒頭に再明示。

### 2. 表示タグ・一覧導線

- Guide用の表示タグに `吸気` / `足回り` / `電装` / `安全装置` を追加。
- Guide一覧の上部タグ表示数を増やし、子記事の領域が一覧で見えるように調整。
- 表示タグ用の画像プールを追加し、prebuild の media 検証を通る状態にした。

### 3. References 表示

- References の表示を、URL断片ではなく読者が根拠の種類を理解できる名称へ調整。
- NALTEC、国土交通省、AFTC、JASPA、NAPAC、KYB、Monroe、Bosch、DENSO、ISO などを、記事末尾で読みやすい形にした。

### 4. 検証スクリプト

- `scripts/verify-production-html.mjs` の検証URLを現行のGuide 6本と親Columnに更新。
- 古いURLを前提にした確認をやめ、現在の公開面と一致する検証対象へ修正。

### 5. Build 設定

- 大量静的生成時の安定性を優先し、Next.js の experimental worker 設定を低並列化。
- `data/articles` はサーバー実行環境へ同梱されるよう `outputFileTracingIncludes` を維持。

## 検証結果

| 項目 | 結果 |
|---|---:|
| JSON構文 | OK |
| `npm run lint:strict` | OK |
| `npm run prebuild` | OK |
| public-assets 参照 | OK |
| sitemap / robots | OK |
| internal links | OK |
| Guide 6本の静的HTML生成 | OK |
| `npm run build` 完走 | 未完了 |
| Vercelプレビュー確認 | 未実施 |
| スマホ実機確認 | 未実施 |

## Build の注意

この環境では `next build --webpack` が `Generating static pages (199/199)` まで到達し、対象Guideの静的HTMLも生成された。  
ただし、`Collecting build traces` の段階でタイムアウトしたため、ローカル上の build 完走とは判定しない。

これは原稿・JSON・表示タグ修正とは別の、Next/Vercelビルド検証上の未完了項目として扱う。

## 最終判定

原稿、記事設計、子記事深度、表示タグ、References、prebuild、lint は公開前品質まで修正済み。  
ただし、Vercelプレビューとスマホ実機確認が完了するまでは、制作会社判定として最終公開OKとはしない。
