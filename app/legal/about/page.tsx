// app/legal/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { LegalSummaryGrid } from "@/components/legal/LegalSummaryGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { CBJ_SITE_DESCRIPTION } from "@/lib/brand/cbj-copy";
import { getOperator } from "@/lib/operator";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "CAR BOUTIQUE JOURNALの運営者、編集責任、確認体制、サイトの目的についてのページです",
  alternates: { canonical: `${getSiteUrl()}/legal/about` },
};

export default function AboutOperatorPage() {
  const operator = getOperator();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/legal/about`;
  const personId = `${pageUrl}#operator`;

  const PROFILE_ITEMS = [
    { label: "サイト名", value: "CAR BOUTIQUE JOURNAL" },
    { label: "運営者", value: operator.name },
    { label: "編集責任", value: `${operator.name} / CAR BOUTIQUE JOURNAL 編集部` },
    { label: "専門領域", value: operator.expertise.join("、") },
  ] as const;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "法務・運営情報", item: `${siteUrl}/legal` },
      { "@type": "ListItem", position: 3, name: "運営者情報", item: pageUrl },
    ],
  };

  const operatorProfileData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": pageUrl,
    url: pageUrl,
    name: `${operator.name} - CAR BOUTIQUE JOURNAL 運営者情報`,
    dateModified: "2026-06-13",
    mainEntity: {
      "@type": "Person",
      "@id": personId,
      name: operator.name,
      jobTitle: operator.credential,
      description: operator.bio,
      knowsAbout: operator.expertise,
      worksFor: {
        "@type": "Organization",
        name: "CAR BOUTIQUE JOURNAL",
        url: siteUrl,
      },
    },
  };

  const STANCE_ITEMS = [
    {
      label: "Official",
      title: "公式情報",
      body: "メーカー公式発表、公的機関、取扱説明書、技術資料を優先して確認",
    },
    {
      label: "Experience",
      title: "自動車業界経験",
      body: "実務経験から、読者が判断で迷いやすい箇所を補足",
    },
    {
      label: "Condition",
      title: "条件差",
      body: "年式、グレード、個体差、契約条件で変わる内容を分けて扱う",
    },
  ] as const;

  return (
    <>
      <JsonLd id="jsonld-legal-about-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-operator-profile" data={operatorProfileData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "運営者情報" },
        ]}
        className="mb-8"
      />

      <header className="overflow-hidden rounded-[28px] border border-black/10 bg-[#f9f5ee]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative overflow-hidden bg-[#080b0d] p-[clamp(22px,5vw,48px)] text-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00708d]/25 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/[0.34]">
                OPERATOR
              </p>
              <h1 className="mt-5 text-[clamp(44px,8vw,84px)] font-semibold leading-[0.95] tracking-[-0.085em] text-white/[0.94]">
                {operator.name}
              </h1>
              <p className="mt-5 max-w-[520px] text-[14px] leading-[1.9] tracking-[0.03em] text-white/[0.54]">
                {operator.credential}
              </p>
            </div>
          </div>

          <div className="p-[clamp(20px,4vw,40px)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              PROFILE
            </p>
            <h2 className="mt-4 max-w-[14ch] text-[clamp(28px,5vw,50px)] font-semibold leading-[1.03] tracking-[-0.075em] text-[#080b0d]">
              車を見る基準を、記事の形にする
            </h2>
            <p className="mt-5 text-[13px] leading-[1.95] tracking-[0.02em] text-[#657078]">
              {CBJ_SITE_DESCRIPTION}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        <section className="rounded-[28px] border border-black/10 bg-white/[0.72] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILE_ITEMS.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-black/10 bg-[#f9f5ee] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/[0.34]">
                  {item.label}
                </p>
                <p className="mt-2 text-[14px] leading-[1.75] text-[#101519]">
                  {item.value}
                </p>
              </div>
            ))}
            <Link href="/contact" className="rounded-[20px] border border-black/10 bg-[#080b0d] p-4 text-white transition-colors hover:bg-[#152026]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/[0.34]">
                窓口
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.75] text-white/[0.9]">
                お問い合わせフォーム ↗
              </p>
            </Link>
          </div>
        </section>

        <LegalSummaryGrid items={STANCE_ITEMS} />

        <section className="rounded-[28px] border border-black/10 bg-white/[0.72] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
            OPERATOR PROFILE
          </p>
          <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
            運営者について
          </h2>
          <p className="mt-5 text-[13px] leading-[1.95] tracking-[0.02em] text-[#657078]">
            {operator.bio}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-black/10 bg-[#f9f5ee] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/[0.34]">
                肩書き
              </p>
              <p className="mt-2 text-[14px] leading-[1.75] text-[#101519]">
                {operator.title}
              </p>
            </div>
            <div className="rounded-[20px] border border-black/10 bg-[#f9f5ee] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/[0.34]">
                SNS・外部リンク
              </p>
              {operator.sns.length > 0 ? (
                <ul className="mt-2 space-y-1.5 text-[14px] leading-[1.75] text-[#101519]">
                  {operator.sns.map((item) => (
                    <li key={`${item.label}-${item.url}`}>
                      {item.url.startsWith("http") ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#00708d] underline underline-offset-4"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[14px] leading-[1.75] text-[#101519]">要設定</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-[#f9f5ee] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
            CHARACTERS
          </p>
          <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
            架空キャラクターと運営者の区別
          </h2>
          <p className="mt-5 text-[13px] leading-[1.95] tracking-[0.02em] text-[#657078]">
            一部のコラム記事には「莉奈（りな）」「JUNA（ジュナ）」という架空のキャラクターが登場します。会話形式で読みやすくするための編集上の演出であり、実在の人物ではありません。
          </p>
          <p className="mt-4 text-[13px] leading-[1.95] tracking-[0.02em] text-[#657078]">
            記事の企画、事実確認、公開後の見直しは、すべて上記の実在の運営者が責任を持って行っています。キャラクターの発言内容も運営者が確認した情報に基づきます。
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-black/10 bg-[#f9f5ee] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              CAN DO
            </p>
            <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
              記事でできること
            </h2>
            <ul className="mt-5 space-y-3 text-[13px] leading-[1.9] text-[#657078]">
              <li>車選び、維持、整備修理、カスタム、売却、歴史の判断材料を整理すること</li>
              <li>公式情報と条件で変わる内容を分けて示すこと</li>
              <li>誤記や古い情報が判明した場合に見直すこと</li>
            </ul>
          </article>

          <article className="rounded-[28px] border border-black/10 bg-[#f9f5ee] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00708d]">
              CANNOT DO
            </p>
            <h2 className="mt-3 text-[clamp(24px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.06em] text-[#080b0d]">
              記事でできないこと
            </h2>
            <ul className="mt-5 space-y-3 text-[13px] leading-[1.9] text-[#657078]">
              <li>個別車両の診断、契約判断、整備作業そのものの代替</li>
              <li>価格、保証、故障原因、査定額の確定</li>
              <li>販売店、整備工場、保険会社、専門家による確認の代替</li>
            </ul>
          </article>
        </section>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/editorial-policy",
              label: "編集方針",
              description: "記事制作と公開後の更新・修正の考え方",
            },
            {
              href: "/legal/sources-factcheck",
              label: "出典・ファクトチェック",
              description: "一次情報をどう優先し、どこまで確認して書くか",
            },
            {
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "修正依頼や掲載内容へのご連絡はこちらから",
            },
          ]}
        />
      </div>
    </>
  );
}
