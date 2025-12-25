# 内部リンク設計テンプレ（manifest/slug管理）

最終更新: 2025-12-25

目的：記事を追加するたびに、**回遊設計が破綻しない**ようにする。

---

## A. この記事の“中心”
- primaryType: HERITAGE / CARS / COLUMN / GUIDE
- primarySlug:

---

## B. 必須リンク（最低ライン）
- relatedCarSlugs: []
- relatedGuideSlugs: []
- relatedColumnSlugs: []
- relatedHeritageSlugs: []

---

## C. フォールバック用（自動関連の精度を上げる）
- intentTags: []
- tags: []

---

## D. 公開後に確認するページ（クリックで確認）
- [ ] primary を開く
- [ ] related をすべて開く（404にならない）
- [ ] それぞれの related セクションで相互に戻って来れる

---

## E. 連携マニフェスト（コピペ用）
※「今回このHERITAGEで“登録した扱い”のslug一覧」を残す用途。

```txt
[MANIFEST]
primary: <type>/<slug>
cars: <slug>, <slug>, ...
columns: <slug>, <slug>, ...
guides: <slug>, <slug>, ...
heritage: <slug>, <slug>, ...
```

## related 推奨フォーマット（v2.0）
```
related: {
  cars: [],
  guides: [],
  columns: [],
  heritage: [],
}
```

## 旧フォーマット（互換 / 段階移行中）
```
relatedCarSlugs: []
relatedGuideSlugs: []
relatedColumnSlugs: []
relatedHeritageSlugs: []
```

ルール：両方ある場合は **related.*** を優先して解決される。
