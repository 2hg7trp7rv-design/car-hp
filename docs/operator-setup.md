# 運営者情報の設定手順

運営者・著者情報は `data/site/operator.json` が唯一の参照元です。
`lib/operator.ts` の `getOperator()` 経由で、About ページ・記事の著者表示・JSON-LD・
法務ページ（編集方針 / 出典）のすべてが同じ値を参照します。

## フィールド

| キー | 用途 |
|---|---|
| `name` | 運営者の表示名（著者名・JSON-LD の Person.name） |
| `title` | 肩書き |
| `credential` | 著者カードの一行経歴（JSON-LD の jobTitle） |
| `bio` | プロフィール本文（About / ProfilePage JSON-LD） |
| `expertise` | 専門領域の配列（About / JSON-LD knowsAbout） |
| `sns` | `{ label, url }` の配列（About のリンク表示） |

## 差し替え手順

1. `data/site/operator.json` の各値（初期値はすべて「要設定」）を実値に書き換える
2. コミットしてデプロイするだけで全箇所に反映される

## 注意

- コミットする値は公開されてよい情報のみにする（リポジトリ内容はそのまま配信される）
- コラムの架空キャラクター（莉奈 / JUNA）と実在運営者の区別は About ページに明記済み。
  キャラクター名を operator.json に書かないこと
