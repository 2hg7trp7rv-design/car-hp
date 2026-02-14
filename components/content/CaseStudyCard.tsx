import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Row = {
  label: string;
  status: "ok" | "ng" | "neutral";
  text: string;
};

type Props = {
  title: string;
  situation?: string | null;
  rows: Row[];
};

function normalizeStatus(s: string): Row["status"] {
  const t = (s ?? "").trim();
  if (!t) return "neutral";
  if (t.includes("✅") || /^ok$/i.test(t) || t.includes("○") || t.includes("◯")) return "ok";
  if (t.includes("❌") || /^ng$/i.test(t) || t.includes("×") || t.includes("✕")) return "ng";
  return "neutral";
}

export function CaseStudyCard({ title, situation, rows }: Props) {
  return (
    <section className="case-study">
      <h4>{renderInlineMarkdown(title, { tone: "light" })}</h4>
      {situation ? <p className="case-study__situation">{renderInlineMarkdown(situation, { tone: "light" })}</p> : null}

      <div className="case-study__table" role="table" aria-label={title}>
        {rows.map((r, idx) => (
          <div key={idx} className="case-study__row" role="row">
            <div className="case-study__label" role="cell">{renderInlineMarkdown(r.label, { tone: "light" })}</div>
            <div className={"case-study__value " + (r.status === "ok" ? "is-ok" : r.status === "ng" ? "is-ng" : "") } role="cell">
              {r.status === "ok" ? "✅" : r.status === "ng" ? "❌" : ""}
              <span className="case-study__valueText">{renderInlineMarkdown(r.text, { tone: "light" })}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function parseCaseRow(line: string): Row | null {
  const t = (line ?? "").trim();
  if (!t) return null;

  // Expected: "サービス名：✅ 内容" or "サービス名: NG 内容"
  const m = t.match(/^[-•]\s*([^:：]+)[:：]\s*(.*)$/);
  if (!m) return null;

  const label = (m[1] ?? "").trim();
  let rest = (m[2] ?? "").trim();
  if (!label || !rest) return null;

  // status prefix
  let status: Row["status"] = "neutral";
  const s = rest.slice(0, 2);
  if (s.includes("✅") || s.includes("❌")) {
    status = normalizeStatus(s);
    rest = rest.replace(/^✅\s*/," ").replace(/^❌\s*/," ").trim();
  } else {
    const word = rest.split(/\s+/)[0] ?? "";
    const ns = normalizeStatus(word);
    if (ns !== "neutral") {
      status = ns;
      rest = rest.slice(word.length).trim();
    }
  }

  return { label, status, text: rest };
}
