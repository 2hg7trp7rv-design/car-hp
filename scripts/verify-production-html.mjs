#!/usr/bin/env node

const BASE_URL = (process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://carboutiquejournal.com').replace(/\/+$/, '');
const DEFAULT_PATHS = [
  '/',
  '/cars',
  '/cars/lamborghini-temerario',
  '/guide',
  '/guide/road-service-choice-guide',
  '/guide/car-budget-simulation',
  '/column',
  '/column/dashcam-why-first',
  '/heritage',
  '/heritage/nissan-fairlady-z-lineage-heritage',
  '/search',
  '/compare',
  '/canvas',
  '/sitemap.xml',
  '/sitemaps/sitemap-cars.xml',
];
const CHECK_PATHS = (process.env.CHECK_PATHS || DEFAULT_PATHS.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const EXPECTATIONS = {
  '/': { kind: 'html', canonical: `${BASE_URL}/`, index: true },
  '/cars': { kind: 'html', canonical: `${BASE_URL}/cars`, index: true },
  '/cars/lamborghini-temerario': { kind: 'html', canonical: `${BASE_URL}/cars/lamborghini-temerario`, index: true },
  '/guide': { kind: 'html', canonical: `${BASE_URL}/guide`, index: true },
  '/guide/road-service-choice-guide': { kind: 'html', canonical: `${BASE_URL}/guide/road-service-choice-guide`, index: true },
  '/guide/car-budget-simulation': { kind: 'html', canonical: `${BASE_URL}/guide/car-budget-simulation`, index: true },
  '/column': { kind: 'html', canonical: `${BASE_URL}/column`, index: true },
  '/column/dashcam-why-first': { kind: 'html', canonical: `${BASE_URL}/column/dashcam-why-first`, index: true },
  '/heritage': { kind: 'html', canonical: `${BASE_URL}/heritage`, index: true },
  '/heritage/nissan-fairlady-z-lineage-heritage': { kind: 'html', canonical: `${BASE_URL}/heritage/nissan-fairlady-z-lineage-heritage`, index: true },
  '/search': { kind: 'html', canonical: `${BASE_URL}/search`, index: false },
  '/compare': { kind: 'html', canonical: `${BASE_URL}/compare`, index: false },
  '/canvas': { kind: 'html', canonical: `${BASE_URL}/canvas`, index: false },
  '/sitemap.xml': { kind: 'xml', xRobotsNoindex: true },
  '/sitemaps/sitemap-cars.xml': { kind: 'xml', xRobotsNoindex: true },
};

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m?.[1] || '';
}

function extractRobots(html) {
  const m = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  return (m?.[1] || '').toLowerCase();
}

function countJsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi)].length;
}

const failures = [];

for (const path of CHECK_PATHS) {
  const expectation = EXPECTATIONS[path] || { kind: 'html' };
  const url = `${BASE_URL}${path}`;
  let response;
  try {
    response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'CBJ-SEO-Verify/1.0' } });
  } catch (error) {
    failures.push(`${path}: fetch failed (${error?.message || error})`);
    continue;
  }

  if (!response.ok) {
    failures.push(`${path}: status ${response.status}`);
    continue;
  }

  const xRobots = (response.headers.get('x-robots-tag') || '').toLowerCase();

  if (expectation.kind === 'xml') {
    const xml = await response.text();
    if (!xml.includes('<?xml')) failures.push(`${path}: XML declaration missing`);
    if (expectation.xRobotsNoindex && !xRobots.includes('noindex')) failures.push(`${path}: X-Robots-Tag noindex missing`);
    continue;
  }

  const html = await response.text();
  const canonical = extractCanonical(html);
  const robots = extractRobots(html);
  const jsonLdCount = countJsonLd(html);

  if (expectation.canonical && canonical !== expectation.canonical) {
    failures.push(`${path}: canonical mismatch (${canonical || '(none)'} !== ${expectation.canonical})`);
  }
  if (expectation.index === true && robots.includes('noindex')) {
    failures.push(`${path}: unexpected noindex`);
  }
  if (expectation.index === false && !robots.includes('noindex')) {
    failures.push(`${path}: expected noindex missing`);
  }
  if (!['/search', '/compare', '/canvas'].includes(path) && jsonLdCount === 0) {
    failures.push(`${path}: JSON-LD not found`);
  }
}

if (failures.length) {
  console.error('[verify-production-html] FAILED');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`[verify-production-html] OK (${CHECK_PATHS.length} paths)`);
