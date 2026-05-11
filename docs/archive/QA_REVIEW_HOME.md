# QA Review — HOME (Archive Gate)

対象: `/` (HomeMasterpiece)

## 優先度
P0/P2 を先に潰す（HOMEはサイトの“入館体験”なので、ここが未完成だと全体が未完成に見える）

## 赤入れ（改修前に起きやすい問題）
1) タップ領域が細い（特に Enter / Archiveカードの行リンク）
- “見た目は上質”でも、スマホでは押し損ねが起きやすい

2) フォーカスの見え方が弱くなり得る
- Gateカードは `overflow:hidden` のため、グローバルoutlineが視認しづらくなるケースがある

## 実施した改修（規格適用）
- Enterボタン / Gate内リンク（行リンク・Enterリンク）へ `.cb-tap` を付与
  - 重要導線のタップ領域を 44px 基準へ統一（見た目は維持したまま当たり判定を増やす）
- Home専用CSSで `:focus-visible` を上書き
  - outline依存ではなく、insetのリングで「カード内でも確実に見える」フォーカス表示に変更

## 変更ファイル
- `components/home/HomeMasterpiece.tsx`
- `components/home/home-masterpiece.module.css`

## 目視で最終確認すべき項目（Vercel Preview）
- iPhone幅で、Enter→Archive Gate→各Archive→戻る、が片手でストレスなく回れるか
- キーボード操作（Tab）で Enter / Gateリンクのフォーカスが確実に視認できるか
