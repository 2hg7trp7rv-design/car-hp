import type {
  CarItem,
  ColumnItem,
  GuideItem,
  HeritageItem,
  NewsItem,
} from "@/lib/content-types";

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

export function recommendColumnsForNews(
  news: NewsItem,
  columns: ColumnItem[],
  limit = 3,
): ColumnItem[] {
  const tags = news.tags ?? [];
  const maker = norm(news.maker);

  const scored = columns
    .map((c) => {
      let score = 0;

      // tag overlap
      score += scoreByTags(c.tags, tags) * 4;

      // maker hint
      const title = norm(c.title);
      if (maker && title.includes(maker)) score += 2;
      if (maker && Array.isArray(c.tags) && c.tags.map(norm).includes(maker)) score += 2;

      if (c.publishedAt) score += 1;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.c);
}

export function recommendHeritageForNews(
  news: NewsItem,
  heritage: HeritageItem[],
  limit = 2,
): HeritageItem[] {
  const tags = news.tags ?? [];
  const maker = norm(news.maker);

  const scored = heritage
    .map((h) => {
      let score = 0;

      // strongest: explicit linkage
      if (Array.isArray(h.relatedNewsIds) && h.relatedNewsIds.includes(news.id)) {
        score += 100;
      }

      // maker match
      if (maker && norm(h.maker) === maker) score += 18;
      if (maker && norm((h as any).brandName) === maker) score += 12;

      // tag overlap
      score += scoreByTags(h.tags ?? undefined, tags) * 3;

      if (h.publishedAt) score += 1;
      return { h, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.h);
}

export function recommendContentForNews(
  news: NewsItem,
  cars: CarItem[],
  guides: GuideItem[],
  columns: ColumnItem[],
  heritage: HeritageItem[],
  opts?: {
    carsLimit?: number;
    guidesLimit?: number;
    columnsLimit?: number;
    heritageLimit?: number;
  },
): { cars: CarItem[]; guides: GuideItem[]; columns: ColumnItem[]; heritage: HeritageItem[] } {
  const carsLimit = opts?.carsLimit ?? 3;
  const guidesLimit = opts?.guidesLimit ?? 3;
  const columnsLimit = opts?.columnsLimit ?? 3;
  const heritageLimit = opts?.heritageLimit ?? 2;

  const recommendedCars = recommendCarsForNews(news, cars, carsLimit);
  const recommendedGuides = recommendGuidesForNews(news, guides, guidesLimit);
  const recommendedColumns = recommendColumnsForNews(news, columns, columnsLimit);
  const recommendedHeritage = recommendHeritageForNews(news, heritage, heritageLimit);

  // avoid duplicates by slug (paranoia)
  return {
    cars: uniq(recommendedCars.map((c) => c.slug)).map(
      (slug) => recommendedCars.find((c) => c.slug === slug)!,
    ),
    guides: uniq(recommendedGuides.map((g) => g.slug)).map(
      (slug) => recommendedGuides.find((g) => g.slug === slug)!,
    ),
    columns: uniq(recommendedColumns.map((c) => c.slug)).map(
      (slug) => recommendedColumns.find((c) => c.slug === slug)!,
    ),
    heritage: uniq(recommendedHeritage.map((h) => h.slug)).map(
      (slug) => recommendedHeritage.find((h) => h.slug === slug)!,
    ),
  };
}
