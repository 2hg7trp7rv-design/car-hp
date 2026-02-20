# CBJ Design Tokens v1

このリポジトリでは、見た目の一貫性を「トークン（変数）」で担保します。トークンは “値” ではなく “役割” で命名し、ページごとの一回きりの色・余白・サイズを禁止します。

実体は `app/globals.css` の `:root` に定義されています（`--cb-*`）。Tailwindを使う場合でも、最終的な意味はトークンに寄せます。

---

## 1) Color（セマンティック）

Primitive（既存）

・`--cb-porcelain`（背景の白）
・`--cb-ink`（本文の濃いグレー）
・`--cb-tiffany`（アクセント）

Semantic（新規/整理）

・`--cb-color-bg` : ページ背景（通常）
・`--cb-color-surface` : カード/棚/パネルの背景
・`--cb-color-text` : 本文
・`--cb-color-muted` : 補助文/メタ情報
・`--cb-color-border` + `--cb-color-border-alpha` : 罫線
・`--cb-color-accent` + `--cb-color-accent-alpha` : リンク/状態/ハイライト
・`--cb-color-danger` / `--cb-color-warning` / `--cb-color-success` : 意味色（多用禁止）

運用ルール

・新しい色を足す前に、上の役割で表現できないかを確認する。
・写真上の文字は、色トークンではなく「暗幕・局所暗化・配置固定」で読みやすさを保証する。

---

## 2) Typography

・`--cb-prose-width` / `--cb-prose-width-wide` : 本文の行長上限（ch）
・`--cb-leading-body` : 本文の行間
・`--cb-leading-tight` : 見出しの行間
・`--cb-tracking-body` : 本文の字間
・`--cb-tracking-label` : ラベル系の字間

運用ルール

・長文ページは `cb-prose` を付け、段落/リストは `cb-prose-block` で柱に収める。
・見出しのサイズはTailwindでもよいが、行間・字間の“癖”を増やさない。

---

## 3) Spacing（8pxスケール）

・`--cb-space-1` (4px) を起点に、8pxベースで増加。
・ページ/コンポーネントの余白はこのスケールに丸める。

---

## 4) Radius / Shadow

・`--cb-radius-s/m/l` : 角丸の規格
・`--cb-shadow-soft` / `--cb-shadow-card` : 影の規格

運用ルール

・影は“少数の型”だけ。ページごとに影の種類を増やさない。
・角丸のバリエーションを増やさない（S/M/Lの3つまで）。

---

## 5) Motion

・`--cb-ease-standard` : 基本イージング
・`--cb-dur-fast/normal/slow` : 時間

運用ルール

・動きは「状態変化の理解」にだけ使う（常時アニメ禁止）。
・`prefers-reduced-motion` を尊重する。

---

## 6) Touch

・`--cb-tap` : 標準タップ領域（44px）
・`.cb-tap` : min-height/min-width を強制

運用ルール

・重要操作（メニュー、閉じる、フィルタ、比較、ページ送り）は必ず `.cb-tap` を付ける。
