import { JsonLd } from "@/components/seo/JsonLd";
import { CbjWorldArticlePage } from "@/components/articleDesignSystem/CbjWorldArticlePage";
import { ArticleHeader } from "@/components/articleDesignSystem/ArticleHeader";
import { ArticleFooter } from "@/components/articleDesignSystem/ArticleEndSections";
import type { ArticlePageLabels, ArticleRelatedItem } from "@/types/article-design-system";
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


function hasItems<T>(items?: T[] | null): boolean {
  return Array.isArray(items) && items.length > 0;
}

function hasText(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isTitleOnlyGuide(guide: GuideItem): boolean {
  return (
    !hasText(guide.lead) &&
    !hasText(guide.body) &&
    !hasItems(guide.keyPoints) &&
    !hasItems(guide.checkpoints) &&
    !hasItems(guide.detailSections) &&
    !hasItems(guide.faq) &&
    !guide.actionBox &&
    !guide.articleDesign &&
    !hasItems(guide.sources)
  );
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

  const relatedItems: ArticleRelatedItem[] = related.map((item) => ({
    slug: item.slug,
    href: `/guide/${encodeURIComponent(item.slug)}`,
    metaLabel: relatedMetaLabel(item),
    title: item.title,
    summary: item.summary || item.lead || "次の判断材料として読んでおきたい関連ガイドです。",
    date: formatDateDot(item.updatedAt || item.publishedAt),
    imageSrc: item.heroImage || item.thumbnail || item.ogImageUrl || null,
    imageAlt: item.title,
  }));

  const labels: ArticlePageLabels = {
    relatedTitle: "関連記事",
    relatedAriaLabel: "関連記事",
    sourcesTitle: "出典・参考資料",
    updateTitle: "更新履歴",
    footerListHref: "/guide",
    footerListLabel: "ガイド一覧へ",
  };


  if (isTitleOnlyGuide(guide)) {
    return (
      <>
        <JsonLd id={`guide-editorial-breadcrumb-${guide.slug}`} data={breadcrumbJsonLd} />
        <main id="cb-main" className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]" data-guide-title-only>
          <ArticleHeader />
          <section className="mx-auto flex min-h-[62svh] w-full max-w-[980px] flex-col justify-center px-5 py-24 sm:px-8">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">GUIDE</p>
            <h1 className="mt-5 whitespace-pre-line text-[clamp(2.1rem,7.6vw,4.9rem)] font-semibold leading-[1.14] tracking-[-0.055em] text-[var(--text-primary)]">
              {guide.title}
            </h1>
          </section>
          <ArticleFooter labels={labels} />
        </main>
      </>
    );
  }

  return (
    <>
      <JsonLd id={`guide-editorial-breadcrumb-${guide.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`guide-editorial-article-${guide.slug}`} data={articleJsonLd} />
      {faqJsonLd ? <JsonLd id={`guide-editorial-faq-${guide.slug}`} data={faqJsonLd} /> : null}
      <CbjWorldArticlePage
        article={{
          slug: guide.slug,
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
          heroImage: guide.heroImage || guide.thumbnail || guide.ogImageUrl,
          heroAlt: guide.title,
          articleDesign: guide.articleDesign,
        }}
        labels={labels}
        linkIndex={linkIndex}
      />
    </>
  );
}
