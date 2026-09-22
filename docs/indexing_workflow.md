# Indexing workflow

Article sources live in `data/articles/{cars,guides,heritage,columns}/*.json`.
Edit the JSON source, not generated HTML or an obsolete Markdown override.
Runtime publication rules are centralized in `lib/content/publication.ts`.

## Publication state

- Set `status: "published"` and `publicState: "index"` for an accessible, indexable article.
- Use `publicState: "noindex"` for an accessible article that should stay out of search.
- `draft` is inaccessible. Do not link to drafts from public navigation.
- For an intentional replacement, set `publicState: "redirect"` and add the exact old/new paths to `data/redirects.json`. Choose a destination that answers the same reader intent; do not send unrelated removed articles to an index page.
- `noindex: true` takes precedence over an otherwise indexable article. Explicit non-published status also takes precedence.

All maintained article files must declare status and publicState explicitly. The legacy missing-field fallback in the runtime is not an authoring shortcut. Search and filtered archive pages intentionally use noindex.

## Generated outputs and checks

`npm run build` generates robots, sitemaps and image metadata, then verifies the publication surface and rendered article HTML. Run `npm run check` for lint, source structure, tests, build and real HTTP checks. Never edit `public/sitemap.xml` or `public/sitemaps/*.xml` as the source of truth.

Adding a content family requires extending search, sitemap generation, internal-link validation, rendered-HTML checks and HTTP coverage together. A passing test that never inspects the new family does not validate it.

## Search Console review

1. Record the report's date and filter before interpreting counts.
2. Inspect example URLs for each exclusion reason. The Search Console history and current sitemap do not necessarily contain the same URL set.
3. Compare each URL's current status, redirect chain, canonical, robots and useful rendered text.
4. Preserve deliberate noindex for search/filter pages and valid redirects. Investigate missing URLs that still receive traffic; restore useful content at the same URL when appropriate.
5. Verify the deployed result before requesting validation or indexing. A valid sitemap, successful build or indexing request does not guarantee that Google will index a page.

Keep account identifiers and private analytics out of the public repository.
