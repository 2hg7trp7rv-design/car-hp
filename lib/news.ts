// lib/news.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
  difficulty: string;
  reference_url: string;
  category: string;
  maker: string;
  model_name: string;
  tags: string[];
  isFeatured: boolean; 
};

const NEWS_DB_TITLE = "news";

async function getNewsDatabaseId(): Promise<string> {
  return getDatabaseIdByTitle(NEWS_DB_TITLE);
}

function mapPageToNewsItem(page: any): NewsItem {
  const props = page.properties;

  const titleProp = props["title"];
  const title =
    titleProp?.title?.[0]?.plain_text ??
    titleProp?.title?.[0]?.text?.content ??
    "No title";

  const summaryProp = props["summary"];
  const summary =
    summaryProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const sourceProp = props["source"];
  const source =
    sourceProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const dateProp = props["published_at"];
  const publishedAt = dateProp?.date?.start ?? null;

  const difficultyProp = props["difficulty"];
  const difficulty = difficultyProp?.select?.name ?? null;

  const referenceUrlProp = props["reference_url"];
  const referenceUrl = referenceUrlProp?.url ?? null;

  const categoryProp = props["category"];
  const category = categoryProp?.select?.name ?? null;

  const makerProp = props["maker"];
  const maker =
    makerProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const modelNameProp = props["model_name"];
  const modelName =
    modelNameProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const tagsProp = props["tags"];
  const tags =
    tagsProp?.multi_select?.map((t: any) => t.name as string) ?? [];

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

export async function getLatestNews(limit = 50): Promise<NewsItem[]> {
  const databaseId = await getNewsDatabaseId();

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "published_at",
        direction: "descending",
      },
    ],
    page_size: limit,
  });

  return response.results.map(mapPageToNewsItem);
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    return mapPageToNewsItem(page);
  } catch (e) {
    return null;
  }
}

export async function getNewsByCar(
  maker: string | null,
  modelName: string | null,
  limit = 10,
): Promise<NewsItem[]> {
  if (!maker && !modelName) {
    return [];
  }

  const databaseId = await getNewsDatabaseId();

  const filters: any[] = [];
  if (maker) {
    filters.push({
      property: "maker",
      rich_text: { contains: maker },
    });
  }
  if (modelName) {
    filters.push({
      property: "model_name",
      rich_text: { contains: modelName },
    });
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: filters,
    },
    sorts: [
      {
        property: "published_at",
        direction: "descending",
      },
    ],
    page_size: limit,
  });

  return response.results.map(mapPageToNewsItem);
}
