# docs/ASSISTANT_WORKFLOW

ChatGPT/エージェントが「迷わず」「壊さず」作業するための標準手順。

## 0. 変更の原則
- 既存機能維持（削除/挙動変更は原則しない）
- 変更は“必要箇所だけ”。責務は `components/` と `lib/viewmodel/` に寄せる
- 仕様判断が入る場合は、先に `docs/*PLAYBOOK*.md` の該当箇所へ根拠を紐付ける

## 1. 依頼を分類する（まずここ）
- コンテンツ追加: JSON追記 + 画像追加
- UI改善: コンポーネント調整（デザイン制約厳守）
- 機能追加: 新規コンポーネント/ユーティリティ追加（既存を置換しない）

## 2. 参照すべきドキュメント（優先順）
1) `docs/DESIGN_CONSTRAINTS.md`（世界観・UI制約）
2) `docs/REPO_PLAYBOOK.md`（運用の正）
3) `docs/CONTENT_PLAYBOOK.md`（内容方針）
4) `docs/DATA_SCHEMAS.md`（JSONの必須/推奨）
5) `docs/templates/*`（チェックリスト）

## 3. 実装の基本フロー
1) 対象の入口を特定
   - ルーティングは `app/`（動的ページは `[slug]`）
   - 表示ロジックは `lib/viewmodel/` を優先
2) 変更を最小化（既存構造を壊さない）
3) データ更新がある場合は必ず `npm run format:data`
4) `npm run validate && npm run build`

## 4. 納品時の出力フォーマット（必須）
- 変更ファイル一覧
- 各ファイルの行数差分（+/-）
- 影響範囲（どのページ/どのデータが変わるか）
- validate/build の想定結果（strictで落ちるかどうかも）

## 5. 事故が起きやすいポイント（必ず確認）
- `related*Slugs` が実在しない → 回遊リンクが壊れる
- 画像 `/images/...` が `public/images/...` に無い → カードやOGが欠ける
- type/status の表記ゆれ → 取りこぼし
