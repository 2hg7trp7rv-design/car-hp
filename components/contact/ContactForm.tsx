"use client";

// components/contact/ContactForm.tsx
//
// お問い合わせフォーム本体。
// - Formspree 等の外部フォームサービスへ AJAX POST する想定
// - honeypot（_gotcha）による簡易スパム対策
// - 個人情報保護法対応: 利用目的の明示＋プライバシーポリシー同意チェック必須
// - 送信中 / 完了 / エラーの各状態を表示

import { useState } from "react";
import Link from "next/link";

type ContactFormProps = {
  endpoint: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const SUBJECT_OPTIONS = [
  { value: "correction", label: "記事の誤り・修正依頼" },
  { value: "request", label: "車種・テーマのリクエスト" },
  { value: "advertising", label: "広告・掲載の相談" },
  { value: "other", label: "その他" },
] as const;

export function ContactForm({ endpoint }: ContactFormProps) {
  const [state, setState] = useState<SubmitState>("idle");
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = agreed && state !== "submitting";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`送信に失敗しました（${response.status}）`);
      }

      setState("success");
      form.reset();
      setAgreed(false);
    } catch {
      setState("error");
      setErrorMessage(
        "送信できませんでした 通信状況をご確認のうえ、時間をおいてもう一度お試しください",
      );
    }
  }

  if (state === "success") {
    return (
      <div className="mt-7 rounded-[22px] border border-black/10 bg-[#f9f5ee] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
          SENT
        </p>
        <h3 className="mt-3 text-[clamp(20px,3.4vw,28px)] font-semibold leading-[1.15] tracking-[-0.05em] text-[#080b0d]">
          送信ありがとうございます
        </h3>
        <p className="mt-4 text-[13px] leading-[1.9] text-[#657078]">
          内容を確認のうえ、返信が必要な場合は記入いただいたメールアドレス宛にご連絡します
          いただいた内容は、記事の修正や今後の企画の参考にします
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[13px] font-semibold text-[#080b0d] transition-colors hover:bg-[#f4eee5]"
        >
          続けて別の内容を送る
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      {/* honeypot: 人間には見えない入力欄（ボット対策） */}
      <input
        type="text"
        name="_gotcha"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="cb-field-label" htmlFor="contact-type">
            種別
          </label>
          <select
            id="contact-type"
            name="type"
            required
            className="cb-input"
            defaultValue="correction"
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="cb-field-label" htmlFor="contact-target-url">
            対象ページのURL
          </label>
          <input
            id="contact-target-url"
            name="target_url"
            type="url"
            className="cb-input"
            placeholder="修正依頼など対象がある場合"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="cb-field-label" htmlFor="contact-name">
            お名前
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            className="cb-input"
            placeholder="任意"
          />
        </div>

        <div>
          <label className="cb-field-label" htmlFor="contact-email">
            メールアドレス
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className="cb-input"
            placeholder="返信が必要な場合は必須"
          />
        </div>
      </div>

      <div>
        <label className="cb-field-label" htmlFor="contact-message">
          本文
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={8}
          required
          className="cb-textarea min-h-[210px]"
          placeholder="内容をご記入ください 対象箇所が分かると確認が早くなります"
        />
      </div>

      <div className="rounded-[22px] border border-black/10 bg-[#f9f5ee] px-4 py-4 text-[12px] leading-[1.8] text-[#657078]">
        <p>
          送信いただいた情報は、お問い合わせ内容の確認と回答、記事内容の修正検討の目的でのみ利用します
          取り扱いの詳細は
          <Link
            href="/legal/privacy"
            className="mx-1 font-medium text-[#00708d] underline underline-offset-4"
          >
            プライバシーポリシー
          </Link>
          をご確認ください
        </p>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#00708d]"
            required
          />
          <span className="text-[12px] leading-[1.8] text-[#101519]">
            利用目的とプライバシーポリシーを確認し、同意のうえで送信します
          </span>
        </label>
      </div>

      {state === "error" && (
        <p className="rounded-[16px] border border-[#b4473f]/30 bg-[#b4473f]/[0.06] px-4 py-3 text-[12px] leading-[1.8] text-[#8f352e]">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] leading-[1.8] text-[#7b858b]">
          返信が必要な場合は、メールアドレスをご記入ください
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#080b0d] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#152026] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "submitting" ? "送信中…" : "送信する ↗"}
        </button>
      </div>
    </form>
  );
}
