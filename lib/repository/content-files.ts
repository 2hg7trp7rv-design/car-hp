// lib/repository/content-files.ts
/**
 * Content file loader (server-only)
 *
 * 目的:
 * - data/*.json に入れづらい長文本文を、slug単位の Markdown ファイルで管理できるようにする
 * - 将来的に Cars / Guide / Heritage / Column すべてへ拡張可能
 *
 * 運用:
 * - content/{type}/{slug}.md を置く
 *   例) content/cars/toyota-supra-jza80-rz.md
 *
 * 注意:
 * - このモジュールは server-only（Node fs を使う）ため、Client Component からは import しないこと
 */

import "server-only";

import fs from "node:fs";
import path from "node:path";

export type MarkdownBodyMap = Map<string, string>;

type LoadOptions = {
  /**
   * 許可する拡張子（デフォルト: [".md"]）
   */
  extensions?: string[];
  /**
   * 最大サイズ（bytes）。巨大ファイルを誤って置いた時にビルドを守る。
   * デフォルト: 600KB
   */
  maxBytes?: number;
};

function safeLower(input: string): string {
  return String(input ?? "").trim().toLowerCase();
}

function normalizeSlugFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, ""); // remove extension
  return base.trim();
}

export function loadMarkdownBodiesFromDir(
  dirRel: string,
  options: LoadOptions = {},
): MarkdownBodyMap {
  const extensions = options.extensions ?? [".md"];
  const allowed = new Set(extensions.map((e) => (e.startsWith(".") ? safeLower(e) : `.${safeLower(e)}`)));

  const maxBytes = typeof options.maxBytes === "number" && options.maxBytes > 0 ? options.maxBytes : 600_000;

  const absDir = path.join(process.cwd(), dirRel);
  const out: MarkdownBodyMap = new Map();

  try {
    if (!fs.existsSync(absDir)) return out;

    const names = fs.readdirSync(absDir);
    for (const name of names) {
      const ext = safeLower(path.extname(name));
      if (!allowed.has(ext)) continue;

      const slug = normalizeSlugFromFilename(name);
      if (!slug) continue;

      const abs = path.join(absDir, name);
      let stat: fs.Stats | null = null;
      try {
        stat = fs.statSync(abs);
      } catch {
        continue;
      }
      if (!stat || !stat.isFile()) continue;
      if (stat.size > maxBytes) {
        // 巨大すぎる場合は読み込まない（ビルド保護）
        continue;
      }

      try {
        const raw = fs.readFileSync(abs, "utf-8");
        const body = String(raw ?? "").trim();
        if (!body) continue;
        out.set(slug, body);
      } catch {
        // ignore
      }
    }
  } catch {
    return out;
  }

  return out;
}
