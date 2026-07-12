import { JsonLd } from "@/components/seo/JsonLd";
import { CbjWorldArticlePage } from "@/components/articleDesignSystem/CbjWorldArticlePage";
import type { ArticlePageLabels, ArticleRelatedItem } from "@/types/article-design-system";
import type { ColumnItem } from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { filterActionBoxForDiscovery } from "@/lib/content/internal-link-index";
import { getSiteUrl } from "@/lib/site";
import { humanizeUpdateReason } from "@/lib/update-reason";
import {
  cbjEditorialOrganizationJsonLd,
  resolveVerifiedArticleAuthor,
} from "@/lib/brand/editorial-identity";

type Props = { item: ColumnItem; related: ColumnItem[]; linkIndex: Record<string, InternalLinkMeta> };

function formatDateDot(iso?: string | null): string {
  if (!iso) return "";
  const isoDate = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/u);
  if (isoDate) return `${isoDate[1]}.${isoDate[2]}.${isoDate[3]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function relatedMetaLabel(item: ColumnItem): string {
  return item.eyebrowLabel?.trim() || item.displayTag?.trim() || "コラム";
}

export function ColumnEditorialArticlePage({ item, related, linkIndex }: Props) {
  const siteUrl = getSiteUrl();
  const title = item.titleJa ?? item.title;
  const pageUrl = `${siteUrl}/column/${encodeURIComponent(item.slug)}`;
  const breadcrumbTrail = item.breadcrumbTrail && item.breadcrumbTrail.length > 0
    ? item.breadcrumbTrail
    : [{ label: "ホーム", href: "/" }, { label: "コラム", href: "/column" }, { label: title }];
  const author = resolveVerifiedArticleAuthor(item.authorProfile);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail.map((entry, index) => ({ "@type": "ListItem", position: index + 1, name: entry.label, item: entry.href ? `${siteUrl}${entry.href}` : pageUrl })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: item.description ?? item.seoDescription ?? item.summary ?? item.lead ?? title,
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    datePublished: item.publishedAt ?? item.createdAt ?? undefined,
    dateModified: item.updatedAt ?? item.publishedAt ?? item.createdAt ?? undefined,
    author: cbjEditorialOrganizationJsonLd(siteUrl),
    publisher: { "@type": "Organization", name: "CAR BOUTIQUE JOURNAL", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512x512.png` } },
  };

  const faqJsonLd = (item.faq?.length ?? 0) > 0
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (item.faq ?? []).map((entry) => ({ "@type": "Question", name: entry.question, acceptedAnswer: { "@type": "Answer", text: entry.answer } })) }
    : null;

  const relatedItems: ArticleRelatedItem[] = related.map((entry) => ({
    slug: entry.slug,
    href: `/column/${encodeURIComponent(entry.slug)}`,
    metaLabel: relatedMetaLabel(entry),
    title: entry.titleJa ?? entry.title,
    summary: entry.summary || entry.lead || "次の判断材料として読んでおきたい関連記事です。",
    date: formatDateDot(entry.updatedAt || entry.publishedAt || entry.createdAt),
    imageSrc: entry.heroImage || entry.thumbnail || entry.ogImageUrl || null,
    imageAlt: entry.titleJa ?? entry.title,
  }));

  const labels: ArticlePageLabels = {
    relatedTitle: "関連記事",
    relatedAriaLabel: "関連記事",
    sourcesTitle: "出典・参考資料",
    updateTitle: "更新履歴",
    footerListHref: "/column",
    footerListLabel: "コラム一覧へ",
  };

  return (
    <>
      <JsonLd id={`ld-breadcrumb-column-${item.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`ld-column-${item.slug}`} data={articleJsonLd} />
      {faqJsonLd ? <JsonLd id={`ld-column-faq-${item.slug}`} data={faqJsonLd} /> : null}
      <CbjWorldArticlePage
        article={{
          slug: item.slug,
          title,
          eyebrowLabel: item.eyebrowLabel ?? item.displayTag ?? "コラム",
          breadcrumbTrail,
          author,
          lead: item.lead,
          body: item.body,
          publishedAt: item.publishedAt ?? item.createdAt,
          updatedAt: item.updatedAt ?? item.publishedAt ?? item.createdAt,
          readMinutes: item.readMinutes,
          keyPoints: item.keyPoints,
          checkpoints: item.checkpoints,
          sections: item.detailSections,
          faq: item.faq,
          actionBox: filterActionBoxForDiscovery(item.actionBox, linkIndex),
          sources: item.sources,
          updateText: `${item.updatedAt ? `${formatDateDot(item.updatedAt)}：` : ""}${humanizeUpdateReason(item.updateReason)}`,
          relatedItems,
          heroImage: item.heroImage || item.thumbnail || item.ogImageUrl,
          heroAlt: item.titleJa ?? item.title,
          articleDesign: item.articleDesign,
        }}
        labels={labels}
        linkIndex={linkIndex}
      />
    </>
  );
}
