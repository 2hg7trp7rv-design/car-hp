# データ更新チェックリスト（壊さない運用）

最終更新: 2025-12-25

---

## 1) 正ファイル（Single Source of Truth）
- cars: `data/cars.json`
- columns: `data/columns.json`
- guides: `data/guides.json`
- heritage: `data/heritage.json`

`data/_archive/` は参照されない（退避専用）。

---

## 2) 追加/更新の手順（必須）
- [ ] slug を決める（英小文字 + ハイフン）
- [ ] 同カテゴリ内で slug 重複がない
- [ ] related*Slugs がある場合、参照先が実在する
- [ ] type/status が既存の列挙に合っている
- [ ] title/titleJa/seoTitle/seoDescription が空じゃない（最低限）

---

## 3) 公開前テスト（最低限）
- [ ] `npm run validate` が通る（参照切れ/重複/型崩れがない）
- [ ] 該当ページを開く（404が出ない）
- [ ] related が表示される（設定した場合）
- [ ] Json-LD が出ている（HTMLにscript）
- [ ] Scroll計測が落ちていない（既存イベント名）

---

## 4) よくある事故
- slugのタイプミス（404）
- relatedSlugs の参照切れ（ビルド or 実行で落ちる）
- 1カテゴリ2ファイル運用に戻す（後で必ず破綻）

## Formatting
- Run `npm run format:data` before commit.
- Confirm CI passes `npm run check:data-format`.
