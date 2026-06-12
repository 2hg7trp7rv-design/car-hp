import { JsonLd } from "@/components/seo/JsonLd";
import {
  EditorialArticlePage,
  type EditorialArticleLabels,
  type EditorialRelatedItem,
} from "@/components/editorialArticle/EditorialArticlePage";
import type { ColumnItem, GuideDetailSection } from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { getSiteUrl } from "@/lib/site";
import { humanizeUpdateReason } from "@/lib/update-reason";

type Props = {
  item: ColumnItem;
  related: ColumnItem[];
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

function resolveAuthorProfile(item: ColumnItem) {
  if (item.authorProfile?.name) return item.authorProfile;
  return {
    kind: "person" as const,
    name: "山田太郎",
    credential: "CAR BOUTIQUE JOURNAL 運営・編集 / 自動車業界経験者",
  };
}

function relatedMetaLabel(item: ColumnItem): string {
  return item.eyebrowLabel?.trim() || item.displayTag?.trim() || "コラム";
}

function compactText(value?: string | null): string {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .trim();
}

function buildEditorialReviewSection(sourceCount: number): GuideDetailSection {
  const sourceText = sourceCount > 0 ? `この記事では、本文末に${sourceCount}件の出典・参考資料を表示しています。` : "この記事では、確認できる範囲で事実関係と表現を確認しています。";

  return {
    id: "editorial-review",
    title: "編集・確認体制",
    displayTitle: "編集・確認体制",
    chapterLabel: "EDITORIAL REVIEW",
    deck: "この記事をどう確認し、どこまでを判断材料として扱うか。",
    blocks: [
      {
        type: "editorialBoard",
        eyebrow: "CBJ REVIEW",
        title: "公開前に確認していること",
        lead: "この記事は、自動車業界での実務経験を持つ山田太郎が、確認できる情報と条件によって変わる内容を分けながら編集しています。",
        items: [
          {
            number: "01",
            title: "運営・編集者",
            body: "山田太郎が記事構成、本文表現、出典表示、更新履歴、読者判断への影響を確認します。支払い、売買、保証などに関わる内容は、時期や条件で結果が変わる前提で扱います。",
          },
          {
            number: "02",
            title: "確認する情報",
            body: "メーカー公式発表、公的機関、公開資料、信頼できる専門媒体を優先します。数値や条件は公開時点の情報として扱い、変更される可能性がある箇所は断定を避けます。",
          },
          {
            number: "03",
            title: "記事の限界",
            body: "記事は一般的な判断材料です。個別の条件によって結果が変わる内容は、一次資料や関係先での確認を優先してください。",
          },
          {
            number: "04",
            title: "更新・訂正",
            body: "誤記、リンク切れ、条件変更が判明した場合は本文または更新履歴で修正します。重要な変更は、記事末の更新履歴に残す運用とします。",
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
  const sourceText = sourceCount > 0 ? `本文末の出典・参考資料${sourceCount}件を確認対象に含めています。` : "確認できる範囲で事実関係と表現を確認しています。";
  return `${source}\n\n## 編集・確認体制\nこの記事は、自動車業界での実務経験を持つ山田太郎が、確認できる情報と条件によって変わる内容を分けながら編集しています。${sourceText}記事は一般的な判断材料です。個別の条件によって結果が変わる内容は、一次資料や関係先での確認を優先してください。`;
}

export function ColumnEditorialArticlePage({ item, related, linkIndex }: Props) {
  const siteUrl = getSiteUrl();
  const title = item.titleJa ?? item.title;
  const pageUrl = `${siteUrl}/column/${encodeURIComponent(item.slug)}`;
  const authorPageUrl = `${siteUrl}/legal/about`;
  const sourceCount = item.sources?.length ?? 0;
  const breadcrumbTrail =
    item.breadcrumbTrail && item.breadcrumbTrail.length > 0
      ? item.breadcrumbTrail
      : [
          { label: "ホーム", href: "/" },
          { label: "コラム", href: "/column" },
          { label: title },
        ];
  const author = resolveAuthorProfile(item);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbTrail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.label,
      item: entry.href ? `${siteUrl}${entry.href}` : pageUrl,
    })),
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
    author: {
      "@type": author.kind === "person" ? "Person" : "Organization",
      name: author.name,
      jobTitle: author.kind === "person" ? author.credential ?? undefined : undefined,
      url: author.kind === "person" ? authorPageUrl : siteUrl,
    },
    reviewedBy: {
      "@type": "Person",
      name: "山田太郎",
      jobTitle: "CAR BOUTIQUE JOURNAL 運営・編集 / 自動車業界経験者",
      url: authorPageUrl,
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
    (item.faq?.length ?? 0) > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (item.faq ?? []).map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: entry.answer,
            },
          })),
        }
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

      <EditorialArticlePage
        article={{
          title,
          eyebrowLabel: item.eyebrowLabel ?? item.displayTag ?? "コラム",
          breadcrumbTrail,
          author,
          lead: item.lead,
          body: appendEditorialReviewBody(item.body, sourceCount),
          publishedAt: item.publishedAt ?? item.createdAt,
          updatedAt: item.updatedAt ?? item.publishedAt ?? item.createdAt,
          readMinutes: item.readMinutes,
          keyPoints: item.keyPoints,
          checkpoints: item.checkpoints,
          sections: appendEditorialReviewSection(item.detailSections, sourceCount),
          faq: item.faq,
          actionBox: item.actionBox,
          sources: item.sources,
          updateText: `${item.updatedAt ? `${formatDateDot(item.updatedAt)}：` : ""}${humanizeUpdateReason(item.updateReason)}`,
          relatedItems,
          heroImage: item.heroImage,
          heroAlt: item.titleJa ?? item.title,
          suppressHeroVisual: item.slug === "modern-car-custom-regret-reason-column",
        }}
        labels={labels}
        linkIndex={linkIndex}
      />
    </>
  );
}
