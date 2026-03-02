// app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "CAR BOUTIQUE JOURNALへのご意見・ご感想、車種リクエスト、掲載内容に関するお問い合わせはこちらから。",
  alternates: { canonical: "/contact" },
  robots: NOINDEX_ROBOTS,
};

// 実運用時に Formspree などのエンドポイントへ差し替え
const FORM_ENDPOINT = "https://formspree.io/f/your-form-id";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "CONTACT" }]} />
          </div>

          <header className="mt-10">
            <Reveal>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-[#0ABAB5]">CONTACT</p>
              <h1 className="serif-heading mt-4 text-[34px] tracking-[0.06em] text-[#222222] sm:text-[40px]">
                お問い合わせ
              </h1>
              <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-[#222222]/65">
                ご意見・ご感想、車種リクエスト、事実関係のご指摘、広告掲載のご相談などを受け付けています。
                返信が必要な場合はメールアドレスをご記入ください。
              </p>
            </Reveal>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Reveal delay={60}>
              <GlassCard className="border border-[#222222]/10 bg-white" padding="lg" magnetic={false}>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">GUIDE</p>
                <h2 className="serif-heading mt-2 text-[18px] text-[#222222]">このフォームでできること</h2>
                <ul className="mt-5 space-y-3 text-[12.5px] leading-relaxed text-[#222222]/70">
                  <li>・記事内容へのご意見・ご感想</li>
                  <li>・取り上げてほしい車種/テーマのリクエスト</li>
                  <li>・数値や年式など事実関係のご指摘（URLと一緒に）</li>
                  <li>・広告掲載/タイアップのご相談</li>
                </ul>

                <div className="mt-6 rounded-2xl border border-[#222222]/10 bg-[#222222]/[0.03] p-4 text-[11px] leading-relaxed text-[#222222]/60">
                  個別の故障診断・修理判断など、専門的な個別対応はお受けできない場合があります。
                  ただし、記事化のヒントとして参考にさせていただきます。
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/site-map">サイトマップ</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/legal/editorial-policy">編集方針</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/legal/sources-factcheck">出典・ファクトチェック</Link>
                  </Button>
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={90}>
              <GlassCard className="border border-[#222222]/10 bg-white" padding="lg" magnetic={false}>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">FORM</p>
                <h2 className="serif-heading mt-2 text-[18px] text-[#222222]">送信フォーム</h2>

                <form action={FORM_ENDPOINT} method="POST" className="mt-6 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                        NAME
                      </label>
                      <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="mt-2 w-full rounded-2xl border border-[#222222]/12 bg-white px-4 py-3 text-[13px] text-[#222222] outline-none focus:border-[#0ABAB5]/45"
                        placeholder="お名前（任意）"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                        EMAIL
                      </label>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="mt-2 w-full rounded-2xl border border-[#222222]/12 bg-white px-4 py-3 text-[13px] text-[#222222] outline-none focus:border-[#0ABAB5]/45"
                        placeholder="返信が必要な場合のみ"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                      SUBJECT
                    </label>
                    <input
                      name="subject"
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-[#222222]/12 bg-white px-4 py-3 text-[13px] text-[#222222] outline-none focus:border-[#0ABAB5]/45"
                      placeholder="例：BMW 530iの記事について"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                      MESSAGE
                    </label>
                    <textarea
                      name="message"
                      rows={7}
                      className="mt-2 w-full rounded-2xl border border-[#222222]/12 bg-white px-4 py-3 text-[13px] leading-relaxed text-[#222222] outline-none focus:border-[#0ABAB5]/45"
                      placeholder="内容（URLがある場合は貼ってください）"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-[#222222]/55">
                      返信が必要な場合は、メールアドレスをご記入ください。
                    </p>
                    <Button type="submit" variant="primary" className="rounded-full px-6 py-3 text-[11px] tracking-[0.2em]">
                      送信
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </Reveal>
          </div>

          <div className="mt-10 border-t border-[#222222]/10 pt-6 text-[11px] text-[#222222]/55">
            制定/更新の考え方や引用・出典については、
            <Link href="/legal/sources-factcheck" className="mx-1 text-[#0ABAB5] underline underline-offset-4">
              出典・ファクトチェック
            </Link>
            を参照してください。
          </div>
        </div>
      </div>
    </main>
  );
}
