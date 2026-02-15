import { HomeMasterpiece } from '@/components/home/HomeMasterpiece';

import { getIndexCars } from '@/lib/cars';
import { getLatestColumns } from '@/lib/columns';
import { getLatestGuides } from '@/lib/guides';
import { getAllHeritage } from '@/lib/heritage';

function safeIsoDate(value?: string | null): string {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export default async function Page() {
  const [cars, guides, columns, heritage] = await Promise.all([
    getIndexCars(),
    getLatestGuides(6),
    getLatestColumns(6),
    getAllHeritage(),
  ]);

  const latestCars = (cars || []).slice(0, 6).map((c) => ({
    href: `/cars/${c.slug}`,
    title: c.name || c.title || c.slug,
    meta: [c.maker, c.releaseYear ? String(c.releaseYear) : null].filter(Boolean).join(' / '),
  }));

  const latestGuides = (guides || []).slice(0, 6).map((g) => ({
    href: `/guide/${g.slug}`,
    title: g.title || g.slug,
    meta: safeIsoDate(g.publishedAt ?? g.updatedAt),
  }));

  const latestColumns = (columns || []).slice(0, 6).map((c) => ({
    href: `/column/${c.slug}`,
    title: c.title || c.slug,
    meta: safeIsoDate(c.publishedAt ?? c.updatedAt),
  }));

  const latestHeritage = (heritage || []).slice(0, 6).map((h) => ({
    href: `/heritage/${h.slug}`,
    title: h.title || h.slug,
    meta: h.eraLabel || safeIsoDate(h.publishedAt ?? h.updatedAt),
  }));

  return (
    <HomeMasterpiece
      // Show the handwriting intro on every full page load (incl. reload).
      showIntroOnMount={true}
      latestCars={latestCars}
      latestHeritage={latestHeritage}
      latestGuides={latestGuides}
      latestColumns={latestColumns}
    />
  );
}
