// lib/notion.ts
import { Client } from "@notionhq/client";

function getDatabaseIdFromUrl(url?: string): string {
  if (!url) {
    throw new Error("Database URL is not set");
  }
  const match = url.match(/([0-9a-f]{32})/i);
  if (!match) {
    throw new Error("Could not find database id in URL");
  }
  return match[1].replace(/-/g, "");
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const carsDatabaseId = getDatabaseIdFromUrl(
  process.env.NOTION_CARS_DB_URL,
);

export const newsDatabaseId = getDatabaseIdFromUrl(
  process.env.NOTION_NEWS_DB_URL,
);
