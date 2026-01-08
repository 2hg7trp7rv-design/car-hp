import type { CarItem, GuideItem, NewsItem } from "@/lib/content-types";

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function scoreByTags(a?: string[], b?: string[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b.map(norm).filter(Boolean));
  let hit = 0;
  for (const t of a) {
    if (setB.has(norm(t))) hit += 1;
  }
  return hit;
}

export function recommendCarsForNews(news: NewsItem, cars: CarItem[], limit = 3): CarItem[] {
  const maker = norm(news.maker);
  const tags = news.tags ?? [];

  const scored = cars
    .map((car) => {
      let score = 0;

      // strongest: explicit linkage
      if (Array.isArray(car.relatedNewsIds) && car.relatedNewsIds.includes(news.id)) {
        score += 100;
      }

      // maker match
      if (maker && norm(car.maker) === maker) score += 20;

      // tag overlap
      score += scoreByTags(car.tags, tags) * 3;

      // slight bonus for recency
      if (car.publishedAt) score += 1;

      return { car, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.car);
}

export function recommendGuidesForNews(
  news: NewsItem,
  guides: GuideItem[],
  limit = 3,
): GuideItem[] {
  const tags = news.tags ?? [];
  const maker = norm(news.maker);

  const scored = guides
    .map((g) => {
      let score = 0;
      score += scoreByTags(g.tags, tags) * 4;

      const title = norm(g.title);
      if (maker && title.includes(maker)) score += 2;

      if (g.publishedAt) score += 1;
      return { g, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.g);
}

export function recommendContentForNews(
  news: NewsItem,
  cars: CarItem[],
  guides: GuideItem[],
  opts?: { carsLimit?: number; guidesLimit?: number },
): { cars: CarItem[]; guides: GuideItem[] } {
  const carsLimit = opts?.carsLimit ?? 3;
  const guidesLimit = opts?.guidesLimit ?? 3;

  const recommendedCars = recommendCarsForNews(news, cars, carsLimit);
  const recommendedGuides = recommendGuidesForNews(news, guides, guidesLimit);

  // avoid duplicates by slug (paranoia)
  return {
    cars: uniq(recommendedCars.map((c) => c.slug)).map(
      (slug) => recommendedCars.find((c) => c.slug === slug)!,
    ),
    guides: uniq(recommendedGuides.map((g) => g.slug)).map(
      (slug) => recommendedGuides.find((g) => g.slug === slug)!,
    ),
  };
}
