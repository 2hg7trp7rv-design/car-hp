// lib/repository/data-dir.ts
//
// JSON単一ソース運用（iPhone + Working Copy 前提）
// - data/articles/<type>/*.json を “唯一の本文/メタ” として読む
// - Next.js/Vercel の output file tracing でデータ同梱する前提（next.config.mjs で includes）
//
// NOTE:
// - Repository層は「JSONの揺れ吸収」を担う。ここは“読み込み”だけを担当。

import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, unknown[]>();

export function readJsonDir<T = any>(relDir: string): T[] {
  if (cache.has(relDir)) return cache.get(relDir) as T[];

  const abs = path.join(process.cwd(), relDir);
  if (!fs.existsSync(abs)) {
    cache.set(relDir, []);
    return [];
  }

  const files = fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((ent) => ent.isFile() && ent.name.endsWith(".json"))
    .map((ent) => ent.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const list: T[] = [];

  for (const file of files) {
    const fileAbs = path.join(abs, file);
    try {
      const raw = fs.readFileSync(fileAbs, "utf-8");
      const parsed = JSON.parse(raw) as T;
      list.push(parsed);
    } catch (err) {
      // 1ファイルの壊れで全体が落ちると運用が止まるため、ログだけ出してスキップ
      // （audit / prebuild で検出して落とす）
      // eslint-disable-next-line no-console
      console.error(`[readJsonDir] Failed to read: ${relDir}/${file}`, err);
    }
  }

  cache.set(relDir, list);
  return list;
}

export function clearJsonDirCache(): void {
  cache.clear();
}
