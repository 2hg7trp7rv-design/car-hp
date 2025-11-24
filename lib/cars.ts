// lib/cars.ts

import type { CarItem } from "@/lib/types";

import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
// 追加のファイル(cars3.json, cars4.json)を作ったらここにimportを足す

export type { CarItem };

const allCars: CarItem[] = [
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

export function getCarsByMaker(maker: string): CarItem[] {
  const normalized = maker.toLowerCase();
  return allCars.filter((car) => car.maker.toLowerCase() === normalized);
}

export function getCarsByBodyType(bodyType: string): CarItem[] {
  const normalized = bodyType.toLowerCase();
  return allCars.filter(
    (car) => car.bodyType && car.bodyType.toLowerCase() === normalized,
  );
}

export function getCarsByTag(tag: string): CarItem[] {
  const normalized = tag.toLowerCase();
  return allCars.filter(
    (car) =>
      Array.isArray(car.tags) &&
      car.tags.some((t) => t.toLowerCase() === normalized),
  );
}
