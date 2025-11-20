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
};

export async function getLatestNews(limit = 20): Promise<NewsItem[]> {
  const databaseId = await getDatabaseIdByTitle("news");

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

  return response.results.map((page: any) => {
    const props = page.properties;

    const titleProp = props["title"];
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

    const publishedProp = props["published_at"];
    let publishedAt: string | null = null;
    if (publishedProp?.date?.start) {
      publishedAt = publishedProp.date.start;
    }

    const difficultyProp = props["difficulty"];
    const difficulty =
      (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

    const refProp = props["reference_url"];
    const referenceUrl =
      refProp?.url ??
      (refProp?.rich_text?.[0]?.plain_text ??
        refProp?.rich_text?.[0]?.text?.content ??
        null);

    return {
      id: page.id,
      title,
      summary,
      source,
      publishedAt,
      difficulty,
      referenceUrl,
    };
  });
}
