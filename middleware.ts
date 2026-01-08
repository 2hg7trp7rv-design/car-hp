import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * URL 正規化ミドルウェア
 *
 * 目的:
 * - https へ統一（評価分散を避ける）
 * - www あり/なしを統一（両方生きている場合の重複回避）
 * - 末尾スラッシュを統一（/cars と /cars/ の重複回避）
 */
export function middleware(req: NextRequest) {
  const header = req.headers.get("x-forwarded-proto") ?? "";
  const proto = header.split(",")[0].trim() || req.nextUrl.protocol.replace(":", "");

  const url = req.nextUrl.clone();
  let changed = false;

  // 1) http → https
  if (proto && proto !== "https") {
    url.protocol = "https:";
    changed = true;
  }

  // 2) www → non-www（ドメイン統一）
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.replace(/^www\./, "");
    changed = true;
  }

  // 3) 末尾スラッシュ除去（ルートは除く）
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    changed = true;
  }

  if (changed) {
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

// 静的アセットや Next 内部は対象外。
// ただし sitemap/robots など「拡張子付きURL」は matcher から漏れやすいので個別に対象に含める。
export const config = {
  matcher: [
    "/sitemap.xml",
    "/robots.txt",
    "/sitemaps/:path*",
    "/((?!_next|api|.*\\..*).*)",
  ],
};
