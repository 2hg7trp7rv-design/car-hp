import Link from "next/link";

import type { GuideItem } from "@/lib/guides";
import type { ColumnItem } from "@/lib/columns";

type Props = {
  guides: GuideItem[];
  columns: ColumnItem[];
};

/**
 * HERITAGE本文の各セクション末尾で、章に紐付く GUIDE / COLUMN を静かに並べる。
 * ページ側の重複を減らすための抽出（見た目・挙動はそのまま）。
 */
export function SectionRelatedLinks({ guides, columns }: Props) {
  if ((guides?.length ?? 0) === 0 && (columns?.length ?? 0) === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
      {guides.map((g) => (
        <Link
          key={g.slug}
          href={`/guide/${g.slug}`}
          className="block text-[11px] text-slate-600 hover:text-rose-600 hover:underline"
        >
          GUIDE: {g.title}
        </Link>
      ))}
      {columns.map((c) => (
        <Link
          key={c.slug}
          href={`/column/${c.slug}`}
          className="block text-[11px] text-slate-600 hover:text-rose-600 hover:underline"
        >
          COLUMN: {c.title}
        </Link>
      ))}
    </div>
  );
}
