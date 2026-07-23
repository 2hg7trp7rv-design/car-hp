# お問い合わせフォーム設定手順（Formspree）

`components/contact/ContactForm.tsx` は Formspree 等の外部フォームサービスへ AJAX POST する実装です。

## 設定手順

1. Formspree（https://formspree.io/）でアカウントを作成し、新しいフォームを作る
2. 発行されたエンドポイント（例: `https://formspree.io/f/xxxxxxx`）を控える
3. Vercel の環境変数に設定する
   - `NEXT_PUBLIC_CONTACT_FORM_ACTION` = 上記エンドポイント URL
4. 再デプロイする

## 動作仕様

- 環境変数が未設定の場合、`app/contact/page.tsx` は受付停止の案内のみ表示する（フォームは出ない）
- 設定後は種別・対象URL・名前・メール・本文のフォームが表示される
- スパム対策: honeypot フィールド `_gotcha`（Formspree 側でも自動判定される）
- 個人情報保護法対応: フォーム内に利用目的を明示し、プライバシーポリシーへの同意チェックを必須にしている
- 送信完了・送信中・エラーの各状態はフォーム内で表示される

## 別サービスを使う場合

`ContactForm` は `Accept: application/json` 付きの POST で FormData を送るだけなので、
同等の API を持つサービス（Getform 等）でもエンドポイント差し替えで動きます。
