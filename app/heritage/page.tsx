import type { Metadata } from 'next';

import { HeritageTimeArchive } from '@/components/heritage/HeritageTimeArchive';
import { getAllHeritage, type HeritageItem } from '@/lib/heritage';

export const metadata: Metadata = {
  title: 'HERITAGE｜TIME ARCHIVE',
  description: 'Decades of turning points, curated as a wall you can walk.',
  alternates: {
    canonical: '/heritage',
  },
};

function decadeOf(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

function yearFromEraLabel(label?: string | null): number | null {
  const s = (label ?? '').trim();
  if (!s) return null;

  // 4-digit year
  const m4 = s.match(/(19\d{2}|20\d{2})/);
  if (m4) return Number(m4[1]);

  // 1980s / 2000s / 2010s / 1980年代
  const md = s.match(/(19\d0|20\d0)\s*(?:s|年代)/i);
  if (md) return Number(md[1]);

  // 80s / 00s / 10s / 80年代 (2-digit)
  const m2 = s.match(/(?:^|[^0-9])(\d{2})\s*(?:s|年代)/i);
  if (m2) {
    const two = Number(m2[1]);
    if (!Number.isFinite(two)) return null;
    const base = two <= 29 ? 2000 : 1900;
    return base + two;
  }

  return null;
}

function safeIsoDate(value?: string | null): string {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function decadeSortKey(decade: string): number {
  const m = (decade ?? '').match(/(19\d0|20\d0)/);
  if (m) return Number(m[1]);
  return Number.NEGATIVE_INFINITY;
}

function buildTimeline(heritage: HeritageItem[]) {
  const CANONICAL_DECADES = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s'];

  type Row = {
    slug: string;
    title: string;
    eraLabel?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
  };

  const grouped = new Map<string, Row[]>();
  const undated: Row[] = [];

  for (const h of heritage || []) {
    const y =
      yearFromEraLabel(h.eraLabel) ??
      (h.publishedAt ? new Date(h.publishedAt).getFullYear() : null) ??
      (h.createdAt ? new Date(h.createdAt).getFullYear() : null);

    const row: Row = {
      slug: h.slug,
      title: h.title,
      eraLabel: h.eraLabel ?? null,
      publishedAt: h.publishedAt ?? null,
      createdAt: h.createdAt ?? null,
    };

    if (!y || !Number.isFinite(y)) {
      // 10年代が判定できない記事を「消さない」ための受け皿
      undated.push(row);
      continue;
    }

    const decade = decadeOf(y);
    const arr = grouped.get(decade) ?? [];
    arr.push(row);
    grouped.set(decade, arr);
  }

  // Canonical decades + data decades + UNFILED
  const decadeSet = new Set<string>(CANONICAL_DECADES);
  for (const d of grouped.keys()) decadeSet.add(d);
  if (undated.length > 0) decadeSet.add('UNFILED');

  const decades = Array.from(decadeSet).sort((a, b) => {
    const ka = decadeSortKey(a);
    const kb = decadeSortKey(b);

    if (ka === kb) {
      // keep UNFILED last
      if (a === 'UNFILED') return 1;
      if (b === 'UNFILED') return -1;
      return String(a).localeCompare(String(b));
    }

    return kb - ka;
  });

  const sortItems = (items: Row[]) =>
    items
      .slice()
      .sort((a, b) => {
        const ad = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
        const bd = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
        return bd - ad;
      })
      .map((i) => ({
        slug: i.slug,
        title: i.title,
        eraLabel: i.eraLabel ?? null,
        publishedAt: i.publishedAt ? safeIsoDate(i.publishedAt) : null,
      }));

  return decades.map((decade) => ({
    decade,
    items: sortItems(decade === 'UNFILED' ? undated : grouped.get(decade) ?? []),
  }));
}


export default async function HeritagePage() {
  const heritage = await getAllHeritage();
  const timeline = buildTimeline(heritage || []);

  return (
    <main className="relative min-h-screen bg-[#07080a] text-white">
      <HeritageTimeArchive timeline={timeline} />
    </main>
  );
}
