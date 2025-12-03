// app/contact/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | CAR BOUTIQUE",
  description:
    "CAR BOUTIQUEへのご意見・ご感想、車種リクエスト、掲載内容に関するお問い合わせはこちらから。",
};

const FORM_ENDPOINT = "https://formspree.io/f/your-form-id"; // 後で実際のIDに差し替え

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 md:flex-row">
        <section className="flex-1 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            お問い合わせ
          </h1>
          <p className="text-sm text-slate-400">
            CAR BOUTIQUEへのご意見・ご感想、車種リクエスト、掲載内容に関するご指摘などがありましたら、こちらのフォームからご連絡ください。
          </p>
          <p className="text-xs text-slate-500">
            内容によってはお返事までお時間をいただく場合や、個別の回答が難しい場合があります。あらかじめご了承ください。
          </p>
        </section>

        <section className="flex-1">
          <form
            action={FORM_ENDPOINT}
            method="POST"
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg backdrop-blur"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300"
              >
                お名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400"
                placeholder="例) 山田太郎"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400"
                placeholder="返信先のメールアドレス"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="topic"
                className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300"
              >
                用件
              </label>
              <select
                id="topic"
                name="topic"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400"
              >
                <option value="">選択してください</option>
                <option value="feedback">サイトへのご意見・ご感想</option>
                <option value="request">車種・記事のリクエスト</option>
                <option value="correction">内容の誤りに関するご指摘</option>
                <option value="other">その他のお問い合わせ</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300"
              >
                お問い合わせ内容
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400"
                placeholder="できるだけ具体的にご記入いただけると助かります。"
              />
            </div>

            <p className="text-xs text-slate-500">
              送信前に
              <a
                href="/legal/privacy"
                className="text-teal-300 underline underline-offset-4"
              >
                プライバシーポリシー
              </a>
              をご確認ください。
            </p>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-teal-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-teal-300"
            >
              送信する
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
