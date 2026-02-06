import { cn } from "@/lib/utils";

import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Props = {
  headers: string[];
  rows: string[][];
  /** Shown above the table to hint horizontal scrolling on mobile. */
  hint?: string;
  className?: string;
};

function normalizeRow(cells: string[], size: number): string[] {
  const out = [...cells];
  while (out.length < size) out.push("—");
  return out.slice(0, size);
}

export function ScrollSpecTable({ headers, rows, hint = "← スクロールして比較 →", className }: Props) {
  const head = (Array.isArray(headers) ? headers : []).map((s) => (s ?? "").toString().trim()).filter(Boolean);
  const body = Array.isArray(rows) ? rows : [];

  if (head.length < 2) return null;

  const normalizedRows = body
    .map((r) => (Array.isArray(r) ? r : []).map((c) => (c ?? "").toString().trim()))
    .filter((r) => r.some((c) => c.length > 0))
    .map((r) => normalizeRow(r, head.length));

  return (
    <div className={cn("cbj-table-wrapper", className)}>
      {hint ? <p className="cbj-scroll-hint">{hint}</p> : null}

      <div className="cbj-table-scroll">
        <table className="cbj-spec-table">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={`${h}-${i}`} scope="col">
                  {renderInlineMarkdown(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((cells, ri) => (
              <tr key={`r-${ri}`}>
                {cells.map((cell, ci) => {
                  if (ci === 0) {
                    return (
                      <th key={`c-${ri}-${ci}`} scope="row">
                        {renderInlineMarkdown(cell)}
                      </th>
                    );
                  }

                  return <td key={`c-${ri}-${ci}`}>{renderInlineMarkdown(cell)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
