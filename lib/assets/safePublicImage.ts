import fs from "node:fs";
import path from "node:path";

// Public 配下のローカル画像パスを安全化する。
// - 既存: そのまま返す
// - 欠け: fallback を返す（表示崩れ/404 を回避）
// - 外部URL: そのまま返す
// 注意: レポート（missing-assets）は引き続き「欠け」を検知できるよう、
//       ここではデータの正規化/修正はしない（表示側の保険のみ）。

const FALLBACK = "/images/_fallback/placeholder.svg";

function isRemoteUrl(p: string): boolean {
  return /^https?:\/\//i.test(p);
}

function normalizePublicPath(p: string): string {
  const trimmed = p.trim();
  if (trimmed.length === 0) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function publicFileExists(publicPath: string): boolean {
  try {
    const p = normalizePublicPath(publicPath);
    // next/image の src には "/images/..." のような public 直下パスが入る想定
    const abs = path.join(process.cwd(), "public", p.replace(/^\//, ""));
    return fs.existsSync(abs);
  } catch {
    // 実行環境によっては fs が使えないケースもあるため、安全側で true 扱い
    return true;
  }
}

export function safePublicImage(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  const p = imagePath.trim();
  if (p.length === 0) return null;
  if (isRemoteUrl(p)) return p;

  const normalized = normalizePublicPath(p);
  if (publicFileExists(normalized)) return normalized;
  return FALLBACK;
}

export const FALLBACK_PUBLIC_IMAGE = FALLBACK;
