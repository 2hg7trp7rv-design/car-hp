// lib/seo/jsonld.ts
import { getSiteUrl } from "@/lib/site";
type BreadcrumbItem = {
  name: string;
  item: string;
};

type BuildBreadcrumbListArgs = {
  items: BreadcrumbItem[];
};

type BuildArticleArgs = {
  headline: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
  publisherName?: string | null;
  publisherLogoUrl?: string | null;
  publisherUrl?: string | null;
  publisherSameAs?: string[] | null;
  inLanguage?: string | null; // 例: "ja-JP"
};

type BuildOrganizationArgs = {
  name: string;
  url?: string | null;
  logoUrl?: string | null;
  sameAs?: string[] | null;
};

export function buildOrganizationJsonLd(args: BuildOrganizationArgs) {
  const { name, url, logoUrl, sameAs } = args;

  const json: Record<string, any> = {
    "@type": "Organization",
    name,
  };

  if (url) json.url = url;
  if (logoUrl) {
    json.logo = {
      "@type": "ImageObject",
      url: logoUrl,
    };
  }
  if (sameAs && sameAs.length > 0) json.sameAs = sameAs;

  return json;
}

export function buildBreadcrumbList(args: BuildBreadcrumbListArgs) {
  const { items } = args;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

export function buildArticleJsonLd(args: BuildArticleArgs) {
  const {
    headline,
    description,
    url,
    imageUrl,
    datePublished,
    dateModified,
    authorName,
    publisherName,
    publisherLogoUrl,
    publisherUrl,
    publisherSameAs,
    inLanguage,
  } = args;

  const json: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };

  if (description) json.description = description;
  if (imageUrl) json.image = [imageUrl];
  if (datePublished) json.datePublished = datePublished;
  if (dateModified) json.dateModified = dateModified;

  if (inLanguage) json.inLanguage = inLanguage;

  if (authorName) {
    json.author = {
      "@type": "Person",
      name: authorName,
    };
  }

  if (publisherName) {
    const siteUrl = getSiteUrl();
    const defaultLogo = `${siteUrl}/icon-512x512.png`;

    // Always attach publisher url/logo by default so JSON-LD stays valid even when brand name changes.
    json.publisher = buildOrganizationJsonLd({
      name: publisherName,
      url: publisherUrl ?? siteUrl,
      logoUrl: publisherLogoUrl ?? defaultLogo,
      sameAs: publisherSameAs ?? null,
    });
  }

  return json;
}

/**
 * WebSite / WebPage を最低限入れたい時用（任意）
 */
export function buildWebSiteJsonLd(args: {
  name: string;
  url: string;
  inLanguage?: string | null;
}) {
  const { name, url, inLanguage } = args;

  const json: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
  };

  if (inLanguage) json.inLanguage = inLanguage;

  return json;
}
