import Link from "next/link";
import { getAllCars } from "@/lib/cars";
import type { CarItem, Difficulty, MaintenanceCostLevel } from "@/lib/cars";

const difficultyLabel: Record<Difficulty, string> = {
  basic: "入門",
  medium: "中級",
  advanced: "上級",
};

const maintenanceLabel: Record<MaintenanceCostLevel, string> = {
  low: "やさしめ",
  medium: "ふつう",
  high: "高め",
};

export const metadata = {
  title: "CARS | CAR BOUTIQUE",
  description:
    "ボディタイプや予算ごとに、気になるクルマのキャラクターと維持のリアルをまとめた車種データベース。",
};

export default function CarsPage() {
  const cars = getAllCars();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">CARS</h1>
        <p className="text-sm text-muted-foreground">
          主要な国産車と輸入車を中心に、「どんなキャラのクルマか」「維持の重さはどのくらいか」を
          オーナー目線でざっくり掴めるデータベースです。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </section>
    </div>
  );
}

type CarCardProps = {
  car: CarItem;
};

function CarCard({ car }: CarCardProps) {
  return (
    <Link
      href={`/cars/${car.slug}`}
      className="block rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {car.maker}
        </div>
        <div className="flex gap-1 text-[10px]">
          <span className="rounded-full bg-muted px-2 py-0.5">
            難易度 {difficultyLabel[car.difficulty]}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5">
            維持費 {maintenanceLabel[car.maintenanceCostLevel]}
          </span>
        </div>
      </div>

      <h2 className="mt-1 text-base font-semibold">{car.name}</h2>

      <p className="mt-2 text-xs text-muted-foreground">{car.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>{car.bodyType}</span>
        <span>・{car.segment}</span>
        {car.releaseYear ? <span>・{car.releaseYear}年〜</span> : null}
      </div>
    </Link>
  );
}
