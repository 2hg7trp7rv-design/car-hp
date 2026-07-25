import type { Metadata } from "next";
import Link from "next/link";

import { LegalDarkCTA } from "@/components/legal/LegalDarkCTA";
import { LEGAL_NAV_GROUPS } from "@/components/legal/legal-nav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "法務・運営情報",
  description:
    "CAR BOUTIQUE JOURNALの運営者情報、編集方針、出典・ファクトチェック、広告方針、プライバシー、免責事項、著作権などをまとめた一覧ページです",
  alternates: { canonical: `${getSiteUrl()}/legal` },
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

      <header className="rounded-[28px] border border-black/10 bg-[var(--paper)] p-[clamp(20px,4vw,36px)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--teal)]">
          TRUST HUB
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-end">
          <h1 className="max-w-[13ch] text-[clamp(34px,6vw,62px)] font-semibold leading-[0.98] tracking-[-0.075em] text-[var(--navy)]">
            運営と信頼の基準
          </h1>
          <p className="max-w-[620px] text-[14px] leading-[2.05] tracking-[0.02em] text-[#3f494f] lg:justify-self-end">
            記事の作り方、広告との距離感、出典、個人情報、著作権まで、CBJの基準をまとめた入口です
          </p>
        </div>
      </header>

      <div className="mt-10 space-y-10">
        {LEGAL_NAV_GROUPS.map((group, index) => (
          <section key={group.id} className="border-t border-black/10 pt-8 first:border-t-0 first:pt-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/[0.32]">
                  {index === 0 ? "EDITORIAL" : "USE & RIGHTS"}
                </p>
                <h2 className="mt-2 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.05] tracking-[-0.06em] text-[var(--navy)]">
                  {group.title}
                </h2>
              </div>
              <p className="max-w-[420px] text-[13px] leading-[1.85] text-[var(--ink-soft)]">
                {group.lead}
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative overflow-hidden rounded-[22px] border border-black/10 bg-white/[0.72] px-4 py-4 transition-colors duration-150 hover:bg-white sm:px-5 sm:py-5"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(14,124,123,0.55),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-[17px] font-semibold tracking-[-0.04em] text-[var(--navy)]">
                      {item.label}
                    </div>
                    <span className="text-[18px] leading-none text-[var(--teal)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.8] text-[var(--ink-soft)]">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <LegalDarkCTA
          title="修正依頼や確認は問い合わせ窓口から"
          body="数値の誤り、リンク切れ、引用や掲載内容に関する確認などは、内容が分かるURLとあわせてご連絡ください"
          href="/contact"
          label="お問い合わせ"
        />
      </div>
    </>
  );
}
