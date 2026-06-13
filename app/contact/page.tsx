import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "CAR BOUTIQUE JOURNALへのご意見・ご感想、車種リクエスト、掲載内容に関するお問い合わせはこちらから",
  alternates: { canonical: `${getSiteUrl()}/contact` },
};

const FORM_ENDPOINT = (process.env.NEXT_PUBLIC_CONTACT_FORM_ACTION ?? "").trim();

const CONTACT_TYPES = [
  {
    label: "Correction",
    title: "記事の誤り",
    body: "数値、年式、リンク切れ、引用表記など、対象URLがある連絡",
  },
  {
    label: "Request",
    title: "車種・テーマ提案",
    body: "取り上げてほしい車種、整備修理、カスタム、売却、歴史テーマ",
  },
  {
    label: "Advertising",
    title: "広告・掲載相談",
    body: "広告掲載、タイアップ、掲載内容に関する相談",
  },
  {
    label: "Other",
    title: "その他の連絡",
    body: "上記に当てはまらないご意見、ご感想、確認事項",
  },
] as const;

export default function ContactPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f6f1e9]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(0,112,141,0.12),transparent_32%),linear-gradient(180deg,#f9f5ee_0%,#f4eee5_58%,#eee7dc_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-[linear-gradient(180deg,rgba(3,4,4,0.08),rgba(3,4,4,0))]" />

      <div className="mx-auto w-full max-w-[1180px] px-[clamp(18px,4.8vw,56px)] pb-[clamp(76px,11vw,128px)] pt-[clamp(58px,9vw,112px)]">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "お問い合わせ" }]} className="mb-8" />

        <section className="overflow-hidden rounded-[clamp(24px,4vw,40px)] border border-black/10 bg-white/[0.76] shadow-[0_28px_90px_-64px_rgba(3,4,4,0.42)] backdrop-blur-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <header className="relative overflow-hidden bg-[#080b0d] p-[clamp(20px,5vw,44px)] text-white">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#00708d]/22 blur-3xl" />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/[0.34]">
                  CONTACT DESK
                </p>
                <h1 className="mt-4 max-w-[12ch] text-[clamp(38px,7vw,72px)] font-semibold leading-[0.96] tracking-[-0.085em] text-white/[0.94]">
                  お問い合わせ
                </h1>
                <p className="mt-5 max-w-[520px] text-[13px] leading-[1.95] tracking-[0.03em] text-white/[0.54]">
                  記事の誤り、車種リクエスト、広告掲載の相談まで、CBJへの連絡を受け付ける窓口です
                </p>
              </div>
            </header>

            <div className="p-[clamp(18px,4vw,36px)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
                BEFORE SENDING
              </p>
              <h2 className="mt-3 max-w-[17ch] text-[clamp(24px,4vw,38px)] font-semibold leading-[1.08] tracking-[-0.065em] text-[#080b0d]">
                URLと対象箇所があるほど確認しやすい
              </h2>
              <p className="mt-4 text-[13px] leading-[1.9] tracking-[0.02em] text-[#657078]">
                修正依頼や事実関係の指摘は、対象ページのURL、該当箇所、確認したい内容を添えてください
              </p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {CONTACT_TYPES.map((item) => (
                  <article key={item.label} className="rounded-[20px] border border-black/10 bg-[#f9f5ee] p-3.5 sm:p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/[0.34]">
                      {item.label}
                    </p>
                    <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.04em] text-[#080b0d]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[12px] leading-[1.75] text-[#657078]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-start">
          <section className="order-1 rounded-[28px] border border-black/10 bg-white/[0.76] p-[clamp(18px,4vw,34px)] shadow-[0_18px_70px_-58px_rgba(3,4,4,0.45)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              FORM
            </p>
            <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
              送信フォーム
            </h2>
            <p className="mt-4 max-w-2xl text-[13px] leading-[1.9] tracking-[0.02em] text-[#657078]">
              返信が必要な場合だけ、メールアドレスをご記入ください 件名は短く、本文には対象ページのURLがあると助かります
            </p>

            {FORM_ENDPOINT ? (
              <form action={FORM_ENDPOINT} method="POST" className="mt-7 space-y-5">
                <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
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
                      placeholder="お名前 任意"
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
                  <label className="cb-field-label" htmlFor="contact-subject">
                    SUBJECT
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    className="cb-input"
                    placeholder="例 BMW 530iの記事について"
                  />
                </div>

                <div>
                  <label className="cb-field-label" htmlFor="contact-message">
                    MESSAGE
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={8}
                    className="cb-textarea min-h-[210px]"
                    placeholder="内容 URLがある場合は貼ってください"
                  />
                </div>

                <div className="rounded-[22px] border border-black/10 bg-[#f9f5ee] px-4 py-4 text-[12px] leading-[1.8] text-[#657078]">
                  個人情報の取り扱いは
                  <Link href="/legal/privacy" className="mx-1 font-medium text-[#00708d] underline underline-offset-4">
                    プライバシーポリシー
                  </Link>
                  に従います
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[12px] leading-[1.8] text-[#7b858b]">
                    返信が必要な場合は、メールアドレスをご記入ください
                  </p>
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#080b0d] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#152026]">
                    送信する ↗
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-7 rounded-[22px] border border-black/10 bg-[#f9f5ee] p-5 text-[13px] leading-[1.9] text-[#657078]">
                現在、お問い合わせは準備中です 記事の誤り、更新が必要な情報、掲載内容へのご連絡は、フォーム公開後に順次受け付けます
              </div>
            )}
          </section>

          <aside className="order-2 overflow-hidden rounded-[28px] border border-black/10 bg-[#080b0d] text-white lg:sticky lg:top-24">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
                NOTE
              </p>
              <h2 className="mt-3 text-[clamp(22px,4vw,32px)] font-semibold leading-[1.08] tracking-[-0.06em] text-white/90">
                受け取れる内容
              </h2>
            </div>
            <div className="space-y-4 p-5 text-[13px] leading-[1.9] text-white/[0.46] sm:p-6">
              <p>
                個別車両の診断、修理可否、緊急対応、契約判断そのものの代替はできない場合があります
              </p>
              <p>
                ただし、読者が迷いやすい内容は記事化や既存記事の改善に反映します
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/legal/editorial-policy" className="rounded-full border border-white/[0.14] px-3 py-2 text-[12px] text-white/[0.62] transition-colors hover:bg-white/[0.08] hover:text-white">
                  編集方針
                </Link>
                <Link href="/legal/sources-factcheck" className="rounded-full border border-white/[0.14] px-3 py-2 text-[12px] text-white/[0.62] transition-colors hover:bg-white/[0.08] hover:text-white">
                  出典方針
                </Link>
                <Link href="/legal/privacy" className="rounded-full border border-white/[0.14] px-3 py-2 text-[12px] text-white/[0.62] transition-colors hover:bg-white/[0.08] hover:text-white">
                  プライバシー
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
