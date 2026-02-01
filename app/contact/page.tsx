// app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";


export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "CAR BOUTIQUEへのご意見・ご感想、車種リクエスト、掲載内容に関するお問い合わせはこちらから。",

  alternates: { canonical: "/contact" },
  robots: NOINDEX_ROBOTS,
};

const FORM_ENDPOINT = "https://formspree.io/f/your-form-id"; // 実運用時にFormspreeのIDに差し替え

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* うっすら光の背景レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[32vh] bg-gradient-to-b from-vapor/90 via-white/90 to-transparent" />
        <div className="absolute -left-[18%] top-[14%] h-[38vw] w-[38vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.16),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[20%] bottom-[-8%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.18),_transparent_75%)] blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ヘッダー/導入 */}
        <section className="border-b border-slate-200/70 bg-gradient-to-b from-vapor/70 via-white to-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-10 pt-24 md:pb-12 md:pt-24">
            <Reveal>
              <nav
                className="flex items-center text-[11px] text-slate-500"
                aria-label="パンくずリスト"
              >
                <Link href="/" className="hover:text-slate-800">
                  HOME
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-400">CONTACT</span>
              </nav>
            </Reveal>

            <Reveal>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                    CONTACT
                  </p>
                  <div className="space-y-3">
                    <h1 className="serif-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem]">
                      お問い合わせ
                    </h1>
                    <p className="max-w-2xl text-[13px] leading-relaxed text-text-sub sm:text-sm sm:leading-7">
                      CAR BOUTIQUEへのご意見・ご感想、車種リクエスト、掲載内容に関するご指摘などがありましたら、こちらのフォームからご連絡ください。
                      いただいた内容は、今後のコンテンツづくりやサイト改善の参考として大切に扱わせていただきます。
                    </p>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p>
                      ・内容によってはお返事までお時間をいただく場合や、個別の回答が難しい場合があります。
                    </p>
                    <p>・広告掲載やコラボレーションのご相談も、こちらからお送りいただけます。</p>
                  </div>
                </div>

                <div className="hidden text-[10px] text-slate-500 md:block">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-soft-glow backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                    <span className="tracking-[0.18em]">
                      IMPORT / PREMIUM ORIENTED
                    </span>
                  </div>
                  <p className="mt-2 max-w-xs leading-relaxed tracking-[0.03em]">
                    愛車に関するお悩みや「この車種を取り上げてほしい」といった声も歓迎しています。
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 本文：ガイド＋フォーム */}
        <section className="pb-20 pt-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 md:flex-row">
            {/* 左カラム: ガイド/注意書き */}
            <Reveal>
              <div className="flex-1 space-y-4 md:space-y-5">
                <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-white/96 via-white to-vapor/95 shadow-soft">
                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                        このフォームでできること
                      </p>
                      <p className="text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
                        下記のような内容について、お気軽にお知らせください。
                      </p>
                    </div>

                    <ul className="space-y-2 text-[12px] leading-relaxed text-slate-700 sm:text-[13px]">
                      <li className="flex gap-2">
                        <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">
                            記事内容へのご意見・ご感想
                          </p>
                          <p className="text-[11px] text-slate-500">
                            「ここが分かりやすかった」「このポイントも知りたい」など、読み手目線の声を歓迎しています。
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">
                            取り上げてほしい車種・テーマのリクエスト
                          </p>
                          <p className="text-[11px] text-slate-500">
                            特定車種のインプレッションや、維持費・トラブル体験記など「こんな記事が読みたい」という希望があればぜひ教えてください。
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">
                            掲載内容の誤りに関するご指摘
                          </p>
                          <p className="text-[11px] text-slate-500">
                            スペックの数値や年式など、事実関係の誤りにお気づきの場合は、該当ページのURLとあわせてお知らせいただけると助かります。
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-[7px] h-[3px] w-[3px] rounded-full bg-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">
                            広告掲載・タイアップのご相談
                          </p>
                          <p className="text-[11px] text-slate-500">
                            車関連サービスやショップさまとのタイアップ企画など、ビジネス面でのご相談もこちらから承っています。
                          </p>
                        </div>
                      </li>
                    </ul>

                    <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500">
                      <p>
                        個人の車両トラブルに関する個別・専門的な診断はお受けできない場合がありますが、企画のヒントとして参考にさせていただきます。
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </Reveal>

            {/* 右カラム: フォーム本体 */}
            <Reveal delay={80}>
              <div className="flex-1">
                <GlassCard className="border border-slate-200/80 bg-slate-950/97 shadow-soft-card">
                  <form
                    action={FORM_ENDPOINT}
                    method="POST"
                    className="space-y-4 p-5 text-slate-50 sm:p-6"
                  >
                    {/* 名前 */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="text-[11px] font-medium tracking-[0.18em] text-slate-200"
                      >
                        お名前(任意)
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[13px] text-slate-50 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-slate-900"
                        placeholder="例) 山田太郎"
                      />
                    </div>

                    {/* メールアドレス */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="text-[11px] font-medium tracking-[0.18em] text-slate-200"
                      >
                        メールアドレス
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[13px] text-slate-50 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-slate-900"
                        placeholder="返信先のメールアドレス"
                      />
                      <p className="text-[10px] text-slate-500">
                        返信が必要な場合にのみ使用します。ニュースレターや宣伝メールをお送りすることはありません。
                      </p>
                    </div>

                    {/* 用件 */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="topic"
                        className="text-[11px] font-medium tracking-[0.18em] text-slate-200"
                      >
                        用件
                      </label>
                      <select
                        id="topic"
                        name="topic"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[13px] text-slate-50 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-slate-900"
                      >
                        <option value="">選択してください</option>
                        <option value="feedback">サイトへのご意見・ご感想</option>
                        <option value="request">車種・記事のリクエスト</option>
                        <option value="correction">
                          掲載内容の誤りに関するご指摘
                        </option>
                        <option value="business">広告掲載・タイアップのご相談</option>
                        <option value="other">その他のお問い合わせ</option>
                      </select>
                    </div>

                    {/* 関連ページ/車種(任意) */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="related"
                        className="text-[11px] font-medium tracking-[0.18em] text-slate-200"
                      >
                        関連ページ・車種(任意)
                      </label>
                      <input
                        id="related"
                        name="related"
                        type="text"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[13px] text-slate-50 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-slate-900"
                        placeholder="例) BMW 530i G30の記事について/URLなど"
                      />
                    </div>

                    {/* 本文 */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="message"
                        className="text-[11px] font-medium tracking-[0.18em] text-slate-200"
                      >
                        お問い合わせ内容
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[13px] text-slate-50 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-slate-900"
                        placeholder="できるだけ具体的にご記入いただけると助かります。ページ名や車種名、気になった箇所なども添えていただけるとスムーズです。"
                      />
                    </div>

                    {/* 返信希望 */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium tracking-[0.18em] text-slate-200">
                        返信について
                      </p>
                      <div className="flex flex-wrap gap-3 text-[12px]">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="reply"
                            value="need"
                            className="h-3 w-3 rounded border-slate-500 bg-slate-900 text-tiffany-400"
                            defaultChecked
                          />
                          <span className="text-slate-200">可能であれば返信がほしい</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="reply"
                            value="noneed"
                            className="h-3 w-3 rounded border-slate-500 bg-slate-900 text-tiffany-400"
                          />
                          <span className="text-slate-200">返信は不要(サイト改善の参考用)</span>
                        </label>
                      </div>
                    </div>

                    {/* プライバシーと送信ボタン */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] leading-relaxed text-slate-500">
                        送信前に
                        <a
                          href="/legal/privacy"
                          className="text-tiffany-300 underline underline-offset-4 hover:text-tiffany-200"
                        >
                          プライバシーポリシー
                        </a>
                        をご確認ください。フォーム送信をもって、記載内容に同意いただいたものとみなします。
                      </p>

                      <Button
                        type="submit"
                        size="sm"
                        variant="primary"
                        magnetic
                        className="w-full rounded-full py-2 text-[13px] tracking-[0.16em]"
                      >
                        送信する
                      </Button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
}
