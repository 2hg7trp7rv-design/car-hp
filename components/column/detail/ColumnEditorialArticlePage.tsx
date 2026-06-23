import { JsonLd } from "@/components/seo/JsonLd";
import { KintoJsonArticlePage } from "@/components/editorialArticle/KintoJsonArticlePage";
import { ColumnV15ArticlePage } from "@/components/column/detail/ColumnV15ArticlePage";
import type { EditorialArticleLabels, EditorialRelatedItem } from "@/components/editorialArticle/EditorialArticlePage";
import type { ColumnItem } from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { getSiteUrl } from "@/lib/site";
import { humanizeUpdateReason } from "@/lib/update-reason";

type Props = { item: ColumnItem; related: ColumnItem[]; linkIndex: Record<string, InternalLinkMeta> };

const V15_ARTICLE_SLUG = "modern-car-custom-regret-reason-column";

function formatDateDot(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function resolveAuthorProfile(item: ColumnItem) {
  if (item.authorProfile?.name) return item.authorProfile;
  return { kind: "person" as const, name: "山田太郎", credential: "CAR BOUTIQUE JOURNAL 運営・編集 / 自動車業界経験者" };
}

function relatedMetaLabel(item: ColumnItem): string {
  return item.eyebrowLabel?.trim() || item.displayTag?.trim() || "コラム";
}

export function ColumnEditorialArticlePage({ item, related, linkIndex }: Props) {
  const siteUrl = getSiteUrl();
  const title = item.titleJa ?? item.title;
  const pageUrl = `${siteUrl}/column/${encodeURIComponent(item.slug)}`;
  const authorPageUrl = `${siteUrl}/legal/about`;
  const breadcrumbTrail = item.breadcrumbTrail && item.breadcrumbTrail.length > 0
    ? item.breadcrumbTrail
    : [{ label: "ホーム", href: "/" }, { label: "コラム", href: "/column" }, { label: title }];
  const author = resolveAuthorProfile(item);

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
    author: { "@type": author.kind === "person" ? "Person" : "Organization", name: author.name, jobTitle: author.kind === "person" ? author.credential ?? undefined : undefined, url: author.kind === "person" ? authorPageUrl : siteUrl },
    reviewedBy: { "@type": "Person", name: "山田太郎", jobTitle: "CAR BOUTIQUE JOURNAL 運営・編集 / 自動車業界経験者", url: authorPageUrl },
    publisher: { "@type": "Organization", name: "CAR BOUTIQUE JOURNAL", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512x512.png` } },
  };

  const faqJsonLd = (item.faq?.length ?? 0) > 0
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (item.faq ?? []).map((entry) => ({ "@type": "Question", name: entry.question, acceptedAnswer: { "@type": "Answer", text: entry.answer } })) }
    : null;

  const relatedItems: EditorialRelatedItem[] = related.map((entry) => ({
    slug: entry.slug,
    href: `/column/${encodeURIComponent(entry.slug)}`,
    metaLabel: relatedMetaLabel(entry),
    title: entry.titleJa ?? entry.title,
    summary: entry.summary || entry.lead || "次の判断材料として読んでおきたい関連記事です。",
    date: formatDateDot(entry.updatedAt || entry.publishedAt || entry.createdAt),
    imageSrc: entry.heroImage || entry.thumbnail || entry.ogImageUrl || null,
    imageAlt: entry.titleJa ?? entry.title,
  }));

  const labels: EditorialArticleLabels = {
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
      {item.slug === V15_ARTICLE_SLUG ? (
        <ColumnV15ArticlePage />
      ) : (
        <KintoJsonArticlePage
          article={{
            slug: item.slug,
            layoutId: item.slug,
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
            actionBox: item.actionBox,
            sources: item.sources,
            updateText: `${item.updatedAt ? `${formatDateDot(item.updatedAt)}：` : ""}${humanizeUpdateReason(item.updateReason)}`,
            relatedItems,
            heroImage: item.heroImage || item.thumbnail || item.ogImageUrl,
            heroAlt: item.titleJa ?? item.title,
          }}
          labels={labels}
          linkIndex={linkIndex}
        />
      )}
    </>
  );
}
