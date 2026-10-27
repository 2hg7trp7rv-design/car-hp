export const SITE = {
  name: "クルマのいろは",
  tagline: "はじめての人の、クルマ入門。",
  description:
    "はじめてクルマに乗る人のための入門サイト。シュナと莉奈の会話と図解で、給油・運転・お手入れ・お金のことを、いろはからやさしく説明します。",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://carboutiquejournal.com").replace(/\/$/, ""),
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
