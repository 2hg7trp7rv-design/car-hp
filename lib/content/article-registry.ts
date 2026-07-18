import type { ArticleLike, ColumnItem, GuideItem } from "@/lib/content-types";
import {
  evaluatePublicationContract,
  findDuplicatePublicationSlugs,
  type PublicationContractInput,
  type PublicationDisposition,
  type PublicationIssueCode,
  type RegistryArticleType,
} from "@/lib/content/publication-contract";
import {
  readColumnsJsonDir,
  readGuidesJsonDir,
} from "@/lib/repository/data-dir";
import { findAllColumns } from "@/lib/repository/columns-repository";
import { findAllGuides } from "@/lib/repository/guides-repository";
import { isRedirectSourcePath } from "@/lib/seo/redirects";

export type ArticleRouteVisibility = "public";

export type ArticleRegistryIssueCode =
  | PublicationIssueCode
  | "duplicate-slug"
  | "type-directory-mismatch"
  | "missing-normalized-article"
  | "normalized-publication-invalid"
  | "normalized-slug-mismatch"
  | "normalized-type-mismatch"
  | "normalized-status-mismatch"
  | "normalized-public-state-mismatch"
  | "normalized-noindex-mismatch"
  | "normalized-disposition-mismatch"
  | "missing-redirect-ledger"
  | "redirect-source-path";

export type ArticleRegistryIssue = {
  code: ArticleRegistryIssueCode;
  message: string;
  sourceId: string;
  expectedType: RegistryArticleType;
  slug: string;
};

export type ArticleRegistrySource = {
  sourceId: string;
  expectedType: RegistryArticleType;
  contractInput: PublicationContractInput;
  article?: ArticleLike | null;
};

export type ArticleRouteEntry<TArticle extends ArticleLike = ArticleLike> = {
  article: TArticle;
  type: RegistryArticleType;
  slug: string;
  path: string;
  visibility: ArticleRouteVisibility;
};

export type RejectedArticleRegistryEntry = {
  sourceId: string;
  article: ArticleLike | null;
  disposition: "rejected";
  issues: readonly ArticleRegistryIssue[];
};

export type ArticleRegistry = {
  publicArticles: readonly ArticleLike[];
  previewArticles: readonly ArticleLike[];
  privateArticles: readonly ArticleLike[];
  redirectArticles: readonly ArticleLike[];
  publicGuides: readonly GuideItem[];
  previewGuides: readonly GuideItem[];
  publicColumns: readonly ColumnItem[];
  previewColumns: readonly ColumnItem[];
  rejectedArticles: readonly RejectedArticleRegistryEntry[];
  issues: readonly ArticleRegistryIssue[];
  hasErrors: boolean;
  getRouteEntry(
    _type: RegistryArticleType,
    _slug: string,
  ): ArticleRouteEntry | null;
  getPublicArticle(_type: RegistryArticleType, _slug: string): ArticleLike | null;
};

type RegistryBuildOptions = {
  isRedirectSource?: (_path: string) => boolean;
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.normalize("NFKC").trim() : "";
}

function articlePath(type: RegistryArticleType, slug: string): string {
  return `${type === "GUIDE" ? "/guide" : "/column"}/${slug}`;
}

function routeKey(type: RegistryArticleType, slug: string): string {
  return `${type}:${slug}`;
}

function isGuide(article: ArticleLike): article is GuideItem {
  return article.type === "GUIDE";
}

function isColumn(article: ArticleLike): article is ColumnItem {
  return article.type === "COLUMN";
}

function makeIssue(
  source: ArticleRegistrySource,
  code: ArticleRegistryIssueCode,
  message: string,
): ArticleRegistryIssue {
  return {
    code,
    message,
    sourceId: source.sourceId,
    expectedType: source.expectedType,
    slug: cleanString(source.contractInput.slug),
  };
}

/**
 * Pure registry builder used by runtime loading and focused tests. Duplicate or
 * invalid entries are retained in diagnostics but can never enter a route Map.
 */
