// lib/news.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string | null;
  difficulty: "basic" | "advanced" | null;
  referenceUrl: string;
  category: string;
  maker: string;
  modelName: string;
  tags: string[];
  isFeatured: boolean;
};

const NEWS_DB_TITLE = "news";

async function getNewsDatabaseId(): Promise<string> {
  return getDatabaseIdByTitle(NEWS_DB_TITLE);
}

// 共通のテキスト取り出しヘルパー
function getPlainText(prop: any): string {
  if (!prop) return "";
  if (Array.isArray(prop)) {
    return prop.map((t: any) => t.plain_text ?? "").join("");
  }
  if (prop.rich_text) {
    return (prop.rich_text as any[])
      .map((t: any) => t.plain_text ?? "")
      .join("");
  }
  if (prop.title) {
    return (prop.title as any[])
      .map((t: any) => t.plain_text ?? "")
      .join("");
  }
  if (typeof prop === "string") return prop;
  return "";
}

function mapPageToNewsItem(page: any): NewsItem {
  const props = page.properties;

  // タイトル
  const titleProp = props["title"];
  const title =
    titleProp?.title?.[0]?.plain_text ??
    titleProp?.title?.[0]?.text?.content ??
    "No title";

  // slug（プロパティがなければタイトルから自動生成）
  const slugProp = props["slug"];
  const slugRaw = slugProp ? getPlainText(slugProp) : "";
  const slug =
    slugRaw ||
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  // 概要
  const summaryProp = props["summary"];
  const summary = getPlainText(summaryProp);

  // ソース
  const sourceProp = props["source"];
  const source = getPlainText(sourceProp);

  // 公開日
  const dateProp = props["published_at"];
  const publishedAt = dateProp?.date?.start ?? null;

  // 難易度
  const difficultyProp = props["difficulty"];
  const difficultyName = difficultyProp?.select?.name ?? null;
  const difficulty =
    difficultyName === "advanced" || difficultyName === "マニアック"
      ? "advanced"
      : difficultyName
      ? "basic"
      : null;

  // 参考URL
  const referenceUrlProp = props["reference_url"];
  const referenceUrl = referenceUrlProp?.url ?? "";

  // カテゴリ
  const categoryProp = props["category"];
  const category = categoryProp?.select?.name ?? "";

  // メーカー（テキストプロパティ想定）
  const makerProp = props["maker"];
  const maker = getPlainText(makerProp);

  // 車名（テキストプロパティ想定）
  const modelNameProp = props["model_name"];
  const modelName = getPlainText(modelNameProp);

  // タグ（マルチセレクト）
  const tagsProp = props["tags"];
  const tags =
    tagsProp?.multi_select?.map((t: any) => t.name as string) ?? [];

  // 注目記事フラグ（チェックボックス is_featured）
  const isFeaturedProp = props["is_featured"];
  const isFeatured = isFeaturedProp?.checkbox ?? false;

  return {
    id: page.id,
    slug,
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
  };
}

export async function getLatestNews(limit = 50): Promise<NewsItem[]> {
  const databaseId = await getNewsDatabaseId();

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        // Notion側のプロパティ名は published_at
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
