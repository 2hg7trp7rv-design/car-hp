import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * http → https へ統一する。
 *
 * Search Console で http 版がインデックスされると評価が分散しやすいので、
 * 可能な限り 301/308 で https に寄せる。
 *
 * - Vercel などではプラットフォーム側で自動リダイレクトが入ることもあるが、
 *   Cloudflare 等の構成では残ることがあるため明示しておく。
 */
export function middleware(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto && proto !== "https") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// 静的アセットや Next 内部は対象外
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
