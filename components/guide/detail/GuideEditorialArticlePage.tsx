import { JsonLd } from "@/components/seo/JsonLd";
import { KintoJsonArticlePage } from "@/components/editorialArticle/KintoJsonArticlePage";
import type { EditorialArticleLabels, EditorialRelatedItem } from "@/components/editorialArticle/EditorialArticlePage";
import type { GuideItem } from "@/lib/content-types";
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
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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
    kind: "person" as const,
    name: "山田太郎",
    credential: "CAR BOUTIQUE JOURNAL 運営・編集 / 自動車業界経験者",
  };
}

function relatedMetaLabel(guide: GuideItem): string {
  return guide.eyebrowLabel?.trim() || guide.displayTag?.trim() || categoryLabel(guide);
}

export function GuideEditorialArticlePage({ guide, related, linkIndex }: Props) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/guide/${encodeURIComponent(guide.slug)}`;
  const eyebrowLabel = guide.eyebrowLabel?.trim() || categoryLabel(guide);
  const breadcrumbTrail = guide.breadcrumbTrail && guide.breadcrumbTrail.length > 0
    ? guide.breadcrumbTrail
    : [{ label: "ホーム", href: "/" }, { label: "ガイド", href: "/guide" }, { label: guide.title }];
  const authorProfile = resolveAuthorProfile(guide);
  const authorPageUrl = `${siteUrl}/legal/about`;

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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    headline: guide.title,
    description: guide.description ?? guide.seoDescription ?? guide.summary ?? guide.lead ?? guide.title,
    url: pageUrl,
    inLanguage: "ja",
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: authorProfile.kind === "organization"
      ? { "@type": "Organization", name: authorProfile.name, url: siteUrl }
      : { "@type": "Person", name: authorProfile.name, jobTitle: authorProfile.credential ?? undefined, url: authorPageUrl },
    reviewedBy: { "@type": "Person", name: "山田太郎", jobTitle: "CAR BOUTIQUE JOURNAL 運営・編集 / 自動車業界経験者", url: authorPageUrl },
    publisher: { "@type": "Organization", name: "CAR BOUTIQUE JOURNAL", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512x512.png` } },
  };

  const faqJsonLd = (guide.faq?.length ?? 0) > 0
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (guide.faq ?? []).map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }
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
      <KintoJsonArticlePage
        article={{
          title: guide.title,
          eyebrowLabel,
          breadcrumbTrail,
          author: authorProfile,
          lead: guide.lead,
          body: guide.body,
          publishedAt: guide.publishedAt,
          updatedAt: guide.updatedAt,
          readMinutes: guide.readMinutes,
          keyPoints: guide.keyPoints,
          checkpoints: guide.checkpoints,
          sections: guide.detailSections,
          faq: guide.faq,
          actionBox: guide.actionBox,
          sources: guide.sources,
          updateText: guide.updateReason ? `${guide.updatedAt ? `${formatDateDot(guide.updatedAt)}：` : ""}${humanizeUpdateReason(guide.updateReason)}` : null,
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
