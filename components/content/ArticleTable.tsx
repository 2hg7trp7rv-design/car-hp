import type { ReactNode } from "react";

import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Props = {
  headers: string[];
  rows: string[][];
  tone?: "light" | "dark";
};

export function ArticleTable({ headers, rows, tone = "light" }: Props) {
  const t = tone;

  return (
    <div className="cbj-article-table">
      <div className="cbj-article-table__scroller">
        <table>
          <thead>
            <tr>
              {headers.map((h, idx) => (
                <th key={idx}>{renderInlineMarkdown(h, { tone: t })}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ridx) => (
              <tr key={ridx}>
                {r.map((c, cidx) => (
                  <td key={cidx}>{renderInlineMarkdown(c, { tone: t })}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