export function createArticleRegistry(
  sources: readonly ArticleRegistrySource[],
  options: RegistryBuildOptions = {},
): ArticleRegistry {
  const duplicateSlugs = new Set(
    findDuplicatePublicationSlugs(sources.map((source) => source.contractInput)).map(
      (duplicate) => duplicate.slug,
    ),
  );

  const publicArticles: ArticleLike[] = [];
  const previewArticles: ArticleLike[] = [];
  const privateArticles: ArticleLike[] = [];
  const redirectArticles: ArticleLike[] = [];
  const rejectedArticles: RejectedArticleRegistryEntry[] = [];
  const issues: ArticleRegistryIssue[] = [];
  const publicRoutes = new Map<string, ArticleRouteEntry>();

  for (const source of sources) {
    const contract = evaluatePublicationContract(source.contractInput);
    const localIssues = contract.issues.map((issue) =>
      makeIssue(source, issue.code, issue.message),
    );
    const slug = contract.slug;

    if (contract.articleType && contract.articleType !== source.expectedType) {
      localIssues.push(
        makeIssue(
          source,
          "type-directory-mismatch",
          `article type ${contract.articleType} does not match ${source.expectedType} directory`,
        ),
      );
    }

    if (slug && duplicateSlugs.has(slug)) {
      localIssues.push(
        makeIssue(source, "duplicate-slug", `slug is duplicated across article records: ${slug}`),
      );
    }

    if (!source.article) {
      localIssues.push(
        makeIssue(source, "missing-normalized-article", "repository did not produce this source record"),
      );
    } else {
      const article = source.article;
      if (article.type !== source.expectedType) {
        localIssues.push(
          makeIssue(
            source,
            "normalized-type-mismatch",
            `normalized article type ${article.type} does not match ${source.expectedType}`,
          ),
        );
      }

      if (contract.disposition !== "rejected") {
        const normalizedContract = evaluatePublicationContract(article);
        for (const issue of normalizedContract.issues) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-publication-invalid",
              `normalized article failed ${issue.code}: ${issue.message}`,
            ),
          );
        }

        if (cleanString(article.slug) !== contract.slug) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-slug-mismatch",
              `normalized slug ${cleanString(article.slug) || "(empty)"} does not match raw slug ${contract.slug}`,
            ),
          );
        }
        if (article.type !== contract.articleType) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-type-mismatch",
              `normalized type ${article.type} does not match raw type ${contract.articleType}`,
            ),
          );
        }
        if (article.status !== contract.status) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-status-mismatch",
              `normalized status ${article.status} does not match raw status ${contract.status}`,
            ),
          );
        }
        if (article.publicState !== contract.publicState) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-public-state-mismatch",
              `normalized publicState ${article.publicState} does not match raw publicState ${contract.publicState}`,
            ),
          );
        }
        if (article.noindex !== contract.noindex) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-noindex-mismatch",
              `normalized noindex ${String(article.noindex)} does not match raw noindex ${String(contract.noindex)}`,
            ),
          );
        }
        if (
          normalizedContract.disposition !== "rejected" &&
          normalizedContract.disposition !== contract.disposition
        ) {
          localIssues.push(
            makeIssue(
              source,
              "normalized-disposition-mismatch",
              `normalized disposition ${normalizedContract.disposition} does not match raw disposition ${contract.disposition}`,
            ),
          );
        }
      }
    }

    const path = slug ? articlePath(source.expectedType, slug) : "";
    const redirectSourceExists = path ? options.isRedirectSource?.(path) === true : false;
    if (path && contract.disposition === "redirect" && !redirectSourceExists) {
      localIssues.push(
        makeIssue(
          source,
          "missing-redirect-ledger",
          `redirect article requires a matching redirect source: ${path}`,
        ),
      );
    } else if (
      path &&
      redirectSourceExists &&
      (contract.disposition === "public" || contract.disposition === "preview")
    ) {
      localIssues.push(
        makeIssue(source, "redirect-source-path", `redirect source cannot also render an article: ${path}`),
      );
    }

    if (localIssues.length > 0 || !source.article) {
      issues.push(...localIssues);
      rejectedArticles.push({
        sourceId: source.sourceId,
        article: source.article ?? null,
        disposition: "rejected",
        issues: localIssues,
      });
      continue;
    }

    const article = source.article;
    const entry = {
      article,
      type: source.expectedType,
      slug,
      path,
    };

    if (contract.disposition === "public") {
      publicArticles.push(article);
      publicRoutes.set(routeKey(source.expectedType, slug), {
        ...entry,
        visibility: "public",
      });
      continue;
    }

    if (contract.disposition === "preview") {
      previewArticles.push(article);
      continue;
    }

    if (contract.disposition === "private") {
      privateArticles.push(article);
      continue;
    }

    if (contract.disposition === "redirect") {
      redirectArticles.push(article);
      continue;
    }

    // `rejected` always has at least one contract issue and is handled above.
    continue;
  }

  const getRouteEntry: ArticleRegistry["getRouteEntry"] = (
    type,
    rawSlug,
  ) => {
    const slug = cleanString(rawSlug);
    if (!slug) return null;
    const key = routeKey(type, slug);
    return publicRoutes.get(key) ?? null;
  };

  return {
    publicArticles,
    previewArticles,
    privateArticles,
    redirectArticles,
    publicGuides: publicArticles.filter(isGuide),
    previewGuides: previewArticles.filter(isGuide),
    publicColumns: publicArticles.filter(isColumn),
    previewColumns: previewArticles.filter(isColumn),
    rejectedArticles,
    issues,
    hasErrors: issues.length > 0,
    getRouteEntry,
    getPublicArticle(type, slug) {
      return getRouteEntry(type, slug)?.article ?? null;
    },
  };
}

