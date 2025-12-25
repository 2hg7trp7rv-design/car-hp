import type { CarItem } from "@/lib/cars";
import { CarCard } from "@/components/cars/CarCard";

type Props = {
  cars: CarItem[];
  className?: string;
};

export function RelatedCarsGrid({ cars, className }: Props) {
  if (!cars || cars.length === 0) return null;

  return (
    <div className={className ?? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
      {cars.map((car, i) => (
        <CarCard key={car.slug} car={car} delay={80 + i * 40} />
      ))}
    </div>
  );
}
