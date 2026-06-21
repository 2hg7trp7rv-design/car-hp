export const EDITORIAL_ASSETS = {
  homeHero: "/images/cbj/home-hero.jpg",
  guideHero: "/images/cbj/guide-hero.jpg",
  columnHero: "/images/cbj/column-hero.jpg",
  heritageHero: "/images/cbj/heritage-hero.jpg",
  carTemerarioHero: "/images/cbj/car-temerario-hero.jpg",
  carTemerarioCard: "/images/cbj/car-temerario-card.jpg",
  carFerrariPurosangueHero: "/images/cbj/car-ferrari-purosangue-hero.jpg",
  carNissanZRz34Hero: "/images/cbj/car-nissan-z-rz34-hero.jpg",
} as const;

export const CAR_EDITORIAL_IMAGE_BY_SLUG: Record<string, string> = {
  "lamborghini-temerario": EDITORIAL_ASSETS.carTemerarioHero,
  "ferrari-purosangue": EDITORIAL_ASSETS.carFerrariPurosangueHero,
  "nissan-z-rz34": EDITORIAL_ASSETS.carNissanZRz34Hero,
};

export const CAR_EDITORIAL_CARD_IMAGE_BY_SLUG: Record<string, string> = {
  "lamborghini-temerario": EDITORIAL_ASSETS.carTemerarioCard,
};

export function getEditorialCarImageBySlug(slug?: string | null): string | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  return CAR_EDITORIAL_IMAGE_BY_SLUG[key] ?? null;
}

export function getEditorialCarCardImageBySlug(slug?: string | null): string | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  return CAR_EDITORIAL_CARD_IMAGE_BY_SLUG[key] ?? getEditorialCarImageBySlug(key) ?? null;
}
