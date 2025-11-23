import { CategoryCard } from './CategoryCard';
import { Newspaper, BookOpen, Compass, CarFront } from 'lucide-react';

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
            title={category.title}
            description={category.description}
            href={category.href}
            icon={category.icon}
            // variant propは削除
          />
        ))}
      </div>
    </section>
  );
}
