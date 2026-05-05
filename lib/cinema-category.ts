import type { CinemaCategoryCard } from "@/components/cinema/CinemaCategoryPage";

export const CINEMA_MARQUEE_IMAGES = [
  "/hero-bugatti-v3.jpg",
  "/car-gtr.jpg",
  "/car-mustang.jpg",
  "/car-corvette.jpg",
  "/car-red.jpg",
  "/detail-engine.jpg",
  "/detail-oil.jpg",
  "/detail-wheel.jpg",
] as const;

export function fallbackImage(index: number): string {
  return CINEMA_MARQUEE_IMAGES[index % CINEMA_MARQUEE_IMAGES.length];
}

export function pickImage(index: number, ...values: Array<string | null | undefined>): string {
  const hit = values.find((value) => typeof value === "string" && value.trim().length > 0);
  return hit ? hit.trim() : fallbackImage(index);
}

export function compactText(value: string | null | undefined, max = 118): string {
  const text = (value ?? "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/[#>*`_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/[、。,.\s]+$/g, "")}…`;
}

export function buildFeaturedCards(cards: CinemaCategoryCard[]): CinemaCategoryCard[] {
  const featured = cards.slice(0, 5);
  if (featured.length >= 5) return featured;

  return [...featured, ...cards.slice(5, 10)].slice(0, 5);
}
