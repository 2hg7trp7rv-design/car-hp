// components/heritage/HeritageSidebarNext.tsx

import type { HeritageItem } from "@/lib/heritage";
import {
  getPreviousHeritage,
  getNextHeritage,
} from "@/lib/heritage";
import Link from "next/link";

/**
 * HERITAGE 用サイドバー導線
 * 読了後に必ず次がある構造を作る
 */
export async function HeritageSidebarNext({
  heritage,
}: {
  heritage: HeritageItem;
}) {
  const prev = await getPreviousHeritage(heritage.slug);
  const next = await getNextHeritage(heritage.slug);

  if (!prev && !next) return null;

  return (
    <nav>
      <h3>次に読むHERITAGE</h3>

      <ul>
        {prev && (
          <li>
            <span>前の記事</span>
            <Link href={`/heritage/${prev.slug}`}>
              {prev.title}
            </Link>
          </li>
        )}

        {next && (
          <li>
            <span>次の記事</span>
            <Link href={`/heritage/${next.slug}`}>
              {next.title}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
