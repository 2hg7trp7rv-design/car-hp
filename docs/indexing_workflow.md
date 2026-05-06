# Indexing Workflow (A/B/C)

This repository is set up to operate exactly like the CBJ plan:

- **A (Index)**: pages that already look like a “final answer”.
- **B (Integrate)**: pages whose intent should be merged into a stronger page (301 redirect).
- **C (Noindex)**: keep the page public for UX, but keep it out of the index until it is upgraded.

## Where to operate

- **C → A (forceIndex / forceNoindex)**
  - Edit: `data/indexing-overrides.json`
  - Purpose: temporary exceptions while you upgrade content.

- **B (integrate by redirect)**
  - Edit: `data/redirects.json`
  - Notes:
    - Redirect sources are automatically excluded from **sitemaps** and from internal **lists** (cars/guides/heritage/columns) to avoid crawl waste.

- **Main body editing (smartphone-friendly)**
  - Edit: `content/{type}/{slug}.md`
  - Types: `cars`, `guides`, `heritage`, `columns`
  - Priority rule: if both JSON `body` and Markdown exist, **Markdown wins**.

## Build-time outputs

- `npm run build` runs `prebuild`, which generates:
  - `public/robots.txt`
  - `public/sitemap.xml` + `public/sitemaps/*.xml`

