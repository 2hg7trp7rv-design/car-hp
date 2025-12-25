import Link from "next/link";

import type { GuideItem } from "@/lib/guides";
import type { ColumnItem } from "@/lib/columns";

import { GlassCard } from "@/components/GlassCard";
import { IconArrowRight } from "@/components/icons/IconArrowRight";

type Props = {
  guides: GuideItem[];
  columns: ColumnItem[];
};

/**
 * REQ: 記事終了直後の「Ownership Reality」導線。
 * ページ内の重複を減らすための抽出（見た目・挙動はそのまま）。
 */
export function OwnershipRealitySection({ guides, columns }: Props) {
  if ((guides?.length ?? 0) === 0 && (columns?.length ?? 0) === 0) return null;

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-slate-800" />
        <h2 className="font-serif text-sm font-bold tracking-[0.2em] text-slate-400 uppercase">
          Ownership Reality
        </h2>
        <div className="h-[1px] flex-1 bg-slate-800" />
      </div>

      <p className="mb-6 text-center text-[12px] text-slate-400">
        憧れだけで終わらせない。維持費や選び方の現実を知る。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {guides.slice(0, 2).map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${encodeURIComponent(g.slug)}`}
            className="group h-full"
          >
            <GlassCard className="flex h-full flex-col justify-between border border-tiffany-500/30 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 transition hover:border-tiffany-400 hover:shadow-[0_0_15px_rgba(45,212,191,0.15)]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-tiffany-500/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-tiffany-400 border border-tiffany-500/20">
                    GUIDE
                  </span>
                </div>
                <h3 className="font-serif text-[15px] font-medium text-slate-100 leading-relaxed group-hover:text-tiffany-300">
                  {g.title}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-end border-t border-tiffany-500/10 pt-3">
                <span className="text-[10px] font-bold tracking-widest text-tiffany-500 group-hover:underline decoration-1 underline-offset-4">
                  READ
                </span>
                <IconArrowRight className="ml-1 h-3 w-3 text-tiffany-500" />
              </div>
            </GlassCard>
          </Link>
        ))}

        {columns.slice(0, 2).map((c) => (
          <Link
            key={c.slug}
            href={`/column/${encodeURIComponent(c.slug)}`}
            className="group h-full"
          >
            <GlassCard className="flex h-full flex-col justify-between border border-slate-700 bg-slate-900/40 p-5 transition hover:border-slate-500 hover:bg-slate-800/60">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-400 border border-slate-700">
                    COLUMN
                  </span>
                </div>
                <h3 className="font-serif text-[15px] font-medium text-slate-200 leading-relaxed group-hover:text-white">
                  {c.title}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-end border-t border-slate-700 pt-3">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 group-hover:text-slate-300">
                  READ
                </span>
                <IconArrowRight className="ml-1 h-3 w-3 text-slate-600 group-hover:text-slate-400" />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
