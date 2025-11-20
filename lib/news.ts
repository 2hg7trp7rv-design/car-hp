// lib/news.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type NewsItem = {
  id: string;
  title: string;
  summary: string | null;
  source: string | null;
  publishedAt: string | null;
  difficulty: "basic" | "advanced" | null;
  url: string | null;
};

export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  const databaseId = await getDatabaseIdByTitle("news");

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "published_at", // Notionの日付プロパティ名
        direction: "descending",
      },
    ],
    page_size: limit,
  });

  return response.results.map((page: any) => {
    const props = page.properties;

    const titleProp = props["タイトル"];
    const title =
      titleProp?.title?.[0]?.plain_text ??
      titleProp?.title?.[0]?.text?.content ??
      "No title";

    const summaryProp = props["summary"];
    const summary =
      summaryProp?.rich_text?.[0]?.plain_text ??
      summaryProp?.rich_text?.[0]?.text?.content ??
      null;

    const sourceProp = props["source"];
    const source =
      sourceProp?.rich_text?.[0]?.plain_text ??
      sourceProp?.rich_text?.[0]?.text?.content ??
      null;

    const dateProp = props["published_at"];
    const publishedAt = dateProp?.date?.start ?? null;

    const difficultyProp = props["difficulty"];
    const difficulty =
      (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

    const urlProp = props["reference_url"];
    const url = urlProp?.url ?? null;

    return {
      id: page.id,
      title,
      summary,
      source,
      publishedAt,
      difficulty,
      url,
    };
  });
}
