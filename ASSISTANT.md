# ASSISTANT / Start Here

このリポジトリで「記事作成」「機能追加」「整合性維持」を迷わず進めるための入口。

## 最重要（壊さないための前提）
- 既存機能は落とさない（削除・非表示・挙動変更は必ず理由と影響範囲を明記）
- 既存の世界観（配色/文言/導線方針）は `docs/DESIGN_CONSTRAINTS.md` を優先
- データ整合性（related*Slugs / 画像パスなど）は `npm run validate` を必ず通す

## まず読む
- 全体索引: `docs/INDEX.md`
- リポジトリ運用の“正”: `docs/REPO_PLAYBOOK.md`
- コンテンツ方針: `docs/CONTENT_PLAYBOOK.md`
- データ操作: `docs/DATA_OPERATIONS.md`

## 迷いやすい所の“地図”
- 構造マップ: `docs/ARCHITECTURE_MAP.md`
- ルール（デザイン/制約）: `docs/DESIGN_CONSTRAINTS.md`
- スキーマ（JSON項目）: `docs/DATA_SCHEMAS.md`
- 用語集: `docs/GLOSSARY.md`

## よくある作業の最短ルート
### A) 記事を追加（HERITAGE / COLUMN / GUIDE / CARS）
1. `docs/*_GUIDE.md` と `docs/templates/*_CHECKLIST.md` を確認
2. `data/*.json` に追記（slug重複禁止）
3. `npm run validate`（必要なら `npm run format:data`）
4. 画像は `public/images/...` に配置し、JSONの `/images/...` 参照と一致させる

### B) 既存ページのUIや導線を改善（機能維持）
1. `docs/DESIGN_CONSTRAINTS.md` を先に守る
2. 変更は最小・局所（ページ直書きより `components/` と `lib/viewmodel/` を優先）
3. `npm run validate && npm run build`

## コマンド
- 整合性チェック: `npm run validate`
- strict（落とす）: `npm run validate:strict`
- データ整形: `npm run format:data`
- 整形崩れ確認: `npm run check:data-format`
- 状態レポート: `npm run report:content`

- 欠け画像/要注意一覧（生成）: `npm run report:content:full` → `docs/reports/missing-assets.md`


## Fast triage
- Prioritized work queue: `docs/reports/work-queue.md`

## Reports

- `docs/reports/placeholder-assets.md` (generated placeholders list)
