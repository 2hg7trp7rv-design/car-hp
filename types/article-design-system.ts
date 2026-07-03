import type {
  ArticleDesignSpec,
  GuideActionBox,
  GuideAuthorProfile,
  GuideBreadcrumbItem,
  GuideDetailSection,
  GuideFaqItem,
} from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";

export type ArticleRelatedItem = {
  slug: string;
  href: string;
  metaLabel: string;
  title: string;
  summary: string;
  date?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
};

export type ArticlePageLabels = {
  relatedTitle: string;
  relatedAriaLabel?: string;
  sourcesTitle?: string;
  updateTitle?: string;
  footerListHref: string;
  footerListLabel: string;
};

export type ArticleViewModel = {
  slug: string;
  title: string;
  eyebrowLabel: string;
  breadcrumbTrail: GuideBreadcrumbItem[];
  author: GuideAuthorProfile;
  lead?: string | null;
  body?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readMinutes?: number | null;
  keyPoints?: string[] | null;
  checkpoints?: string[] | null;
  sections?: GuideDetailSection[] | null;
  faq?: GuideFaqItem[] | null;
  actionBox?: GuideActionBox | null;
  sources?: string[] | null;
  updateText?: string | null;
  relatedItems?: ArticleRelatedItem[] | null;
  heroImage?: string | null;
  heroAlt?: string | null;
  articleDesign?: ArticleDesignSpec | null;
};

export type ArticleDesignPageProps = {
  article: ArticleViewModel;
  labels: ArticlePageLabels;
  linkIndex: Record<string, InternalLinkMeta>;
};
