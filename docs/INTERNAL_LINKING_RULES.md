# INTERNAL_LINKING_RULES（回遊・related）

最終更新: 2025-12-25

## 目的
- “読む価値” を連鎖させる。外部より内部回遊が先（特にHERITAGE）。

## related の優先順位（固定）
1. 明示 `related*Slugs`
2. フォールバック（タグ/intentTags/本文言及など）※カテゴリ別の定義に従う
3. それでも足りない場合のみ、安定した補完（同タグ/同maker等）


## related の入力フォーマット（非破壊で段階移行）
### 旧（互換維持）
- `relatedCarSlugs`
- `relatedGuideSlugs`
- `relatedColumnSlugs`
- `relatedHeritageSlugs`

### 新（推奨 / v2.0）
- `related: { cars:[], guides:[], columns:[], heritage:[] }`

**読み取り優先順位（固定）**
- `related.*` が存在する場合は **必ずそちらを優先**
- 無い場合のみ旧 `related*Slugs` を参照

※データ側は「旧を消さない」。移行は“追加→徐々に置換”で行う。

## 実装ルール
- 関連取得は **`lib/related-content.ts` が実体**
- slug解決は **順序維持 + 重複排除 + 不存在は落とす**
- ページ側で勝手にフィルタ/並び替えをしない（viewmodelで完結させる）

## “文脈” で貼る
- 本文内：問い→答え先へ（ただのリンク羅列は禁止）
- ページ末：次に読む棚で “自然に” 選ばせる
