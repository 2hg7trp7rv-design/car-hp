import type { Metadata } from "next";
import Link from "next/link";

import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { LEGAL_NAV_GROUPS } from "@/components/legal/legal-nav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "法務・運営情報",
  description:
    "CAR BOUTIQUE JOURNALの運営者情報、編集方針、出典・ファクトチェック、広告方針、プライバシー、免責事項、著作権などをまとめた一覧ページです。",
  alternates: { canonical: "/legal" },
};

export default function LegalIndexPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "法務・運営情報",
        item: `${getSiteUrl()}/legal`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-index-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報" },
        ]}
        className="mb-8"
      />

      <header className="space-y-4">
        <p className="cb-kicker">運営と信頼</p>
        <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[42px]">
          先に開いておくべきことを、
          <br className="hidden sm:block" />
          ひとつにまとめる。
        </h2>
        <p className="max-w-3xl text-[15px] leading-[1.95] text-[var(--text-secondary)]">
          記事の作り方、広告との距離感、出典の扱い、個人情報、著作権。
          読む前に知っておきたい基準を置いています。
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {LEGAL_NAV_GROUPS.map((group, index) => (
          <section key={group.id}>
            <ArchiveSectionHeading
              eyebrow={index === 0 ? "運営基準" : "権利・法務"}
              title={group.title}
              lead={group.lead}
              className="mb-6 border-t-0 pt-0"
            />

            <div className="grid gap-4 lg:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.82)] px-5 py-5 transition-colors duration-150 hover:border-[rgba(122,135,108,0.28)] hover:bg-[var(--surface-2)]"
                >
                  <div className="text-[18px] font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                    {item.label}
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[24px] border border-[rgba(122,135,108,0.18)] bg-[var(--surface-moss)] px-5 py-5 sm:px-6">
          <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-strong)] uppercase">
            お問い合わせ
          </div>
          <h3 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
            修正依頼やご質問は、問い合わせ窓口から。
          </h3>
          <p className="mt-3 max-w-2xl text-[14px] leading-[1.9] text-[var(--text-secondary)]">
            数値の誤り、リンク切れ、引用や掲載内容に関する確認などは、内容が分かるURLとあわせてご連絡ください。
          </p>
          <div className="mt-5">
            <Link href="/contact" className="cb-chip">
              お問い合わせ
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
