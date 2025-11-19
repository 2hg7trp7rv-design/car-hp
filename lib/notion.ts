// lib/notion.ts
import { Client } from "@notionhq/client";

const notionToken = process.env.NOTION_TOKEN;

if (!notionToken) {
  throw new Error("NOTION_TOKEN is not set");
}

export const notion = new Client({
  auth: notionToken,
});

export async function getDatabaseIdByTitle(title: string): Promise<string> {
  const search = await notion.search({
    query: title,
    filter: {
      property: "object",
      value: "database",
    },
    sort: {
      direction: "descending",
      timestamp: "last_edited_time",
    },
  });

  const db = search.results.find((r: any) => {
    if (r.object !== "database") return false;
    const dbTitle = r.title?.[0]?.plain_text ?? r.title?.[0]?.text?.content;
    return dbTitle === title;
  });

  if (!db) {
    throw new Error(`Database with title "${title}" not found`);
  }

  return (db as any).id;
}
