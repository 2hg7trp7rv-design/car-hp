import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { getAllGuides } from "../lib/guides";

// Allocate a temporary local port; the server is always stopped in finally.
const listener = net.createServer();
listener.listen(0, "127.0.0.1");
await once(listener, "listening");
const port = (listener.address() as net.AddressInfo).port;
await new Promise<void>((resolve) => listener.close(() => resolve()));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
let output = "";
server.stdout.on("data", (chunk) => { output = (output + chunk).slice(-8000); });
server.stderr.on("data", (chunk) => { output = (output + chunk).slice(-8000); });
const fetchPage = (pathname: string) => fetch(`${base}${pathname}`, { redirect: "manual", signal: AbortSignal.timeout(10000) });

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
    try { if ((await fetchPage("/")).status === 200) { ready = true; break; } } catch { /* starting */ }
    await delay(250);
  }
  assert.ok(ready, `Server did not become ready: ${output}`);
  const guides = (await getAllGuides()).filter((guide) => !["draft", "redirect"].includes(guide.publicState));
  for (const pathname of ["/", "/guide", "/column", "/cars", "/heritage", "/legal", "/legal/privacy", "/contact", ...guides.map((guide) => `/guide/${guide.slug}`)]) {
    const response = await fetchPage(pathname);
    assert.equal(response.status, 200, pathname);
    assert.ok((await response.text()).includes("Cookie設定"), `${pathname}: cookie settings not reachable`);
  }
  for (const prefix of ["guide", "column", "cars", "heritage", "cars/makers", "cars/segments", "cars/body-types"]) {
    assert.equal((await fetchPage(`/${prefix}/cbj-nonexistent-regression-test`)).status, 404, `${prefix}: unknown route should be 404`);
  }
  const hero = guides.find((guide) => guide.heroImage)?.heroImage;
  assert.ok(hero, "Expected a representative article image");
  const optimized = await fetchPage(`/_next/image?url=${encodeURIComponent(hero)}&w=640&q=75`);
  assert.equal(optimized.status, 200, "Article image optimization");
  assert.match(optimized.headers.get("content-type") ?? "", /^image\//);
  const blockedRemote = await fetchPage("/_next/image?url=https%3A%2F%2Fexample.com%2Fblocked.png&w=640&q=75");
  assert.equal(blockedRemote.status, 400, "Unapproved remote images must be rejected");
  const empty = await fetchPage("/api/search?q=zzzznomatchcbj20260910");
  assert.equal(empty.status, 200);
  assert.deepEqual((await empty.json()).results, []);
  const matching = await fetchPage("/api/search?q=ADAS&type=guide&limit=2");
  const results = (await matching.json()).results as { type: string }[];
  assert.ok(results.length > 0 && results.length <= 2 && results.every((item) => item.type === "guide"));
  assert.equal((await fetchPage(`/api/search?q=${"x".repeat(201)}`)).status, 400);
  const searchPage = await fetchPage("/search?q=zzzznomatchcbj20260910");
  assert.equal(searchPage.status, 200);
  const searchHtml = await searchPage.text();
  assert.match(searchHtml, /name="robots"[^>]+noindex/);
  for (const pathname of ["/sitemap.xml", "/robots.txt"]) assert.equal((await fetchPage(pathname)).status, 200, pathname);
  console.log("[verify-http] OK: live pages, article routes, 404s, search API, noindex, image optimization, remote image rejection, cookie settings, sitemap and robots");
} finally {
  server.kill("SIGTERM");
  if (server.exitCode === null) await once(server, "exit");
}
