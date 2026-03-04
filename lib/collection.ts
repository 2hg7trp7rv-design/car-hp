export type CollectionItem = {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  excerpt: string;
};

export const collectionItems: CollectionItem[] = [
  {
    slug: "fragment-trace",
    title: "説明しない美学",
    subtitle: "計算された無造作の場所",
    image: "/demo/fragment-1.jpg",
    tags: ["痕跡", "空気"],
    excerpt: "断片は、説明の代わりに温度を残す。"
  },
  {
    slug: "hazy-room",
    title: "雰囲気の解像度",
    subtitle: "The Room of Context",
    image: "/demo/fragment-3.jpg",
    tags: ["霧", "距離"],
    excerpt: "輪郭は残して、意味は少しだけ遅れてくる。"
  },
  {
    slug: "mechanical-silence",
    title: "沈黙する機械",
    subtitle: "Gauge Cluster Study",
    image: "/demo/fragment-2.jpg",
    tags: ["計器", "静けさ"],
    excerpt: "数字は雄弁だが、語らない。"
  }
];
