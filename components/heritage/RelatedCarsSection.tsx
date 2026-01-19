// components/heritage/RelatedCarsSection.tsx

import { getAllCarsSync } from "@/lib/cars";
import { CarCard } from "@/components/cars/CarCard";

type Props = {
  carSlugs: string[];
};

/**
 * HERITAGE / 章末 / ページ末尾 用
 * 「登場した車」を必ず表示するための共通コンポーネント
 */
export function RelatedCarsSection({ carSlugs }: Props) {
  if (!carSlugs || carSlugs.length === 0) {
    return (
      <section>
        <h2>RELATED CARS</h2>
        <p>このHERITAGEに登場する車は準備中です。</p>
      </section>
    );
  }

  const cars = getAllCarsSync().filter((c) =>
    carSlugs.includes(c.slug),
  );

  return (
    <section>
      <h2>RELATED CARS</h2>

      {cars.length === 0 ? (
        <p>このHERITAGEに登場する車は準備中です。</p>
      ) : (
        <div className="grid">
          {cars.map((car) => (
            <CarCard key={car.slug} car={car} />
          ))}
        </div>
      )}
    </section>
  );
}
