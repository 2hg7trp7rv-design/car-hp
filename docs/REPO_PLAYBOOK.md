# CAR BOUTIQUE / car-hp リポジトリ指針（Playbook）

最終更新: 2025-12-25

## まず最初に見る場所（迷ったらここ）

- docs目次：`docs/INDEX.md`
- 企画ブリーフ（コピペ）：`docs/templates/CONTENT_BRIEF_TEMPLATE.md`
- 公開前の品質チェック：`docs/templates/QUALITY_SELF_REVIEW.md`
- カテゴリ別チェックリスト：`docs/templates/*_CHECKLIST.md`
- 内部リンク設計（manifest）：`docs/templates/INTERNAL_LINK_TEMPLATE.md`
- CTA配置テンプレ：`docs/templates/CTA_PLACEMENT_TEMPLATE.md`
- データ更新チェック：`docs/templates/DATA_UPDATE_CHECKLIST.md`

このファイルは「このリポジトリは何で、何が正で、どう直すべきか」を **1分で思い出す**ための指針です。  
目的は **“構造の混線を防ぎつつ、機能・世界観・計測（GA/SEO）を落とさない”** こと。

---

## まずここを見る（入口）

- ライティング/企画の指針（カテゴリ別・サイト主の好み含む）
  - `docs/CONTENT_PLAYBOOK.md`
  - `docs/HERITAGE_GUIDE.md`
  - `docs/CARS_GUIDE.md`
  - `docs/COLUMN_GUIDE.md`
  - `docs/GUIDE_GUIDE.md`
- SEO / Google Discover / 構造化データ
  - `docs/SEO_DISCOVER_RULES.md`
- 回遊（related）と内部リンク設計
  - `docs/INTERNAL_LINKING_RULES.md`
- データ運用（JSONの正、追加/統合/検査の手順）
  - `docs/DATA_OPERATIONS.md`

---

## 0. 絶対に守る前提（Non‑negotiables）

### 世界観（見た目）
- サイト全体の背景色（ベースカラー）は現状維持。
- コンテンツは白いカード/コンテナでリッチに見せる（カードの余白/角丸などは調整可）。
- 文言/説明のトーンは現状の世界観を壊さない（過度に軽い煽り、スラング過多は避ける）。

### 収益導線（禁止・許可）
- **HERITAGE：外部誘導（アフィ/購入/選び方）は原則禁止。内部回遊に徹する。**
- **CARS / COLUMN / GUIDE：外部誘導は許可**（ただし押し付けない。自然導線・文脈一致が必須）
- “外部CTAの許可/禁止” は **ルール関数経由**で統制する（ページ側に散らさない）

### 機能非劣化（リファクタ時の条件）
- URL（`/heritage/[slug]` 等）、表示順、カード件数上限、並び順、イベント名、Json-LDの型は変えない。
- related の優先順位（明示slug → フォールバック）は変えない。
- “出る/出ない” の条件は変えない（0件時の挙動含む）。

---

## 1. このリポジトリの設計意図（超要約）

- **HERITAGE が世界観アンカー（旗艦）**  
  → ここで「思想・時代・設計・評価の変遷」を読み物として成立させ、回遊の起点にする。
- **CARS / COLUMN / GUIDE は回遊と実用の装置**  
  → HERITAGE で温度を上げ、CARSで具体像、COLUMNで論点補強、GUIDEで行動（整備/維持/保険/買取/用品）へ。

---

## 2. “正”の置き場所（Single Source of Truth）

### A) Data（コンテンツの一次情報）
- **各カテゴリ 1ファイルが正**（増殖させない）
  - `data/heritage.json`
  - `data/cars.json`
  - `data/columns.json`
  - `data/guides.json`
- 退避は `data/_archive/`（**参照しない**）

### B) Domain / Logic（読み取り・整形・関連付け）
- **Repository層**: JSON読み取り・基本検索（slugで取る、一覧を取る）
  - `lib/repository/*-repository.ts`
- **Related層**: 関連取得は一箇所
  - `lib/related-content.ts`（実体）
  - `lib/relations.ts`（互換用の薄い窓口）
- **ViewModel層**: 表示に必要な“派生値”をまとめて作る（meta/jsonLd/related含む）
  - `lib/viewmodel/*-detail.ts(x)`  
  - 原則：**詳細ページは「取得 → viewmodel → 描画」**に寄せる

### C) UI（描画）
- 共通の注入（ScrollDepth/JsonLd など）はページに散らさず共通化（`DetailPageScaffold`等）。

---

## 3. “ごちゃつき”が起きる典型と、解決の型

### 典型1：同じ役割が2箇所に存在
- 例：related が `relations.ts` と `related-content.ts` に分裂
- 対策：**実体を1箇所に統一** → 旧は re-export/wrapper で互換維持 → 段階的に参照置換

### 典型2：page.tsx が賢すぎて肥大化
- 対策：計算・整形・判定を viewmodel へ退避。ページは描画に集中。

### 典型3：カードUIの重複
- 対策：`RelatedSection + Related*Grid` のように “表示枠” と “カード列” を共通化。

---

## 4. 変更時のチェックリスト（最低限）

