# CAR BOUTIQUE JOURNAL v3 — Driving Cinema 統合指針

更新日: 2026-04-29
バージョン: v3.0

## 1. コンセプト

CAR BOUTIQUE JOURNAL is a cinematic journal of driving.

観るところから始まり、知るところで終わる。

トップページはシネマ、記事詳細とカテゴリ詳細はジャーナル。トップの前半で視覚的な引力を作り、Featured Story 以降で実用的な判断材料へ切り替える。

## 2. 有効なデザイン原則

- Motion First: スクロール、カーソル、時間に反応する。
- One-Color Override: クリーム、墨黒、コバルトのみで設計する。
- Space As Velocity: 余白は均等にせず、48 / 96 / 144 / 216 のリズムを使い分ける。

## 3. 採用トークン

```css
--paper: #F6F2EB;
--paper-light: #FBF8F3;
--ink: #0E0C0A;
--ink-soft: #4C453D;
--cobalt: #1B3FE5;
--cobalt-deep: #0F2DAA;
--cobalt-glow: rgba(27, 63, 229, 0.18);
```

コバルトはリンク、現在進行、未来を指す要素に限定して使う。

## 4. タイポグラフィ

主見出しは Sans 系の Bold から SemiBold。和文は Noto Sans JP 系、欧文は Inter Tight 系、Mono は JetBrains Mono 系を基準にする。大見出しは文字間を詰め、現代的な緊張感を優先する。

## 5. トップページ構成

1. Pre-Hero Loader
2. Cinema Hero
3. Threshold
4. Featured Story
5. Number Drift
6. Image Sequence
7. Index Grid
8. Footer Cinematic

各セクションの主役となるインタラクションを変え、同じ構造の反復にしない。

## 6. 実装済み Phase A

- `app/page.tsx` を `HomeCinema` へ切替。
- `components/home/HomeCinema.tsx` と CSS module を新規作成。
- Lenis を `app/layout.tsx` 配下の `SmoothScrollProvider` で初期化。
- GSAP を依存関係に追加。
- グローバルトークンを v3 の紙、墨黒、コバルト体系に統一。
- `site-map` と `search` の title 二重化を修正。
- 旧設計ドキュメントを archive 扱いへ整理。

## 7. 変更しない範囲

- `data/articles/` の本文 JSON。
- リダイレクト設定。
- sitemap 生成スクリプト。
- 既存記事詳細の本文構造。

## 8. 次フェーズ

Runway などで生成した動画アセットが揃った後、Hero の MP4 ループ、GSAP ScrollTrigger、より精密な画像シーケンス制御を統合する。
