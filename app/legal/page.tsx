import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_NAV_GROUPS } from "@/components/legal/legal-nav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "法務・運営情報",
  description:
    "CAR BOUTIQUE JOURNALの運営者情報、編集方針、出典・ファクトチェック、広告方針、プライバシー、免責事項、著作権などをまとめた一覧ページです。",
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

      <header className="rounded-[30px] border border-black/10 bg-[#f9f5ee] p-[clamp(20px,4vw,36px)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#00708d]">
          TRUST HUB
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-end">
          <h2 className="max-w-[12ch] text-[clamp(34px,6vw,62px)] font-semibold leading-[0.98] tracking-[-0.075em] text-[#080b0d]">
            先に開いておくべきことを、ひとつにまとめる
          </h2>
          <p className="max-w-[620px] text-[14px] leading-[2.05] tracking-[0.02em] text-[#3f494f] lg:justify-self-end">
            記事の作り方、広告との距離感、出典の扱い、個人情報、著作権まで、CBJの基準をまとめた入口です
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
                <h3 className="mt-2 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.05] tracking-[-0.06em] text-[#080b0d]">
                  {group.title}
                </h3>
              </div>
              <p className="max-w-[420px] text-[13px] leading-[1.85] text-[#657078]">
                {group.lead}
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative overflow-hidden rounded-[24px] border border-black/10 bg-white/[0.72] px-5 py-5 transition-colors duration-150 hover:bg-white"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,112,141,0.55),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-[18px] font-semibold tracking-[-0.04em] text-[#080b0d]">
                      {item.label}
                    </div>
                    <span className="text-[18px] leading-none text-[#00708d] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.85] text-[#657078]">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="overflow-hidden rounded-[30px] border border-black/10 bg-[#080b0d] text-white">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
            <div className="p-5 sm:p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
                CONTACT
              </div>
              <h3 className="mt-3 max-w-[18ch] text-[clamp(25px,4vw,40px)] font-semibold leading-[1.06] tracking-[-0.06em] text-white/[0.92]">
                修正依頼や確認は問い合わせ窓口から
              </h3>
              <p className="mt-4 max-w-2xl text-[13px] leading-[1.9] text-white/[0.46]">
                数値の誤り、リンク切れ、引用や掲載内容に関する確認などは、内容が分かるURLとあわせてご連絡ください
              </p>
            </div>
            <div className="border-t border-white/10 p-5 lg:grid lg:min-w-[220px] lg:place-items-center lg:border-l lg:border-t-0">
              <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-[13px] font-semibold text-[#080b0d] transition-colors hover:bg-white/[0.88]">
                お問い合わせ ↗
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
