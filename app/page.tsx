// app/page.tsx
import { HomeCinema } from "@/components/home/HomeCinema";
import { getIndexCars } from "@/lib/cars";
import { getLatestColumns } from "@/lib/columns";
import { getLatestGuides } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";
import { resolveHeritageCardImage } from "@/lib/display-tag-media";
import { resolveEditorialImage } from "@/lib/editorial-media";

type HomeEntry = {
  href: string;
  title: string;
  meta?: string;
  description?: string;
  imageSrc?: string | null;
  category: string;
};

function formatDateLabel(value?: string | null) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value).slice(0, 10);
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function trimCopy(value?: string | null, max = 92) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).replace(/[、。,. ]+$/g, "")}…`;
}

function sanitizeImage(value?: string | null) {
  if (!value) return null;
  if (value.includes("placeholder")) return null;
  return value;
}

export default async function Page() {
  const [cars, guides, columns, heritage] = await Promise.all([
    getIndexCars(),
    getLatestGuides(8),
    getLatestColumns(8),
    getAllHeritage(),
  ]);

  const latestCars: HomeEntry[] = (cars || []).slice(0, 10).map((car) => ({
    href: `/cars/${car.slug}`,
    title: car.name || car.title || car.slug,
    meta: [car.maker, car.releaseYear ? String(car.releaseYear) : null].filter(Boolean).join(" / "),
    description: trimCopy(
      car.summaryLong ?? car.summary ?? car.costImpression ?? car.description ?? null,
      96,
    ),
    imageSrc: sanitizeImage((car as any).heroImage ?? (car as any).mainImage ?? null),
    category: "車種",
  }));

  const latestGuides: HomeEntry[] = (guides || []).slice(0, 8).map((guide) => ({
    href: `/guide/${guide.slug}`,
    title: guide.title || guide.slug,
    meta: formatDateLabel(guide.publishedAt ?? guide.updatedAt),
    description: trimCopy(
      guide.summary ?? guide.subtitle ?? guide.lead ?? guide.description ?? null,
      90,
    ),
    imageSrc: resolveEditorialImage(
      (((guide as any).heroImage ?? (guide as any).thumbnail ?? (guide as any).ogImageUrl ?? null) as string | null),
      "guide",
      "card",
      guide.slug,
    ).src,
    category: "実用",
  }));

  const latestColumns: HomeEntry[] = (columns || []).slice(0, 8).map((column) => ({
    href: `/column/${column.slug}`,
    title: column.title || column.slug,
    meta: formatDateLabel(column.publishedAt ?? column.updatedAt),
    description: trimCopy(
      column.summary ?? column.subtitle ?? column.description ?? null,
      90,
    ),
    imageSrc: resolveEditorialImage(
      (((column as any).heroImage ?? (column as any).thumbnail ?? (column as any).ogImageUrl ?? null) as string | null),
      "column",
      "card",
      column.slug,
    ).src,
    category: "考察",
  }));

  const latestHeritage: HomeEntry[] = (heritage || []).slice(0, 8).map((item) => ({
    href: `/heritage/${item.slug}`,
    title: item.title || item.slug,
    meta: item.eraLabel || formatDateLabel(item.publishedAt ?? item.updatedAt),
    description: trimCopy(
      item.summary ?? item.subtitle ?? item.lead ?? item.description ?? null,
      92,
    ),
    imageSrc: sanitizeImage(
      resolveHeritageCardImage({
        slug: item.slug,
        displayTag: (item as any).displayTag ?? null,
        tags: item.tags ?? [],
        title: item.title,
        brandName: (item as any).brandName ?? null,
        maker: (item as any).maker ?? null,
        thumbnail: (item as any).thumbnail ?? null,
        heroImage: (item as any).heroImage ?? null,
        ogImageUrl: (item as any).ogImageUrl ?? null,
      }),
    ),
    category: "系譜",
  }));

  return (
    <HomeCinema
      latestCars={latestCars}
      latestHeritage={latestHeritage}
      latestGuides={latestGuides}
      latestColumns={latestColumns}
    />
  );
}
