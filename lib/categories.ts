export const CATEGORIES = [
  { slug: "first-drive", name: "はじめての運転", description: "給油、駐車、高速道路。はじめての「どうするの？」に答えます。", color: "sky" },
  { slug: "basics", name: "クルマのきほん", description: "メーターの見方や各部の名前など、知っておきたい基本。", color: "sun" },
  { slug: "care", name: "お手入れ・点検", description: "洗車、タイヤ、オイル。自分でできることと、お店に頼むこと。", color: "mint" },
  { slug: "money", name: "お金と手続き", description: "維持費、車検、保険。クルマを持つと、何にいくらかかるか。", color: "coral" },
  { slug: "trouble", name: "もしものとき", description: "警告灯、パンク、事故。あわてないための準備と手順。", color: "grape" },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategorySlug = Category["slug"];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
