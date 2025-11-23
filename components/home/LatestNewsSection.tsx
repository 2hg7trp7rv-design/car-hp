// components/home/LatestNewsSection.tsx
import Link from "next/link";
import { NewsCard } from "./NewsCard";
import { Button } from "@/components/ui/button";

const mockNews = [
  {
    title: "カブとホーネットでVR体験 ホンダ、メタバース最大級イベントに初参加",
    publishedAt: "2025-11-23T09:00:03.000Z",
    sourceUrl: "#",
    sourceName: "CAR WATCH",
    summary:
      "ホンダがメタバースイベントに初出展。人気モデルのVR体験を提供し、新しい顧客層へのアプローチを図る。",
  },
  {
    title:
      "ヤマハのEVスクーター「JOG E」が約16万円で登場 原付市場にEVの波",
    publishedAt: "2025-11-23T08:00:03.000Z",
    sourceUrl: "#",
    sourceName: "モーサイ",
    summary:
      "ヤマハが新型EVスクーターを発表。低価格と経済性を武器に、都市部のコミューター需要を狙う戦略的モデル。",
  },
  {
    title: "愛車との豊かな時間を紡ぐ、新しい場所へようこそ",
    publishedAt: "2025-11-20T12:00:00.000Z",
    sourceUrl: "#",
    sourceName: "CAR BOUTIQUE",
    summary:
      "CAR BOUTIQUEがオープンしました。静かで上質な空間で、オーナー目線の深いコンテンツをお届けします。",
  },
];

export function LatestNewsSection() {
  return (
    <section className="relative z-10 px-4 md:px-8 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex items-center">
          <span className="mr-4 inline-block h-[2px] w-8 bg-tiffany-400" />
          <h2 className="serif-font text-3xl font-bold tracking-wider text-foreground">
            LATEST NEWS
          </h2>
        </div>

        <div className="space-y-6">
          {mockNews.map((news, index) => (
            <NewsCard key={index} {...news} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/news">VIEW ALL NEWS</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
