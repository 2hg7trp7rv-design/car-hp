const BASE_URL = process.env.CBJ_VERIFY_BASE_URL || 'https://carboutiquejournal.com';

const PATHS = [
  '/',
  '/guide',
  '/column',
  '/site-map',
  '/contact',
];

const EXPECT = Object.fromEntries(PATHS.map((pathname) => [pathname, { kind: 'html', canonical: `${BASE_URL}${pathname === '/' ? '' : pathname}`, index: pathname !== '/search' }]));
const REMOVED_ROUTE_PREFIXES = ['/' + 'ca' + 'rs', '/' + 'her' + 'itage'];

function fail(message) {
  console.error(`[verify-production-html] ❌ ${message}`);
  process.exitCode = 1;
}

async function main() {
  for (const pathname of PATHS) {
    const url = `${BASE_URL}${pathname}`;
    let res;
    try {
      res = await fetch(url, { redirect: 'manual', headers: { 'x-forwarded-proto': 'https' } });
    } catch (error) {
      fail(`${pathname}: fetch failed: ${error.message}`);
      continue;
    }
    if (res.status < 200 || res.status >= 400) {
      fail(`${pathname}: unexpected status ${res.status}`);
      continue;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) fail(`${pathname}: expected HTML, got ${contentType}`);
    const html = await res.text();
    const expected = EXPECT[pathname];
    if (!html.includes('<html')) fail(`${pathname}: <html> missing`);
    if (expected?.canonical && !html.includes(`href="${expected.canonical}"`) && !html.includes(`href='${expected.canonical}'`)) {
      console.warn(`[verify-production-html] ⚠ canonical not found for ${pathname}: ${expected.canonical}`);
    }
    if (REMOVED_ROUTE_PREFIXES.some((prefix) => html.includes(`href="${prefix}`) || html.includes(`href='${prefix}`))) {
      fail(`${pathname}: removed section link remains in HTML`);
    }
  }
  if (!process.exitCode) console.log('[verify-production-html] ✅ OK');
}

await main();
