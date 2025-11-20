// lib/news.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type NewsItem = {
  id: string;
  title: string;
  summary: string | null;
  source: string | null;
  publishedAt: string | null;
  difficulty: "basic" | "advanced" | null;
  referenceUrl: string | null;
  category: string | null;
  maker: string | null;
  modelName: string | null;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
};

function getTitle(prop: any): string {
  const t = prop?.title?.[0];
  if (!t) return "No title";
  return t.plain_text ?? t.text?.content ?? "No title";
}

function getRichText(prop: any): string | null {
  if (!prop?.rich_text) return null;
  const text = prop.rich_text
    .map((t: any) => t.plain_text ?? t.text?.content ?? "")
    .join("");
  return text.length > 0 ? text : null;
}

function mapNewsPage(page: any): NewsItem {
  const props = page.properties ?? {};

  const titleProp = props["title"];
  const summaryProp = props["summary"];
  const sourceProp = props["source"];
  const publishedAtProp = props["published_at"];
  const difficultyProp = props["difficulty"];
  const referenceUrlProp = props["reference_url"];
  const categoryProp = props["category"];
  const makerProp = props["maker"];
  const modelNameProp = props["model_name"];
  const tagsProp = props["tags"];
  const isFeaturedProp = props["is_featured"];
  const viewCountProp = props["view_count"];

  const title = getTitle(titleProp);
  const summary = getRichText(summaryProp);
  const source = getRichText(sourceProp);

  const publishedAt =
    publishedAtProp?.date?.start ??
    publishedAtProp?.date?.end ??
    null;

  const difficulty =
    (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

  const referenceUrl = referenceUrlProp?.url ?? null;
  const category = categoryProp?.select?.name ?? null;
  const maker = getRichText(makerProp);
  const modelName = getRichText(modelNameProp);

  const tags =
    tagsProp?.multi_select?.map((t: any) => t.name).filter(Boolean) ?? [];

  const isFeatured = isFeaturedProp?.checkbox ?? false;
  const viewCount = viewCountProp?.number ?? 0;

  return {
    id: page.id,
    title,
    summary,
    source,
    publishedAt,
    difficulty,
    referenceUrl,
    category,
    maker,
    modelName,
    tags,
    isFeatured,
    viewCount,
  };
}

export async function getLatestNews(limit = 30): Promise<NewsItem[]> {
  const databaseId = await getDatabaseIdByTitle("news");

  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: limit,
    sorts: [
      {
        property: "published_at",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page: any) => mapNewsPage(page));
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const page = await notion.pages.retrieve({ page_id: id });

  // safety guard
  if (!("properties" in page)) {
    return null;
  }

  return mapNewsPage(page as any);
}
