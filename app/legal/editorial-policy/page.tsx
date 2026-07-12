// app/legal/editorial-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocHeader } from "@/components/legal/LegalDocHeader";
import { LegalDocSection } from "@/components/legal/LegalDocSection";
import { LegalProcessFlow } from "@/components/legal/LegalProcessFlow";
import { LegalRelatedLinks } from "@/components/legal/LegalRelatedLinks";
import { LegalSummaryGrid } from "@/components/legal/LegalSummaryGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "編集方針",
  description:
    "CAR BOUTIQUE JOURNALの編集方針です 記事の目的、確認範囲、更新・訂正、読者への前提を説明します",
  alternates: { canonical: `${getSiteUrl()}/legal/editorial-policy` },
};

const PRINCIPLES = [
  { label: "01", title: "公式情報", body: "メーカー公式発表、公的機関、取扱説明書、技術資料を確認の軸にします" },
  { label: "02", title: "読者目線の編集", body: "専門用語と条件差を分け、読者が判断に使える順番へ整理します" },
  { label: "03", title: "車両ごとの条件差", body: "年式、グレード、個体差、地域、契約条件による違いを前提にします" },
] as const;

const PROCESS = [
  { label: "Source", title: "情報源確認", body: "公式情報、資料、専門媒体を確認" },
  { label: "Context", title: "条件整理", body: "車種、年式、施工内容、契約条件を分ける" },
  { label: "Edit", title: "本文編集", body: "断定しすぎず、判断材料として読める形にする" },
  { label: "Update", title: "公開後更新", body: "誤記、古い情報、リンク切れを確認して見直す" },
] as const;

export default function EditorialPolicyPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "法務・運営情報", item: `${getSiteUrl()}/legal` },
      { "@type": "ListItem", position: 3, name: "編集方針", item: `${getSiteUrl()}/legal/editorial-policy` },
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
        title="確認できることと、条件で変わることを分けて書く"
        lead="CAR BOUTIQUE JOURNAL編集部が、記事の企画、構成、本文表現、出典確認、公開後の見直しを行います"
        meta={[
          { label: "対象", value: "車種 / ガイド / コラム / 系譜" },
          { label: "編集責任", value: "CAR BOUTIQUE JOURNAL 編集部" },
          { label: "確認軸", value: "公式情報 / 一次資料 / 条件差" },
          { label: "関連", value: <Link href="/legal/sources-factcheck">出典・ファクトチェック</Link> },
        ]}
      />

      <div className="mt-8 space-y-8">
        <LegalSummaryGrid items={PRINCIPLES} />
        <LegalProcessFlow items={PROCESS} />

        <div className="space-y-10">
          <LegalDocSection index="01" title="取り扱う内容">
            <p>
              車選び、維持、整備修理、カスタム、売却、車やメーカーの歴史まで、読者が車に関して判断する場面を扱います
            </p>
            <p>
              公式情報で確認できる事実、資料から読み取れる内容、編集部の見解はできるだけ分けて記述します
            </p>
          </LegalDocSection>

          <LegalDocSection index="02" title="注意して扱うテーマ">
            <p>
              整備、故障、車検、保証、保険、税金、売買、契約に関わる内容は、読者の判断に直接影響します
            </p>
            <p>
              記事は一般的な判断材料であり、個別車両の診断や個別条件の確定ではありません
            </p>
          </LegalDocSection>

          <LegalDocSection index="03" title="更新・修正・訂正">
            <p>
              仕様変更、制度改定、価格変更、リンク切れ、表現の見直しが必要になった場合は、本文または更新履歴を修正します
            </p>
            <p>
              明確な誤りが判明した場合は、確認のうえ修正します
            </p>
          </LegalDocSection>

          <LegalDocSection index="04" title="お問い合わせと訂正依頼">
            <p>
              記事内容に関するご指摘、誤りのご連絡、更新が必要な情報の共有は、<Link href="/contact">お問い合わせページ</Link>からご連絡ください
            </p>
          </LegalDocSection>
        </div>

        <LegalRelatedLinks
          items={[
            { href: "/legal/sources-factcheck", label: "出典・ファクトチェック", description: "参照する情報源と確認の基本方針" },
            { href: "/legal/about", label: "運営者情報", description: "運営者と編集責任の表示" },
            { href: "/legal/ads-affiliate-policy", label: "広告・アフィリエイト", description: "収益化と編集の距離感、表記ルールについて" },
            { href: "/contact", label: "お問い合わせ", description: "誤記修正や掲載内容への連絡窓口" },
          ]}
        />
      </div>
    </>
  );
}
