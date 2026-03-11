# QA Review — HERITAGE (Index / Detail)

対象: `/heritage` / `/heritage/[slug]`

## 優先度
HERITAGEは “世界観” と “保存アーカイブ” の両方を担う。
このページの操作性（Map/移動/押しやすさ）が不安定だと、サイト全体の品格が下がる。

## 赤入れ（改修前に起きやすい問題）
1) `/heritage` の Map（モーダル）
   - キーボードで Tab 移動すると背景（年表側）にフォーカスが抜ける可能性がある
   - 閉じた後、フォーカスがどこへ戻るか不定（アクセシビリティ事故）
2) `/heritage` の主要CTA（Map / Close / decade item / decade card）が、44px最小タップターゲットに満たないケースがある
3) `/heritage` に「戻り先」がないと、迷子になったときに “世界観が強すぎる” 体験になる
4) 年代が薄い/空のとき、年表の構造が崩れたり、記事が無言で欠落する（year判定不可など）と信頼性が落ちる

## 実施した改修（規格適用）
- `/heritage` (Time Archive)
  - Map オープン時
    - Close に自動フォーカス（視線/操作の開始地点を固定）
    - Escape で閉じる（既存意図を保持しつつ確実化）
    - Tab 移動を Map 内に循環（簡易フォーカストラップ）
  - Map クローズ時
    - 直前の起点（Mapボタン）へフォーカス復帰
  - `.cb-tap` 適用
    - Map / Close / Mapのdecade item / decade card を 44px最小タップへ寄せる
  - Breadcrumb / Search 導線（最小）
    - Sticky header に「HOME · HERITAGE」のパンくずを追加
    - `Search titles, eras…` でローカルフィルタ（年表内）を追加
      - decade一致で「その年代を丸ごと」表示（検索で年代ジャンプも成立）
      - 0件時は `NO MATCHES` を表示し、`IN PREPARATION` と誤認しない
  - 空状態（品位）
    - canonical decades（2020s→1960s）を常に出す：年代が薄い/空でも “壁” を崩さない
    - 年代判定できない記事は `UNFILED` に収容し、一覧から消さない
    - 空/薄い年代は section の高さを抑えて「無駄スクロール」になりにくく

- `/heritage/[slug]` (Detail)
  - `.cb-tap` 適用
    - 「HERITAGE一覧へ戻る」
    - 右上/見出し横の “一覧へ” 導線（/cars, /guide, /heritage）
    - KEY MODELS のピルリンク（横スワイプでも押し損ねにくく）

## 変更ファイル
- `components/heritage/HeritageTimeArchive.tsx`
- `app/heritage/page.tsx`
- `components/home/home-masterpiece.module.css`
- `app/heritage/[slug]/page.tsx`

## 目視で最終確認すべき項目（Vercel Preview）
- `/heritage`:
  - Mapを開いた直後に Close にフォーカスが入るか
  - Tab/Shift+Tab で Map 内を循環し、背景へフォーカスが抜けないか
  - Escape / Close / 背景タップ で閉じられるか
  - 閉じたあと Map ボタンへフォーカスが戻るか
  - decade card が “押せる面積” として十分か（誤タップ/押し損ねがないか）
  - Breadcrumb が主張しすぎず、戻り先として機能するか
  - Search:
    - 既存アイテムが絞り込まれるか（大小文字/空白）
    - 0件時に NO MATCHES が出るか
    - decade 検索（例: 1990 / 1990s）で該当年代が維持されるか
  - 年代が空の decade の見え方が “未完成の粗さ” になっていないか（品位）

- `/heritage/[slug]`:
  - 一覧導線（戻る/一覧へ）が片手で押せるか
  - KEY MODELS の横スクロールで、リンクが小さすぎず押し間違いが減っているか
