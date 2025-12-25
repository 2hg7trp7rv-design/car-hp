# docs/INDEX

## 執筆・調査メソッド（必読）
- `docs/writing/WRITING_RESEARCH_COMMON.md`：共通の調べ方・構成・文体ルール
- `docs/writing/HERITAGE_WRITING_METHOD.md`：HERITAGEの調べ方・書き方
- `docs/writing/COLUMN_WRITING_METHOD.md`：COLUMNの調べ方・書き方
- `docs/writing/GUIDE_WRITING_METHOD.md`：GUIDEの調べ方・書き方

最終更新: 2025-12-25

- リポジトリ全体の指針（入口）：`REPO_PLAYBOOK.md`
- 編集/企画の総合指針：`CONTENT_PLAYBOOK.md`
- カテゴリ別：
  - `HERITAGE_GUIDE.md`
  - `CARS_GUIDE.md`
  - `COLUMN_GUIDE.md`
  - `GUIDE_GUIDE.md`
- SEO/Discover：`SEO_DISCOVER_RULES.md`
- 回遊/内部リンク：`INTERNAL_LINKING_RULES（related v2.0対応）.md`
- データ運用：`DATA_OPERATIONS.md`

- テンプレ（コピペ用）：`templates/`
  - `CONTENT_BRIEF_TEMPLATE.md`
  - `QUALITY_SELF_REVIEW.md`
  - `HERITAGE_CHECKLIST.md`
  - `CARS_CHECKLIST.md`
  - `COLUMN_CHECKLIST.md`
  - `GUIDE_CHECKLIST.md`
  - `INTERNAL_LINK_TEMPLATE.md`
  - `CTA_PLACEMENT_TEMPLATE.md`
  - `DATA_UPDATE_CHECKLIST.md`

### Data update quick commands
- Validate (breakage prevention): `npm run validate`
- Format JSON (clean diffs): `npm run format:data`
- CI/Build format check: `npm run check:data-format`

## Assistant / 開発・改修の最短導線
- 入口: `ASSISTANT.md`
- 手順: `docs/ASSISTANT_WORKFLOW.md`
- 構造: `docs/ARCHITECTURE_MAP.md`
- 制約: `docs/DESIGN_CONSTRAINTS.md`
- スキーマ: `docs/DATA_SCHEMAS.md`
- 用語: `docs/GLOSSARY.md`

## Reports
- `docs/reports/placeholder-assets.md` (generated placeholders list)
- `docs/reports/work-queue.md` — prioritized fix order for missing assets / base fields
- 欠け画像/要注意一覧（生成）: `npm run report:content:full` → `docs/reports/missing-assets.md`
