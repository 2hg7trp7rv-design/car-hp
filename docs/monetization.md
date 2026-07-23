# マネタイズ運用ガイド

## 全体の仕組み

- マネタイズ UI はデフォルト OFF。Vercel の環境変数 `NEXT_PUBLIC_ENABLE_MONETIZATION=true` で有効化
- ガイド記事には `monetizeKey` が付いており、`components/guide/GuideMonetizeBlock.tsx` が
  キーに対応する CTA ブロックを記事下部（`guide_bottom`）に表示する
- 表示可否は `lib/monetize.ts` の `canRenderGuideMonetizeBlock()` が一元管理し、
  記事上部の PR バッジ（`components/monetize/MonetizePrBadge.tsx`）と条件を共有する
- すべてのアフィリエイトリンクに `rel="nofollow sponsored noopener noreferrer"` を付与済み

## パートナー URL の管理

`data/monetize/partners.json` が提携先の一覧（現状はすべて `url: "#"` のプレースホルダー）。
ASP 未提携のため、推測で単価・URL を書かないこと。

### 差し替え手順（ASP 提携後）

1. `partners.json` の該当パートナーの `url` を発行されたアフィリエイト URL に差し替える
2. `data/affiliateLinks.prod.json` にも対応する実リンクを設定する
   （`GuideMonetizeBlock` は `lib/affiliate.ts` 経由でこちらを参照する）
3. Vercel の環境変数を確認する
   - `NEXT_PUBLIC_ENABLE_MONETIZATION=true`
   - `NEXT_PUBLIC_AFFILIATE_ENV=prod`
4. 再デプロイし、対象記事で PR バッジと CTA ブロックが出ることを確認する

## 法務・表記ルール

- 景表法: マネタイズブロックが出る記事は上部の PR バッジが自動表示される。条件を分けないこと
- 保険: 「特定の保険商品を推奨するものではありません」の注記を保険関連セクションに必ず付ける
- 計測: クリックは `affiliate_click` イベントで partner / position / content_id を記録する
  （`docs/measurement.md` 参照）
