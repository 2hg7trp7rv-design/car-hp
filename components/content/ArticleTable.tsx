import { cn } from "@/lib/utils";

type Props = {
  headers: string[];
  rows: string[][];
  className?: string;
};

/**
 * ArticleTable
 * - Markdown の簡易 pipe-table を “記事内の表” として読みやすく整形する。
 * - モバイルでは横スクロール可能にして、レイアウト崩れを防ぐ。
 */
export function ArticleTable({ headers, rows, className }: Props) {
  const safeHeaders = Array.isArray(headers)
    ? headers.map((h) => String(h ?? "").trim())
    : [];

  const safeRows = Array.isArray(rows)
    ? rows.map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? "").trim()) : []))
    : [];

  // Column count = max(header length, any row length)
  const colCount = Math.max(
    safeHeaders.length,
    ...safeRows.map((r) => r.length),
    0,
  );

  if (colCount === 0) return null;

  const normalizedHeaders = safeHeaders.length
    ? [...safeHeaders, ...Array(Math.max(0, colCount - safeHeaders.length)).fill("")]
    : Array(colCount).fill("");

  const normalizedRows = safeRows.map((r) => [
    ...r,
    ...Array(Math.max(0, colCount - r.length)).fill(""),
  ]);

  return (
    <div
      className={cn(
        "mt-6 overflow-hidden rounded-2xl border border-[#222222]/10 bg-white shadow-soft",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="bg-[#0ABAB5]/8">
              {normalizedHeaders.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[11px] font-semibold tracking-[0.14em] text-[#222222]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((r, ri) => (
              <tr
                key={ri}
                className={cn(
                  "border-t border-[#222222]/8",
                  ri % 2 === 0 ? "bg-white" : "bg-[#222222]/[0.02]",
                )}
              >
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 align-top text-[12px] leading-relaxed text-[#222222]/80"
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 pb-4 pt-2 text-[10px] tracking-[0.14em] text-[#222222]/45">
        横にスクロールできます
      </div>
    </div>
  );
}
