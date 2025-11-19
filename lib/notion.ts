// lib/notion.ts
import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseIdCache: Record<string, string> = {};

export async function getDatabaseIdByTitle(title: string): Promise<string> {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN is not set");
  }

  if (databaseIdCache[title]) {
    return databaseIdCache[title];
  }

  const response = await notion.search({
    query: title,
    filter: {
      property: "object",
      value: "database",
    },
  });

  const db = (response.results as any[]).find((result) => {
    if (result.object !== "database") return false;
    const dbTitle =
      result.title?.[0]?.plain_text ??
      result.title?.[0]?.text?.content ??
      "";
    return dbTitle.toLowerCase() === title.toLowerCase();
  });

  if (!db) {
    throw new Error(`Database with title "${title}" not found`);
  }

  const id = (db as any).id.replace(/-/g, "");
  databaseIdCache[title] = id;
  return id;
}
