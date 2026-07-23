# お問い合わせフォーム セットアップ

`/contact` のフォームは Formspree 等のフォームバックエンドへの AJAX POST を前提にしています。

## 必要な環境変数

| 変数 | 説明 |
|---|---|
| `NEXT_PUBLIC_CONTACT_FORM_ACTION` | フォームの送信先エンドポイント（例: `https://formspree.io/f/xxxxxxx`） |

- **未設定の場合**: ページ上に「受付停止中」の自然文が表示され、フォームは描画されません（fail-safe）。
- Vercel では Production / Preview それぞれに設定してください。

## Formspree 側の設定

1. Formspree でフォームを作成し、エンドポイント URL を取得する
2. 送信先メールアドレスを運営用アドレスに設定する
3. スパム対策は honeypot（`_gotcha` フィールド）をフォーム側で実装済み。reCAPTCHA を追加する場合は Formspree 側の設定で有効化する

## 送信されるフィールド

| name | 内容 | 必須 |
|---|---|---|
| `type` | 問い合わせ種別（記事の誤り／リクエスト／広告・掲載相談／その他） | ✓ |
| `target_url` | 対象ページの URL | |
| `name` | 名前 | |
| `email` | メールアドレス（返信が必要な場合） | |
| `message` | 本文 | ✓ |
| `privacy_agreed` | プライバシーポリシーへの同意（`yes`） | ✓ |
| `_gotcha` | honeypot（人間は空のまま） | |

## 法的表記

- フォーム内に個人情報保護法に基づく**利用目的の明示**と、プライバシーポリシーへの**同意チェックボックス**（必須）を実装しています。
- 利用目的の文面を変更する場合は `components/contact/ContactForm.tsx` と `/legal/privacy` の記載を必ず同時に見直してください。

## UI の挙動

- 送信は `fetch` + `Accept: application/json` の AJAX POST。成功／失敗はページ内 UI で表示します（外部ページへ遷移しません）。
- コンポーネント: `components/contact/ContactForm.tsx`
