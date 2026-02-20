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
  // NOTE:
  // - x-forwarded-proto は環境によって値の形式/順序が揺れることがあります。
  // - 値の誤判定で「同じURLへリダイレクト」すると Google 側で redirect loop 扱いになり、
  //   Search Console の「リダイレクト エラー」になるケースがあります。
  // - そのため、実際の URL（req.nextUrl）とヘッダの両方を見つつ、
  //   “URLが本当に変わるときだけ” リダイレクトする方針に寄せます。

  const before = req.nextUrl.href;
  const url = req.nextUrl.clone();
  let changed = false;

  // 0) Vercel 既定ドメイン（*.vercel.app）→ 本番ドメインへ寄せる
  //
  // 意図:
  // - `car-hp.vercel.app` が生きていると、Google が 2つのホストを別サイトとして扱い、
  //   クロール/評価が分散しやすい。
  // - Vercel の Project Settings → Domains で「Redirect to」を設定するのが第一選択。
  //   ただ、設定漏れ/巻き戻りに備えてアプリ側でもガードする。
  const PRIMARY_HOST = "carboutiquejournal.com";
  if (url.hostname === "car-hp.vercel.app") {
    url.hostname = PRIMARY_HOST;
    changed = true;
  }

  const xfProto = (req.headers.get("x-forwarded-proto") ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const isHttps = url.protocol === "https:" || xfProto.includes("https");

  // 1) http → https
  // - すでに https と判定できる場合は何もしない
  // - https 以外のときだけ https へ寄せる
  if (!isHttps) {
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
    // “URLが変わっていないのに redirect を返す” のが一番危険。
    // 念のため、同一URLなら next() に倒す。
    if (url.href === before) return NextResponse.next();
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
