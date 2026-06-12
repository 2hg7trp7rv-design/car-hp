import { JsonLd } from "@/components/seo/JsonLd";
import {
  EditorialArticlePage,
  type EditorialArticleLabels,
  type EditorialRelatedItem,
} from "@/components/editorialArticle/EditorialArticlePage";
import type { GuideDetailSection, GuideItem } from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { getSiteUrl } from "@/lib/site";
import { humanizeUpdateReason } from "@/lib/update-reason";

type Props = {
  guide: GuideItem;
  related: GuideItem[];
  linkIndex: Record<string, InternalLinkMeta>;
};

function formatDateDot(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function toAbsoluteUrl(siteUrl: string, href?: string | null): string | undefined {
  const value = (href ?? "").trim();
  if (!value) return undefined;
  if (isExternalHref(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function categoryLabel(guide: GuideItem): string {
  const category = String(guide.category ?? "").toUpperCase();
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル";
    case "MONEY":
      return "お金・維持費";
    case "BUY":
      return "購入計画";
    case "SELL":
      return "売却・乗り換え";
    case "INSURANCE":
      return "保険・補償";
    default:
      return guide.displayTag?.trim() || "ガイド";
  }
}

function resolveAuthorProfile(guide: GuideItem) {
  if (guide.authorProfile?.name) return guide.authorProfile;
  return {
    kind: "organization" as const,
    name: "CAR BOUTIQUE JOURNAL 編集部",
    credential: "編集・確認：出典、更新日、安全上の前提を確認",
  };
}

function relatedMetaLabel(guide: GuideItem): string {
  return guide.eyebrowLabel?.trim() || guide.displayTag?.trim() || categoryLabel(guide);
}

function compactText(value?: string | null): string {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .trim();
}

function buildEditorialReviewSection(sourceCount: number): GuideDetailSection {
  const sourceText = sourceCount > 0 ? `この記事では、本文末に${sourceCount}件の出典・参考資料を表示しています。` : "この記事では、確認できる範囲で編集部が事実関係と表現を確認しています。";

  return {
    id: "editorial-review",
    title: "編集・確認体制",
    displayTitle: "編集・確認体制",
    chapterLabel: "EDITORIAL REVIEW",
    deck: "誰が、何を確認して公開しているかを本文内にも明示します。",
    blocks: [
      {
        type: "editorialBoard",
        eyebrow: "CBJ REVIEW",
        title: "公開前に確認していること",
        lead: "CAR BOUTIQUE JOURNAL 編集部が、一次情報・メーカー資料・公的資料・専門媒体を優先して確認し、断定できない内容は条件付きで扱います。",
        items: [
          {
            number: "01",
            title: "執筆・編集責任",
            body: "CAR BOUTIQUE JOURNAL 編集部が記事構成、表現、読者判断への影響を確認します。車検・保証・整備に関わる内容は、車種・年式・地域・施工内容で結果が変わる前提で記述します。",
          },
          {
            number: "02",
            title: "事実確認",
            body: "メーカー公式発表、公的機関、取扱説明書、技術資料、信頼できる専門媒体を優先します。数値や制度は公開時点の情報として扱い、変更される可能性がある箇所は断定を避けます。",
          },
          {
            number: "03",
            title: "安全上の限界",
            body: "記事は一般的な判断材料であり、個別車両の診断、法的判断、整備作業の代替ではありません。異音、警告灯、制動、保安基準に関わる場合は現車確認を優先してください。",
          },
          {
            number: "04",
            title: "更新・訂正",
            body: "誤記、リンク切れ、仕様変更が判明した場合は本文または更新履歴で修正します。重要な変更は、記事末の更新履歴に残す運用とします。",
          },
        ],
        note: `${sourceText} 編集方針、出典・ファクトチェック方針、問い合わせ窓口はサイト内の法務・運営情報にまとめています。`,
      },
    ],
  };
}

function appendEditorialReviewSection(
  sections: GuideDetailSection[] | null | undefined,
  sourceCount: number,
): GuideDetailSection[] | null | undefined {
  if (!sections || sections.length === 0) return sections;
  const exists = sections.some((section) => {
    const key = compactText(`${section.id ?? ""}${section.title ?? ""}${section.displayTitle ?? ""}`);
    return key.includes("editorial-review") || key.includes("編集確認体制");
  });
  if (exists) return sections;
  return [...sections, buildEditorialReviewSection(sourceCount)];
}

function appendEditorialReviewBody(body: string | null | undefined, sourceCount: number): string | null | undefined {
  const source = String(body ?? "").trim();
  if (!source) return body;
  if (source.includes("## 編集・確認体制")) return body;
  const sourceText = sourceCount > 0 ? `本文末の出典・参考資料${sourceCount}件を確認対象に含めています。` : "確認できる範囲で編集部が事実関係と表現を確認しています。";
  return `${source}\n\n## 編集・確認体制\nCAR BOUTIQUE JOURNAL 編集部が、一次情報・メーカー資料・公的資料・専門媒体を優先して確認し、断定できない内容は条件付きで扱います。${sourceText}記事は一般的な判断材料であり、個別車両の診断、法的判断、整備作業の代替ではありません。異音、警告灯、制動、保安基準に関わる場合は現車確認を優先してください。`;
}

export function GuideEditorialArticlePage({ guide, related, linkIndex }: Props) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/guide/${encodeURIComponent(guide.slug)}`;
  const eyebrowLabel = guide.eyebrowLabel?.trim() || categoryLabel(guide);
  const sourceCount = guide.sources?.length ?? 0;
  const breadcrumbTrail =
    guide.breadcrumbTrail && guide.breadcrumbTrail.length > 0
      ? guide.breadcrumbTrail
      : [
          { label: "ホーム", href: "/" },
          { label: "ガイド", href: "/guide" },
          { label: guide.title },
        ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: toAbsoluteUrl(siteUrl, item.href) ?? pageUrl,
    })),
  };

  const authorProfile = resolveAuthorProfile(guide);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    headline: guide.title,
    description: guide.description ?? guide.seoDescription ?? guide.summary ?? guide.lead ?? guide.title,
    url: pageUrl,
    inLanguage: "ja",
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author:
      authorProfile.kind === "organization"
        ? {
            "@type": "Organization",
            name: authorProfile.name,
          }
        : {
            "@type": "Person",
            name: authorProfile.name,
            jobTitle: authorProfile.credential ?? undefined,
          },
    reviewedBy: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL 編集部",
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512x512.png`,
      },
    },
  };

  const faqJsonLd =
    (guide.faq?.length ?? 0) > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (guide.faq ?? []).map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  const relatedItems: EditorialRelatedItem[] = related.map((item) => ({
    slug: item.slug,
    href: `/guide/${encodeURIComponent(item.slug)}`,
    metaLabel: relatedMetaLabel(item),
    title: item.title,
    summary: item.summary || item.lead || "次の判断材料として読んでおきたい関連ガイドです。",
    date: formatDateDot(item.updatedAt || item.publishedAt),
    imageSrc: item.heroImage || item.thumbnail || item.ogImageUrl || null,
    imageAlt: item.title,
  }));

  const labels: EditorialArticleLabels = {
    relatedTitle: "関連記事",
    relatedAriaLabel: "関連記事",
    sourcesTitle: "出典・参考資料",
    updateTitle: "更新履歴",
    footerListHref: "/guide",
    footerListLabel: "ガイド一覧へ",
  };

  return (
    <>
      <JsonLd id={`guide-editorial-breadcrumb-${guide.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`guide-editorial-article-${guide.slug}`} data={articleJsonLd} />
      {faqJsonLd ? <JsonLd id={`guide-editorial-faq-${guide.slug}`} data={faqJsonLd} /> : null}

      <EditorialArticlePage
        article={{
          title: guide.title,
          eyebrowLabel,
          breadcrumbTrail,
          author: authorProfile,
          lead: guide.lead,
          body: appendEditorialReviewBody(guide.body, sourceCount),
          publishedAt: guide.publishedAt,
          updatedAt: guide.updatedAt,
          readMinutes: guide.readMinutes,
          keyPoints: guide.keyPoints,
          checkpoints: guide.checkpoints,
          sections: appendEditorialReviewSection(guide.detailSections, sourceCount),
          faq: guide.faq,
          actionBox: guide.actionBox,
          sources: guide.sources,
          updateText: guide.updateReason
            ? `${guide.updatedAt ? `${formatDateDot(guide.updatedAt)}：` : ""}${humanizeUpdateReason(guide.updateReason)}`
            : null,
          relatedItems,
          heroImage: guide.heroImage,
          heroAlt: guide.title,
        }}
        labels={labels}
        linkIndex={linkIndex}
      />
    </>
  );
}
