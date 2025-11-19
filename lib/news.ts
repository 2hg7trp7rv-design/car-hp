// lib/news.ts
import { notion, newsDatabaseId } from "./notion";

export type NewsItem = {
  id: string;
  title: string;
  source: string | null;
  url: string | null;
  publishedAt: string | null;
  summary: string | null;
  difficulty: "basic" | "advanced" | null;
};

export async function getLatestNews(limit = 5): Promise<NewsItem[]> {
  const response = await notion.databases.query({
    database_id: newsDatabaseId,
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

    // タイトル列: news DBで「title」にリネームしている想定
    // 念のため「名前」もフォールバック
    const titleProp = props["title"] ?? props["名前"];
    const title =
      titleProp?.title?.[0]?.plain_text ??
      titleProp?.title?.[0]?.text?.content ??
      "No title";

    // source: テキストプロパティ想定
    const sourceProp = props["source"];
    const source =
      sourceProp?.rich_text?.[0]?.plain_text ??
      sourceProp?.rich_text?.[0]?.text?.content ??
      null;

    // url: URLプロパティ
    const urlProp = props["url"];
    const url = urlProp?.url ?? null;

    // published_at: 日付プロパティ
    const dateProp = props["published_at"];
    const publishedAt = dateProp?.date?.start ?? null;

    // summary: テキスト（リッチテキスト）プロパティ
    const summaryProp = props["summary"];
    const summary =
      summaryProp?.rich_text?.[0]?.plain_text ??
      summaryProp?.rich_text?.[0]?.text?.content ??
      null;

    // difficulty: セレクト basic / advanced
    const difficultyProp = props["difficulty"];
    const difficulty =
      (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

    return {
      id: page.id,
      title,
      source,
      url,
      publishedAt,
      summary,
      difficulty,
    };
  });
}
