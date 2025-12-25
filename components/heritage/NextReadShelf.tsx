'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ShelfItem {
  type: 'CARS' | 'GUIDE' | 'COLUMN';
  title: string;
  slug: string;
  description: string;
  image?: string;
}

type NextReadShelfProps = {
  cars?: any[];
  guides?: any[];
  columns?: any[];
};

// 実際はPropsでitemsを受け取るか、内部でfetchする
export const NextReadShelf: React.FC<NextReadShelfProps> = ({ cars = [], guides = [], columns = [] }) => {
  const fallbackItems: ShelfItem[] = [
    {
      type: 'COLUMN',
      title: '当時の熱狂を振り返る',
      slug: 'column-era-background',
      description: 'なぜこの車は時代を超えて愛されるのか',
      image: '/images/shelf-column.jpg',
    },
    {
      type: 'CARS',
      title: 'モデル詳細図鑑',
      slug: 'car-model-detail',
      description: 'スペックと歴史的背景を確認する',
      image: '/images/shelf-car.jpg',
    },
    {
      type: 'GUIDE',
      title: '現代で所有するなら',
      slug: 'guide-ownership',
      description: '維持費・購入の注意点・相場',
      image: '/images/shelf-guide.jpg',
    },
  ];

  const providedItems: ShelfItem[] = [
    ...(Array.isArray(columns) ? columns : []).map((c: any) => ({
      type: 'COLUMN' as const,
      title: (c?.titleJa ?? c?.title ?? c?.name ?? '').toString() || 'COLUMN',
      slug: (c?.slug ?? '').toString(),
      description: (c?.excerpt ?? c?.description ?? '').toString(),
      image: c?.heroImage ?? c?.image ?? c?.thumbnail ?? c?.coverImage ?? undefined,
    })),
    ...(Array.isArray(cars) ? cars : []).map((c: any) => ({
      type: 'CARS' as const,
      title: (c?.nameJa ?? c?.name ?? c?.title ?? '').toString() || 'CARS',
      slug: (c?.slug ?? '').toString(),
      description: (c?.excerpt ?? c?.description ?? '').toString(),
      image: c?.heroImage ?? c?.image ?? c?.thumbnail ?? c?.coverImage ?? undefined,
    })),
    ...(Array.isArray(guides) ? guides : []).map((g: any) => ({
      type: 'GUIDE' as const,
      title: (g?.titleJa ?? g?.title ?? g?.name ?? '').toString() || 'GUIDE',
      slug: (g?.slug ?? '').toString(),
      description: (g?.excerpt ?? g?.description ?? '').toString(),
      image: g?.heroImage ?? g?.image ?? g?.thumbnail ?? g?.coverImage ?? undefined,
    })),
  ]
    .filter((x) => typeof x.slug === 'string' && x.slug.length > 0)
    .slice(0, 9);

  const items: ShelfItem[] = providedItems.length > 0 ? providedItems : fallbackItems;

  return (
    <section className="py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <h3 className="font-serif text-2xl text-white/90 mb-8 text-center flex items-center justify-center gap-4">
          <span className="h-[1px] w-8 bg-white/20"></span>
          Next Story
          <span className="h-[1px] w-8 bg-white/20"></span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <Link 
              key={idx} 
              href={`/${item.type.toLowerCase()}/${item.slug}`}
              className="group relative block aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-lg bg-white/5"
            >
              {/* 背景画像 */}
              <div className="absolute inset-0 bg-neutral-800">
                {item.image && (
                   <Image 
                     src={item.image} 
                     alt={item.title} 
                     fill 
                     className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-40" 
                   />
                )}
              </div>
              
              {/* コンテンツ */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <span className="text-xs font-bold tracking-widest text-blue-400 mb-2">
                  {item.type}
                </span>
                <h4 className="font-serif text-xl font-medium text-white mb-2 leading-tight group-hover:text-blue-100 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-white/60 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="mt-4 flex items-center text-xs text-white/40 group-hover:text-white transition-colors">
                  Read More <span className="ml-2">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
