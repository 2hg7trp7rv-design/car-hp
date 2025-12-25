# DATA_OPERATIONS（JSON運用と事故防止）

最終更新: 2025-12-25

## 何が正か
- 正は各カテゴリ1ファイル：
  - `data/heritage.json`
  - `data/cars.json`
  - `data/columns.json`
  - `data/guides.json`
- 退避は `data/_archive/`（参照しない）

## 追加/更新の手順（安全）
1. 追加するitemを該当JSONへ追記
2. slug重複がないか確認（カテゴリ内）
3. relatedSlugs の参照先が存在するか確認
4. `npm run validate` を実行（参照切れ/重複/型崩れを検出）
5. 1件は必ずローカル/Previewでページ表示確認

## よくある事故と回避
- relatedSlugs に存在しないslug → ビルド/表示で落ちる原因
- “似たJSONを別名で増やす” → どれが正か分からなくなる（禁止）

## 命名
- slugは小文字、ハイフン区切り、カテゴリが分かる粒度に固定
- titleJaは自然な日本語（AIっぽい硬語を避ける）


### related v2.0（非破壊移行）
- 旧 `related*Slugs` は残す（互換維持）
- 新 `related: { cars, guides, columns, heritage }` を併記してOK
- 解決優先は **related.*** → 旧 `related*Slugs`

### Automated validation

Before pushing/deploying, run:

- `npm run validate` — detects slug duplicates and broken related references (new `related.*` and legacy `related*Slugs`)

## Canonical JSON formatting
To keep diffs small and prevent accidental merge noise:
1) Update the data file(s).
2) Run `npm run validate`.
3) Run `npm run format:data`.
4) Commit.
CI will fail if formatting is not canonical (`npm run check:data-format`).
