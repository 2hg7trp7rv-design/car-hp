# CBJ Article Design System Implementation 9

## 対象

- COLUMN: `modern-car-custom-regret-reason-column`
- 参照: Kimiで作成したリニューアルモック

## 実装内容

- 対象コラムのみ `articleDesign.layoutPreset: column-renewal-v1` を適用。
- モックの本文順序に合わせ、章内会話を各説明・図解・注意カードの正しい位置へ移動。
- モックのヒーロー、会話、章見出し、本文見出し、図解フレーム、表、システムカード、番号リスト、5ステップカード、チェックリスト、まとめカードの寸法・余白・角丸・配色を専用CSSで再現。
- 図解画像は、モック内の文字崩れ画像へ戻さず、現在の修正版SVGを維持。
- 原稿はモック準拠の内容を維持。

## 現行のまま維持した要素

以下はモックへ戻さず、現行実装と内容を維持した。

- `5つの順番`
- `良いカスタムの条件`
- `保安基準適合と店舗の受け入れは別の判断`
- 最後の確認チェック
- 関連する実用ガイド
- AUTHOR / EDITOR
- FAQ
- 出典・参考資料と更新履歴
- フッター

## 実装上の分離

- 他のGUIDE・COLUMNには変更後のモックCSSを適用しない。
- 共通レンダラーへ専用variantを追加したが、対象JSONで指定した場合のみ有効。
- `articleDesign.version` は既存の `cbj-world-v1` を維持し、対象ページ判定は `layoutPreset` で行う。
