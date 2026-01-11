import { NextRequest } from "next/server";

export const revalidate = 60 * 60; // 1h

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  // 拡張子付きが 4xx になる環境向けに、拡張子なしへ寄せる。
  // SEO 的にも /sitemap を正とする。
  return Response.redirect(new URL("/sitemap", url.origin).toString(), 301);
}
