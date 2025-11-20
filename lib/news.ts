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
};

function mapPageToNewsItem(page: any): NewsItem {
  const props = page.properties;

  const titleProp = props["title"];
  const title =
    titleProp?.title?.[0]?.plain_text ??
    titleProp?.title?.[0]?.text?.content ??
    "No title";

  const summaryProp = props["summary"];
  const summary =
    summaryProp?.rich_text?.map((t: any) => t.plain_text).join("") || null;

  const sourceProp = props["source"];
  const source =
    sourceProp?.rich_text?.map((t: any) => t.plain_text).join("") || null;

  const publishedProp = props["published_at"];
  let publishedAt: string | null = null;
  if (publishedProp?.date?.start) {
    publishedAt = publishedProp.date.start;
  }

  const difficultyProp = props["difficulty"];
  const difficulty =
    (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

  const referenceProp = props["reference_url"];
  const referenceUrl = referenceProp?.url ?? null;

  const categoryProp = props["category"];
  const category = categoryProp?.select?.name ?? null;

  const makerProp = props["maker"];
  const maker =
    makerProp?.rich_text?.map((t: any) => t.plain_text).join("") || null;

  const modelNameProp = props["model_name"];
  const modelName =
    modelNameProp?.rich_text?.map((t: any) => t.plain_text).join("") || null;

  const tagsProp = props["tags"];
  const tags =
    tagsProp?.multi_select?.map((tag: any) => tag.name as string) ?? [];

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

  return response.results.map(mapPageToNewsItem);
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const page = await notion.pages.retrieve({
      page_id: id as string,
    });

    return mapPageToNewsItem(page as any);
  } catch (error) {
    console.error("getNewsById error", error);
    return null;
  }
}

export async function getAllNewsIds(): Promise<string[]> {
  const databaseId = await getDatabaseIdByTitle("news");

  const ids: string[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    response.results.forEach((page: any) => {
      ids.push(page.id);
    });

    if (!response.has_more || !response.next_cursor) {
      break;
    }
    cursor = response.next_cursor;
  }

  return ids;
}
