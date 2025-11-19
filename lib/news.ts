// lib/news.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  url: string | null;
  source: string | null;
  publishedAt: string | null;
  summary: string | null;
  difficulty: "basic" | "advanced" | null;
};

export async function getLatestNews(limit = 10): Promise<NewsItem[]> {
  const databaseId = await getDatabaseIdByTitle("news");

  // created_time で必ずソートできるようにする
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        timestamp: "created_time",
        direction: "descending",
      },
    ],
    page_size: limit,
  });

  return response.results.map((page: any) => {
    const props = page.properties;

    const titleProp = props["名前"];
    const title =
      titleProp?.title?.[0]?.plain_text ??
      titleProp?.title?.[0]?.text?.content ??
      "No title";

    const slugProp = props["slug"];
    const slug =
      slugProp?.rich_text?.[0]?.plain_text ??
      slugProp?.rich_text?.[0]?.text?.content ??
      page.id;

    const urlProp = props["url"];
    const url = urlProp?.url ?? null;

    const sourceProp = props["source"];
    const source =
      sourceProp?.rich_text?.[0]?.plain_text ??
      sourceProp?.rich_text?.[0]?.text?.content ??
      null;

    const dateProp = props["日付"] ?? props["published_at"];
    const publishedAt =
      dateProp?.date?.start ?? (page as any).created_time ?? null;

    const summaryProp = props["summary"];
    const summary =
      summaryProp?.rich_text?.[0]?.plain_text ??
      summaryProp?.rich_text?.[0]?.text?.content ??
      null;

    const difficultyProp = props["difficulty"];
    const difficulty =
      (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

    return {
      id: page.id,
      title,
      slug,
      url,
      source,
      publishedAt,
      summary,
      difficulty,
    };
  });
}
