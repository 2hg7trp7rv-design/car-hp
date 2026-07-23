// components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * お問い合わせフォーム（Formspree 想定の AJAX POST）
 *
 * - action には Formspree のフォームエンドポイントを指定する
 *   （未設定時は page 側で受付停止表示に切り替わる）
 * - 送信は fetch + Accept: application/json で行い、
 *   完了/エラーをページ内 UI で表示する（外部ページへ遷移しない）
 * - スパム対策として honeypot（_gotcha）を仕込む
 * - 個人情報保護法に基づく利用目的の明示と、
 *   プライバシーポリシーへの同意チェックを必須にする
 */

type ContactFormProps = {
  action: string;
};

const CONTACT_TYPES = [
  "記事の誤り・修正依頼",
  "車種・テーマのリクエスト",
  "広告・掲載に関する相談",
  "その他",
] as const;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactForm({ action }: ContactFormProps) {
  const [state, setState] = useState<SubmitState>("idle");
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // honeypot: ボットが埋めた場合は成功を装って破棄する
    if (String(data.get("_gotcha") ?? "").trim() !== "") {
      setState("success");
      return;
    }

    setState("submitting");
    try {
      const response = await fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        setAgreed(false);
        setState("success");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="mt-7 rounded-[22px] border border-black/10 bg-[#f9f5ee] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
          SENT
        </p>
        <h3 className="mt-3 text-[clamp(20px,3.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.05em] text-[#080b0d]">
          送信が完了しました
        </h3>
        <p className="mt-4 text-[13px] leading-[1.9] tracking-[0.02em] text-[#657078]">
          お問い合わせを受け付けました。内容を確認のうえ、返信が必要な場合はご記入いただいたメールアドレス宛にご連絡します。
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[13px] font-semibold text-[#080b0d] transition-colors hover:bg-[#f6f1e9]"
        >
          続けて別の内容を送る
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      {/* honeypot（人間には見えない入力欄） */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="cb-field-label" htmlFor="contact-type">
            TYPE <span className="text-[#c2410c]">必須</span>
          </label>
          <select id="contact-type" name="type" required className="cb-input" defaultValue="">
            <option value="" disabled>
              選択してください
            </option>
            {CONTACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="cb-field-label" htmlFor="contact-target-url">
            TARGET URL
          </label>
          <input
            id="contact-target-url"
            name="target_url"
            type="url"
            inputMode="url"
            className="cb-input"
            placeholder="対象ページのURL（あれば）"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="cb-field-label" htmlFor="contact-name">
            NAME
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            className="cb-input"
            placeholder="お名前（任意）"
          />
        </div>

        <div>
          <label className="cb-field-label" htmlFor="contact-email">
            EMAIL
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className="cb-input"
            placeholder="返信が必要な場合のみ"
          />
        </div>
      </div>

      <div>
        <label className="cb-field-label" htmlFor="contact-message">
          MESSAGE <span className="text-[#c2410c]">必須</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={8}
          required
          className="cb-textarea min-h-[210px]"
          placeholder="内容をご記入ください。対象ページのURLや該当箇所があると確認が早くなります"
        />
      </div>

      <div className="rounded-[22px] border border-black/10 bg-[#f9f5ee] px-4 py-4 text-[12px] leading-[1.8] text-[#657078]">
        <p className="font-semibold text-[#080b0d]">個人情報の利用目的</p>
        <p className="mt-1">
          ご記入いただいたお名前・メールアドレス等の個人情報は、お問い合わせへの対応と、
          必要な場合のご返信のみを目的として利用し、それ以外の目的では利用しません。
          取り扱いの詳細は
          <Link href="/legal/privacy" className="mx-1 font-medium text-[#00708d] underline underline-offset-4">
            プライバシーポリシー
          </Link>
          をご確認ください。
        </p>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="privacy_agreed"
            value="yes"
            required
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#00708d]"
          />
          <span className="text-[12px] leading-[1.7] text-[#080b0d]">
            プライバシーポリシーを確認し、上記の利用目的に同意します（必須）
          </span>
        </label>
      </div>

      {state === "error" ? (
        <div
          role="alert"
          className="rounded-[22px] border border-[#ef9a9a] bg-[#ffebee] px-4 py-4 text-[12px] leading-[1.8] text-[#8c2f39]"
        >
          送信に失敗しました。通信状況をご確認のうえ、時間をおいて再度お試しください。
          繰り返し失敗する場合は、お手数ですが後日あらためてお問い合わせください。
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] leading-[1.8] text-[#7b858b]">
          返信が必要な場合は、メールアドレスをご記入ください
        </p>
        <button
          type="submit"
          disabled={state === "submitting" || !agreed}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#080b0d] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#152026] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "submitting" ? "送信中…" : "送信する ↗"}
        </button>
      </div>
    </form>
  );
}
