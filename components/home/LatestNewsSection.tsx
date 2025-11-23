import Link from 'next/link';
import { NewsCard } from './NewsCard';
import { Button } from '../ui/button';

// 仮のデータ（実際はfetchングしたデータを使用）
const mockNews = [
  {
    title: 'カブとホーネットでVR体験！ ホンダ、メタバース最大級イベント「Vket」に初参加',
    publishedAt: '2025-11-23T09:00:03.000Z',
    sourceUrl: '#',
    sourceName: 'CAR WATCH',
    summary: 'ホンダがメタバースイベント「バーチャルマーケット」に初出展。人気モデルのVR体験を提供し、新しい顧客層へのアプローチを図る。',
  },
  {
    title: 'ヤマハのEVスクーター『JOG E』が約16万円で登場！ 「手軽さ」と「維持費」で原付二種市場に挑む',
    publishedAt: '2025-11-23T08:00:03.000Z',
    sourceUrl: '#',
    sourceName: 'モーサイ',
    summary: 'ヤマハが新型EVスクーターを発表。低価格と経済性を売りに、都市部のコミューター需要を狙う戦略的モデル。',
  },
    {
    title: '愛車との豊かな時間を紡ぐ、新しい場所へようこそ',
    publishedAt: '2025-11-20T12:00:00.000Z',
    sourceUrl: '#',
    sourceName: 'CAR BOUTIQUE',
    summary: 'CAR BOUTIQUEがオープンしました。洗練されたデザインと、オーナー目線の深いコンテンツをお届けします。',
  },
];

export function LatestNewsSection() {
  return (
    <section className="py-24 px-4 md:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-12">
            <span className="inline-block w-8 h-[2px] bg-tiffany-400 mr-4"></span>
            <h2 className="text-3xl font-bold tracking-wider text-foreground serif-font">
            LATEST NEWS
            </h2>
        </div>

        <div className="space-y-6">
          {mockNews.map((news, index) => (
            <NewsCard key={index} {...news} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="
                rounded-full border-2 border-tiffany-400 text-tiffany-600 
                hover:bg-tiffany-50 hover:text-tiffany-700 hover:border-tiffany-500
                shadow-[0_4px_14px_0_rgba(129,216,208,0.2)] hover:shadow-[0_6px_20px_rgba(129,216,208,0.3)]
                transition-all duration-300 px-10 py-6 text-lg font-medium tracking-widest
            "
          >
            <Link href="/news">
              VIEW ALL NEWS
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
