import Link from 'next/link';
import { Button } from '../ui/button';

// --- 日付処理用ユーティリティ（ライブラリ依存なし） ---
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'たった今';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  return `${Math.floor(diffInSeconds / 86400)}日前`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
// ---------------------------------------------------

interface NewsCardProps {
  title: string;
  publishedAt: string;
  sourceUrl: string;
  sourceName?: string;
  summary?: string;
}

function NewsCard({ title, publishedAt, sourceUrl, sourceName, summary }: NewsCardProps) {
  const timeAgo = formatTimeAgo(publishedAt);
  const dateStr = formatDate(publishedAt);

  return (
    <article 
      className="
        bg-white/80 backdrop-blur-sm rounded-2xl p-6
        border border-tiffany-100
        shadow-[0_4px_20px_rgb(0,0,0,0.03)]
        hover:shadow-soft hover:bg-white hover:-translate-y-0.5
        transition-all duration-300 ease-out
      "
    >
      <Link href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="flex items-center justify-between mb-3 text-sm">
            {sourceName && (
                 <span className="px-2 py-0.5 bg-tiffany-50 text-tiffany-700 rounded-full font-medium text-xs tracking-wider">
                     {sourceName}
                 </span>
            )}
            <div className="flex gap-2 text-muted-foreground/80 font-light tabular-nums">
              <time dateTime={publishedAt}>{dateStr}</time>
              <span className="text-tiffany-400">({timeAgo})</span>
            </div>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-foreground leading-snug group-hover:text-tiffany-800 transition-colors mb-2 font-serif">
          {title}
        </h3>
        {summary && (
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-light">
                {summary}
            </p>
        )}
        <div className="mt-4 text-right">
          <span className="text-sm text-tiffany-600 font-medium group-hover:underline underline-offset-4 decoration-tiffany-300">
            元記事を読む <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

// データ取得ロジックが未実装のため、仮データを表示しています
const mockNews = [
  {
    title: 'カブとホーネットでVR体験！ ホンダ、メタバース最大級イベント「Vket」に初参加',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
    sourceUrl: '#',
    sourceName: 'CAR WATCH',
    summary: 'ホンダがメタバースイベント「バーチャルマーケット」に初出展。人気モデルのVR体験を提供し、新しい顧客層へのアプローチを図る。',
  },
  {
    title: 'ヤマハのEVスクーター『JOG E』が約16万円で登場！',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
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
            <h2 className="text-3xl font-bold tracking-wider text-foreground font-serif">
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
