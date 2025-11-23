import Link from 'next/link';
import { Newspaper, BookOpen, Compass, CarFront, LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
}

function CategoryCard({ title, description, href, icon: Icon }: CategoryCardProps) {
  return (
    <Link href={href} className="block group">
      <div 
        className="
          bg-white/80 backdrop-blur-sm rounded-3xl p-8 h-full
          border border-tiffany-100
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          hover:shadow-soft hover:-translate-y-1 hover:bg-white
          transition-all duration-300 ease-out
          flex flex-col
        "
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-tiffany-700 transition-colors font-serif">
            {title}
          </h3>
          {Icon && (
            <Icon className="w-6 h-6 text-tiffany-400 group-hover:text-tiffany-500 transition-colors" />
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed flex-grow font-light">
          {description}
        </p>
        <div className="mt-6 flex justify-end">
           <span className="text-sm text-tiffany-600 font-medium group-hover:underline underline-offset-4 decoration-tiffany-300">
             Explore <span aria-hidden="true">→</span>
           </span>
        </div>
      </div>
    </Link>
  );
}

const categories = [
  {
    title: 'NEWS',
    description: '国内外の主要メディアから集めたトピックを、見出しの一覧でさっと追えるように。',
    href: '/news',
    icon: Newspaper,
  },
  {
    title: 'COLUMN',
    description: 'オーナー目線の本音や、修理体験、技術の話をじっくり読むための場所。',
    href: '/column',
    icon: BookOpen,
  },
  {
    title: 'GUIDE',
    description: '買い方、売り方、維持費や保険など、暮らしに近い視点で車と向き合うための実用ガイド。',
    href: '/guide',
    icon: Compass,
  },
  {
    title: 'CARS',
    description: 'スペックや長所短所、トラブル傾向を一つのページにまとめた車種データの入り口。',
    href: '/cars',
    icon: CarFront,
  },
];

export function CategorySection() {
  return (
    <section className="py-24 px-4 md:px-8 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {categories.map((category) => (
          <CategoryCard
            key={category.title}
            {...category}
          />
        ))}
      </div>
    </section>
  );
}
