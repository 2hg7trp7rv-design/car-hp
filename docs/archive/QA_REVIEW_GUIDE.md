# QA Review — GUIDE (Index / Detail)

対象: `/guide` / `/guide/[slug]`

## 優先度
GUIDEは「結論→手順→次の一手」を短距離で繋ぐページ。
一覧の探索性と、詳細の“章ジャンプ/チェック”体験が崩れると、価値が出ない。

## 赤入れ（改修前に起きやすい問題）
1) 目次（details/リンク）のタップ領域が不足しがち
- スマホで「開く/閉じる」「章へ飛ぶ」の誤タップが起きる
- `overflow-hidden` の都合で focus のリングが欠けやすい

2) PILLAR導線・小さめリンクの当たり判定
- “戻る”が細いと、回遊が切れる

3) 一覧（チップ/ページ送り）が押しにくい
- 探すページがストレスだと、コンテンツに到達しない

4) ヒーローカルーセルのドットが小さい
- 補助UIでも、操作対象としては最小サイズ基準を下回る

## 実施した改修（規格適用）
- `InThisStoryToc` の summary / 各項目リンクを `.cb-tap` 化
  - focus ring は `ring-inset` にして、カード内でも欠けない
- GUIDE詳細の PILLARリンクを `.cb-tap` へ
- GUIDE詳細の読了後に「TOPへ戻る / 一覧へ」導線を追加（雰囲気は維持）
- GUIDE一覧の HUB / チップ / ページネーション / PREV-NEXT / 主要CTA を `.cb-tap` で統一
- `GuideHeroCarousel` のドットを「見た目は小さいまま、当たり判定は44px」に変更
- Checklist のラベルを `min-height: 44px` にしてチェック操作を安定化

## 変更ファイル
- `app/guide/page.tsx`
- `app/guide/[slug]/page.tsx`
- `components/content/InThisStoryToc.tsx`
- `components/guide/GuideHeroCarousel.tsx`
- `app/globals.css`

## 目視で最終確認すべき項目（Vercel Preview）
- iPhone幅で `/guide` のカテゴリ/タグ/ページ送りが片手で回れるか
- `/guide/[slug]` で「要点→目次→章ジャンプ→CHECK POINT→関連記事→TOP」が破綻しないか
- TOC/ドットの focus-visible が確実に見えるか（overflowで欠けないか）
