import cars1 from "@/data/cars1.json";
import cars2 from "@/data/cars2.json";
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

export function getCarsByMaker(maker: string): CarItem[] {
  return allCars.filter((car) => car.maker === maker);
}

export function getCarsByBodyType(bodyType: string): CarItem[] {
  return allCars.filter((car) => car.bodyType === bodyType);
}

export function getCarsByTag(tag: string): CarItem[] {
  return allCars.filter((car) => car.tags.includes(tag));
}