### データ（JSON）変更
- slug重複なし（カテゴリ内）
- relatedSlugs の参照先が存在（存在しないslugは入れない）
- 必須フィールドが欠けていない
- `npm run validate` が通る（参照切れ/重複/型崩れがない）

※ `npm run build` の前に `npm run validate` が自動実行される（prebuild）

### 詳細ページ（表示）変更
- Related：件数・順序・表示条件が不変
- CTA：HERITAGEに外部CTAが出ない / 他カテゴリはルールどおり
- 計測：イベント名が変わらない
- SEO：canonical/OG/Json-LDの型が変わらない

---

## 5. “迷ったら” の判断ルール
- **文章/企画/回遊の方針** → `docs/CONTENT_PLAYBOOK.md`
- **カテゴリ別の禁則・構成** → `docs/*_GUIDE.md`
- **Discover/SEO/構造化データ** → `docs/SEO_DISCOVER_RULES.md`
- **関連/内部リンクの優先順位** → `docs/INTERNAL_LINKING_RULES.md`
- **JSON運用と事故防止** → `docs/DATA_OPERATIONS.md`
---

## 6. リポジトリ地図（どこに何があるか）

### app/（ルーティングとページ）
- `app/heritage/[slug]/page.tsx`：HERITAGE詳細（取得→viewmodel→描画）
- `app/cars/[slug]/page.tsx`：CARS詳細
- `app/column/[slug]/page.tsx`：COLUMN詳細
- `app/guide/[slug]/page.tsx`：GUIDE詳細
- 一覧/ハブ系：`app/*/page.tsx`（※カテゴリによって構成が違う）

### data/（一次情報：ここが“正”）
- `data/heritage.json` / `cars.json` / `columns.json` / `guides.json`
- `data/_archive/`：過去ファイル退避（参照しない）

### lib/（ロジック）
- `lib/repository/*`：JSON読み取り（一覧/slug取得）
- `lib/viewmodel/*-detail*`：詳細ページの表示モデル生成（meta/jsonLd/related含む）
- `lib/related-content.ts`：関連取得の実体（優先順位・slug解決）
- `lib/page-rules.ts`：外部CTA許可/禁止などのポリシー

### components/（UI部品）
- `components/related/*`：Relatedセクション共通UI（枠 + グリッド）
- `components/content/*`：本文レンダ（blocks/inline/ReaderShell）
- `components/monetize/*`：CTA/アフィ周り（ページルールを必ず通す）

---

## 7. “これを変えたい”時に触る場所（レシピ）

### A) 新しいHERITAGEを追加したい
1. `data/heritage.json` に1件追加
2. 可能なら `relatedCarSlugs / relatedGuideSlugs / relatedColumnSlugs` を明示
3. 明示が難しい場合は tags/intentTags を入れてフォールバックが効くようにする
4. 表示確認：HERITAGE詳細 → 末尾の related が想定どおり出るか

### B) CARSの関連（HERITAGEやGUIDE等）を調整したい
- まずは該当JSONの `related*Slugs` を直す（最優先）
- 仕様を変える必要がある場合のみ `lib/related-content.ts` / viewmodel を触る

### C) HERITAGEに外部CTAが出てしまう／出したくない
- ルールは `lib/page-rules.ts` が正
- 表示側（CTAコンポーネント）がルールを無視していないか確認
- HERITAGEでは“内部回遊の棚”で解決する（GUIDEへ渡す）

### D) Discover向けに“刺さる”企画を増やしたい
- `docs/SEO_DISCOVER_RULES.md` と `docs/HERITAGE_GUIDE.md` の構成ルールに沿って作る
- HERITAGE本文は「当時→設計思想→評価の変遷→いまの目線」を崩さない


### related v2.0（非破壊移行）
- 旧 `related*Slugs` は残す（互換維持）
- 新 `related: { cars, guides, columns, heritage }` を併記してOK
- 解決優先は **related.*** → 旧 `related*Slugs`

## Content validation (CI)

- Local: `npm run validate` (broken related targets / duplicate slugs / shape issues)
- Build: `npm run build` runs `validate` first (prebuild)
- CI: `.github/workflows/validate.yml` runs `npm run validate` on PR/push

## Data formatting (must keep diffs clean)
- Canonical formatting is enforced for `data/*.json` (array order preserved; object keys sorted; 2-space indent).
- Commands:
  - `npm run format:data` — rewrites target JSON files into canonical formatting.
  - `npm run check:data-format` — fails if formatting is not canonical (used in CI and prebuild).
- Policy:
  - When adding/updating content, run `npm run format:data` before commit to avoid noisy diffs.

## Strict validation (optional)
- Default `npm run validate` is designed to prevent breakages (duplicate slugs, missing references).
- If you want to enforce “recommended fields must exist” for content quality, use:
  - `npm run validate:strict`
- Strict mode promotes some warnings (missing title/summary/body, etc.) to errors.

### What strict mode additionally enforces
- Recommended fields become required (errors): e.g. `title`, `summary`, `body`, `heroImage`, `publishedAt`, etc.
- Basic date hygiene: `publishedAt` / `updatedAt` should be ISO-like.
- Local asset hygiene (for paths like `/images/...`): if the referenced file does not exist under `/public`, it is treated as an error.
  - If your workflow keeps images external, you can keep using remote URLs (they are not checked).
