// app/api/news-preview/route.ts
import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/news";

export const revalidate = 600; // 10分キャッシュ（lib/news.tsと同じ周期）

export async function GET() {
  try {
    const items = await getLatestNews(20);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("news-preview error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
