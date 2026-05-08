// lib/site.ts
export function getSiteUrl(): string {
  // Prefer explicit env, fallback to production domain, then localhost for dev
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  // 末尾のスラッシュ揺れを吸収（/ が複数付いていても除去）
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "https://carboutiquejournal.com";
}

export function getSiteOrigin(): URL {
  return new URL(getSiteUrl());
}
