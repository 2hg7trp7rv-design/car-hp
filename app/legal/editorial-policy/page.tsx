// app/legal/editorial-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "編集方針",
  description:
    "CAR BOUTIQUE JOURNALの編集方針です。記事の目的、確認範囲、更新・訂正、読者への前提を説明します。",
  alternates: { canonical: `${getSiteUrl()}/legal/editorial-policy` },
};

export default function EditorialPolicyPage() {
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
      {
        "@type": "ListItem",
        position: 3,
        name: "編集方針",
        item: `${getSiteUrl()}/legal/editorial-policy`,
      },
    ],
  };

  return (
    <>
      <JsonLd id="jsonld-legal-editorial-breadcrumb" data={breadcrumbData} />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "法務・運営情報", href: "/legal" },
          { label: "編集方針" },
        ]}
        className="mb-8"
      />

      <LegalDocHeader
        eyebrow="編集方針"
        title="確認できることと、条件で変わることを分けて書く。"
        lead="CAR BOUTIQUE JOURNALでは、自動車業界経験のある山田太郎が運営・編集責任者として記事の企画、構成、本文表現、公開後の見直しを行います。車は年式、グレード、個体差、地域、契約条件によって判断が変わるため、断定しすぎず、読者が自分の条件に置き換えられる記事を目指します。"
        meta={[
          { label: "対象", value: "車種 / ガイド / コラム / 系譜" },
          { label: "編集責任", value: "山田太郎" },
          { label: "経験", value: "自動車業界での実務経験" },
          { label: "関連", value: <Link href="/legal/sources-factcheck">出典・ファクトチェック</Link> },
        ]}
      />

      <div className="mt-12 space-y-10">
        <LegalDocSection index="01" title="取り扱う内容">
          <p>
            車種、整備、維持費、売買、カスタム、車の歴史や系譜を扱います。
            どの記事でも、単に情報を並べるのではなく、読者が判断するときにどこで迷うのかを意識して構成します。
          </p>
          <p>
            公式情報で確認できる事実、資料から読み取れる内容、運営者の見解はできるだけ分けて記述します。
            推測や条件付きの内容は、断定ではなく前提を添えて扱います。
          </p>
        </LegalDocSection>

        <LegalDocSection index="02" title="記事制作の基本">
          <p>
            記事は、メーカー公式発表、公的機関、取扱説明書、技術資料、信頼できる専門媒体などを参照し、
            読者が読みやすい形に整理します。参照先は可能な範囲で記事末に明記します。
          </p>
          <p>
            実体験やオーナー目線の見方を含める場合でも、公式情報と同じ扱いにはしません。
            体感や見解は、判断材料の一つとして位置づけます。
          </p>
        </LegalDocSection>

        <LegalDocSection index="03" title="注意して扱うテーマ">
          <p>
            整備、故障、車検、保証、保険、税金、売買、契約に関わる内容は、読者の判断に直接影響します。
            そのため、車種、年式、地域、契約条件、施工内容によって結果が変わることを前提に記述します。
          </p>
          <p>
            記事は一般的な判断材料であり、個別車両の診断や個別条件の確定ではありません。
            必要な場面では、現車確認、一次資料、関係先への確認を優先するよう明記します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="04" title="更新・修正・訂正">
          <p>
            仕様変更、制度改定、価格変更、リンク切れ、表現の見直しが必要になった場合は、本文または更新履歴を修正します。
          </p>
          <p>
            明確な誤りが判明した場合は、確認のうえ修正します。重要な訂正は、必要に応じて記事内に注記を残します。
          </p>
        </LegalDocSection>

        <LegalDocSection index="05" title="お問い合わせと訂正依頼">
          <p>
            記事内容に関するご指摘、誤りのご連絡、更新が必要な情報の共有は、
            <Link href="/contact">お問い合わせページ</Link>からご連絡ください。
          </p>
        </LegalDocSection>

        <LegalRelatedLinks
          items={[
            {
              href: "/legal/sources-factcheck",
              label: "出典・ファクトチェック",
              description: "参照する情報源と確認の基本方針。",
            },
            {
              href: "/legal/about",
              label: "運営者情報",
              description: "運営者と編集責任の表示。",
            },
            {
              href: "/legal/ads-affiliate-policy",
              label: "広告・アフィリエイト",
              description: "収益化と編集の距離感、表記ルールについて。",
            },
            {
              href: "/contact",
              label: "お問い合わせ",
              description: "誤記修正や掲載内容への連絡窓口。",
            },
          ]}
        />
      </div>
    </>
  );
}
