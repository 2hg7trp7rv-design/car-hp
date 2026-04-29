import type { Metadata } from "next";
import Link from "next/link";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
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
    <main className="relative min-h-screen">
      <DetailFixedBackground imageSrc="/images/hero-cb.jpg" />

      <div className="page-shell pb-24 pt-24 space-y-10">
        <ArchivePageHero
          eyebrow="お問い合わせ"
          title="お問い合わせ。"
          lead="ご意見、ご感想、記事の誤りの指摘、車種リクエスト、広告掲載の相談まで。読者から届く声を、次の改善につなげるための窓口です。"
          note="個別の修理診断や緊急トラブルへの即時回答は難しい場合がありますが、記事改善の材料として丁寧に確認します。"
          imageSrc="/images/hero-top-mobile.jpeg"
          imageAlt="車内ディテール"
          seedKey="contact"
          posterVariant="generic"
          align="imageLeft"
          stats={[
            { label: "用途", value: "ご意見 / 修正依頼 / 相談", tone: "glow" },
            { label: "返信", value: "必要時のみメールで", tone: "fog" },
            { label: "参考", value: "URL添付で確認しやすく", tone: "wash" },
          ]}
          links={[
            { href: "/legal/editorial-policy", label: "編集方針" },
            { href: "/legal/sources-factcheck", label: "出典・ファクトチェック" },
            { href: "/legal/privacy", label: "プライバシー" },
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div className="space-y-6">
            <section className="cb-panel p-5 sm:p-6">
              <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "お問い合わせ" }]} className="mb-6" />

              <ArchiveSectionHeading
                eyebrow="送信前に"
                title="このフォームで受け取ること"
                lead="曖昧な相談より、URLや対象ページがある連絡の方が確認は早くなります。修正依頼も歓迎です。"
                className="mb-6 border-t-0 pt-0"
              />

              <div className="space-y-4 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                <div className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4">
                  記事内容へのご意見・ご感想
                </div>
                <div className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4">
                  取り上げてほしい車種 / テーマのリクエスト
                </div>
                <div className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4">
                  数値や年式など、事実関係のご指摘（対象URLがあると確認しやすくなります）
                </div>
                <div className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4">
                  広告掲載・タイアップなどのご相談
                </div>
              </div>
            </section>

            <section className="cb-panel-muted p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[var(--text-tertiary)] uppercase">
                Note
              </p>
              <div className="mt-4 space-y-3 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                <p>
                  個別の故障診断・修理可否・緊急対応など、専門判断を伴う相談はお受けできない場合があります。
                </p>
                <p>
                  ただし、記事化や比較コンテンツ改善のヒントとして拝見し、必要に応じて今後の視点に反映します。
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
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
            </section>
          </div>

          <section className="cb-panel p-5 sm:p-6 lg:p-8">
            <ArchiveSectionHeading
              eyebrow="連絡フォーム"
              title="送信フォーム"
              lead="返信が必要な場合だけ、メールアドレスをご記入ください。件名は短く、本文には対象ページのURLがあると助かります。"
              className="mb-6 border-t-0 pt-0"
            />

            <form action={FORM_ENDPOINT} method="POST" className="space-y-5">
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
                <label className="cb-field-label" htmlFor="contact-subject">
                  SUBJECT
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  className="cb-input"
                  placeholder="例：BMW 530iの記事について"
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
                  placeholder="内容（URLがある場合は貼ってください）"
                />
              </div>

              <div className="rounded-[22px] border border-[rgba(27,63,229,0.18)] bg-[var(--surface-wash)] px-4 py-4 text-[12px] leading-[1.8] text-[var(--text-secondary)]">
                個人情報の取り扱いは
                <Link href="/legal/privacy" className="mx-1 cb-link">
                  プライバシーポリシー
                </Link>
                に従います。
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] leading-[1.8] text-[var(--text-tertiary)]">
                  返信が必要な場合は、メールアドレスをご記入ください。
                </p>
                <Button type="submit" variant="primary" size="lg" className="rounded-full px-6">
                  送信する
                </Button>
              </div>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
