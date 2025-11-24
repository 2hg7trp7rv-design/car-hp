// lib/cars.ts

// cars.json群の構造に合わせた型定義
export type CarItem = {
  slug: string;
  maker: string;
  series: string;
  name: string;
  generation?: string;
  modelYears?: string;
  bodyType?: string;
  grade?: string;
  catchCopy?: string;
  lead?: string;
  overview?: string;
  pros?: string[];
  cons?: string[];
  bestFor?: string[];
  notFor?: string[];
  troubleNotes?: string;
  maintenanceNotes?: string;
  modelChangeNotes?: string;
  mainSpec?: {
    engine?: string;
    drive?: string;
    transmission?: string;
    powerPs?: number;
    torqueNm?: number;
    fuel?: string;
    fuelEconomyWltc?: number;
  };
  sizeSpec?: {
    lengthMm?: number;
    widthMm?: number;
    heightMm?: number;
  };
  priceInfo?: {
    newPriceRangeMan?: string;
    usedPriceRangeMan?: string;
  };
  tags?: string[];
  image?: string;
  heroImage?: string;
};

import cars0 from "@/data/cars0.json";
import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
// さらにファイルを増やす場合はここにimportを追加
// import cars3 from "@/data/cars3.json";
// import cars4 from "@/data/cars4.json";

const allCars: CarItem[] = [
  ...(cars0 as CarItem[]),
  ...(cars1 as CarItem[]),
  ...(cars2 as CarItem[]),
  // ...(cars3 as CarItem[]),
  // ...(cars4 as CarItem[]),
];

export function getAllCars(): CarItem[] {
  return allCars;
}

export function getCarBySlug(slug: string): CarItem | undefined {
  return allCars.find((car) => car.slug === slug);
}