/** Throws with actionable diagnostics before any public consumer can use a partial Registry. */
export function assertArticleRegistryValid(
  registry: ArticleRegistry,
  context = "article-registry",
): ArticleRegistry {
  if (!registry.hasErrors) return registry;
  const details = registry.issues
    .slice(0, 50)
    .map((issue) => `${issue.sourceId} [${issue.code}] ${issue.message}`)
    .join("\n");
  const remainder = registry.issues.length > 50
    ? `\n... and ${registry.issues.length - 50} more issue(s)`
    : "";
  throw new Error(`[${context}] rejected ${registry.issues.length} publication issue(s)\n${details}${remainder}`);
}

function flattenRawRecords(values: readonly unknown[], collectionKey: "guides" | "columns") {
  const records: PublicationContractInput[] = [];
  const toContractInput = (value: unknown): PublicationContractInput =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as PublicationContractInput)
      : {};

  for (const value of values) {
    if (Array.isArray(value)) {
      for (const entry of value) records.push(toContractInput(entry));
      continue;
    }

    if (!value || typeof value !== "object") {
      records.push({});
      continue;
    }
    const record = value as Record<string, unknown>;
    const collection = record[collectionKey];
    if (Array.isArray(collection)) {
      for (const entry of collection) records.push(toContractInput(entry));
      continue;
    }
    records.push(record as PublicationContractInput);
  }
  return records;
}

function buildRuntimeSources(): ArticleRegistrySource[] {
  const guides = findAllGuides();
  const columns = findAllColumns();
  const guidesBySlug = new Map(guides.map((article) => [article.slug, article] as const));
  const columnsBySlug = new Map(columns.map((article) => [article.slug, article] as const));
  const rawGuides = flattenRawRecords(readGuidesJsonDir<unknown>(), "guides");
  const rawColumns = flattenRawRecords(readColumnsJsonDir<unknown>(), "columns");

  return [
    ...rawGuides.map((contractInput, index): ArticleRegistrySource => ({
      sourceId: `guides:${index + 1}`,
      expectedType: "GUIDE",
      contractInput,
      article: guidesBySlug.get(cleanString(contractInput.slug)) ?? null,
    })),
    ...rawColumns.map((contractInput, index): ArticleRegistrySource => ({
      sourceId: `columns:${index + 1}`,
      expectedType: "COLUMN",
      contractInput,
      article: columnsBySlug.get(cleanString(contractInput.slug)) ?? null,
    })),
  ];
}

let runtimeRegistry: ArticleRegistry | null = null;

/** The sole runtime registry consumed by lists, search, related content and routes. */
export function getArticleRegistry(): ArticleRegistry {
  if (!runtimeRegistry) {
    runtimeRegistry = assertArticleRegistryValid(
      createArticleRegistry(buildRuntimeSources(), {
        isRedirectSource: isRedirectSourcePath,
      }),
      "runtime-article-registry",
    );
  }
  return runtimeRegistry;
}

export function getArticleForRoute(
  type: RegistryArticleType,
  slug: string,
): ArticleLike | null {
  return getArticleRegistry().getRouteEntry(type, slug)?.article ?? null;
}

export function getArticleRouteDisposition(
  type: RegistryArticleType,
  slug: string,
): Extract<PublicationDisposition, "public"> | null {
  return getArticleRegistry().getRouteEntry(type, slug)?.visibility ?? null;
}

export function __resetArticleRegistryForTest(): void {
  runtimeRegistry = null;
}
