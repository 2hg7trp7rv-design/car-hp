// components/hub/HubUpdateLog.tsx

import { getHubUpdateLog } from "@/lib/hub-update-logs";
import { cn } from "@/lib/utils";

type Props = {
  hubId: string;
  className?: string;
};

/**
 *ページ用の更新ログ
 * - 制度変更/価格改定/運用変更など、内容の鮮度を可視化する
 */
export function HubUpdateLog({ hubId, className }: Props) {
  const entries = getHubUpdateLog(hubId);

  if (!entries.length) return null;

  return (
    <section
      className={cn(
        "mt-10 rounded-[20px] border border-[rgba(14,12,10,0.12)] bg-[rgba(228,219,207,0.42)] px-6 py-6 shadow-sm backdrop-blur",
        className,
      )}
    >
      <h2 className="cb-sans-heading text-xl tracking-tight text-[var(--text-primary)]">更新ログ</h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
        情報の鮮度を担保するため、変更点を記録しています。
      </p>

      <ul className="mt-4 space-y-3">
        {entries.map((entry) => (
          <li
            key={`${entry.date}-${entry.title}`}
            className="rounded-[20px] bg-[rgba(228,219,207,0.42)] px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">{entry.date}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{entry.title}</span>
            </div>

            {entry.notes ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{entry.notes}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
