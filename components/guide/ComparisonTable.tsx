import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";

export type ComparisonTableColumn = {
  label: string;
  subLabel?: string;
};

export type ComparisonTableRow = {
  label: string;
  values: string[];
};

export type ComparisonTableProps = {
  title: string;
  description?: string;
  columns: ComparisonTableColumn[];
  rows: ComparisonTableRow[];
  footnote?: string;
  theme?: "light" | "dark";
  className?: string;
};

export function ComparisonTable(props: ComparisonTableProps) {
  const {
    title,
    description,
    columns,
    rows,
    footnote,
    theme = "light",
    className,
  } = props;

  const isDark = theme === "dark";

  const headText = isDark ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]";
  const subText = isDark ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]";
  const border = isDark ? "border-white/10" : "border-[rgba(31,28,25,0.12)]";
  const cellBorder = isDark ? "border-white/10" : "border-[rgba(31,28,25,0.12)]";
  const tableBg = isDark ? "bg-[var(--surface-1)]" : "bg-[var(--surface-2)]";
  const thBg = isDark ? "bg-[var(--surface-2)]" : "bg-[var(--surface-2)]";
  const zebraA = isDark ? "bg-white/0" : "bg-white/0";
  const zebraB = isDark ? "bg-[var(--surface-1)]" : "bg-[var(--surface-1)]";

  return (
    <GlassCard
      padding="none"
      magnetic={false}
      className={cn(
        "overflow-hidden",
        "rounded-[20px]",
        "border",
        border,
        isDark ? "bg-[var(--surface-1)]" : "bg-[rgba(228,219,207,0.42)]",
        className,
      )}
    >
      <div className="p-6">
        <h3 className={cn("serif-heading text-lg", headText)}>{title}</h3>
        {description ? (
          <p className={cn("mt-2 text-[12px] leading-relaxed", subText)}>
            {description}
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table
            className={cn(
              "w-full min-w-[720px] overflow-hidden rounded-[20px]",
              "text-[11px] leading-relaxed",
              tableBg,
            )}
          >
            <thead>
              <tr className={cn(thBg)}>
                <th className={cn("border-b px-4 py-3 text-left font-semibold", headText, cellBorder)}>
                  観点
                </th>
                {columns.map((c, i) => (
                  <th
                    key={`${c.label}-${i}`}
                    className={cn(
                      "border-b px-4 py-3 text-left font-semibold",
                      headText,
                      cellBorder,
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{c.label}</span>
                      {c.subLabel ? (
                        <span className={cn("mt-0.5 text-[10px] font-normal", subText)}>
                          {c.subLabel}
                        </span>
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={`${r.label}-${ri}`} className={cn(ri % 2 === 0 ? zebraA : zebraB)}>
                  <td
                    className={cn(
                      "border-b px-4 py-3 align-top font-semibold",
                      headText,
                      cellBorder,
                    )}
                  >
                    {r.label}
                  </td>
                  {columns.map((_, ci) => (
                    <td
                      key={`${r.label}-${ci}`}
                      className={cn("border-b px-4 py-3 align-top", subText, cellBorder)}
                    >
                      {r.values[ci] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {footnote ? (
            <p className={cn("mt-3 text-[10px] leading-relaxed", subText)}>{footnote}</p>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

export default ComparisonTable;
