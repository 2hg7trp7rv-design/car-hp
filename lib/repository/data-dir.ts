// lib/repository/data-dir.ts
//
// JSON単一ソース運用（iPhone + Working Copy 前提）
// - data/articles/<type>/*.json を “唯一の本文/メタ” として読む
// - Next.js/Vercel の output file tracing でデータ同梱する前提（next.config.mjs で includes）
//
// NOTE:
// - Repository層は「JSONの揺れ吸収」を担う。ここは“読み込み”だけを担当。
// - Serverless の file tracing が広がり過ぎないよう、読み込み対象ディレクトリは静的に限定する。

import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, unknown[]>();

const CARS_DIR = path.join(process.cwd(), "data", "articles", "cars");
const GUIDES_DIR = path.join(process.cwd(), "data", "articles", "guides");
const COLUMNS_DIR = path.join(process.cwd(), "data", "articles", "columns");
const HERITAGE_DIR = path.join(process.cwd(), "data", "articles", "heritage");

type KnownJsonDir = "cars" | "guides" | "columns" | "heritage";

function readStaticJsonDir<T = unknown>(cacheKey: KnownJsonDir, absDir: string): T[] {
  if (cache.has(cacheKey)) return cache.get(cacheKey) as T[];

  if (!fs.existsSync(absDir)) {
    cache.set(cacheKey, []);
    return [];
  }

  const files = fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((ent) => ent.isFile() && ent.name.endsWith(".json"))
    .map((ent) => ent.name)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const list: T[] = [];

  for (const file of files) {
    const fileAbs = path.join(absDir, file);
    try {
      const raw = fs.readFileSync(fileAbs, "utf-8");
      const parsed = JSON.parse(raw) as T;
      list.push(parsed);
    } catch (err) {
      // 1ファイルの壊れで全体が落ちると運用が止まるため、ログだけ出してスキップ
      // （audit / prebuild で検出して落とす）
      // eslint-disable-next-line no-console
      console.error(`[readJsonDir] Failed to read: ${cacheKey}/${file}`, err);
    }
  }

  cache.set(cacheKey, list);
  return list;
}

export function readCarsJsonDir<T = unknown>(): T[] {
  return readStaticJsonDir<T>("cars", CARS_DIR);
}

export function readGuidesJsonDir<T = unknown>(): T[] {
  return readStaticJsonDir<T>("guides", GUIDES_DIR);
}

export function readColumnsJsonDir<T = unknown>(): T[] {
  return readStaticJsonDir<T>("columns", COLUMNS_DIR);
}

export function readHeritageJsonDir<T = unknown>(): T[] {
  return readStaticJsonDir<T>("heritage", HERITAGE_DIR);
}

export function clearJsonDirCache(): void {
  cache.clear();
}
