import Link from "next/link";

import type { GuideAuthorProfile } from "@/lib/content-types";

type Props = {
  author: GuideAuthorProfile;
  articleKind: "GUIDE" | "COLUMN";
  publishedAt?: string | null;
  updatedAt?: string | null;
  sourceCount?: number | null;
};

function formatDateDot(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function EditorialTrustNotice({
  author,
  articleKind,
  publishedAt,
  updatedAt,
  sourceCount = 0,
}: Props) {
  const checkedDate = formatDateDot(updatedAt ?? publishedAt);
  const authorText = `${author.name}${author.credential ? ` ／ ${author.credential}` : ""}`;
  const sourcesText = sourceCount && sourceCount > 0
    ? `${sourceCount}件の出典・参考資料を記事末尾に掲載`
    : "参照資料がある場合は記事末尾に掲載";

  return (
    <section
      aria-label="記事の編集・確認体制"
      style={{
        width: "min(100%, 1280px)",
        margin: "0 auto",
        padding: "0 24px 22px",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "16px",
          padding: "18px",
          border: "1px solid #e6ebee",
          borderRadius: "22px",
          background: "linear-gradient(135deg, rgba(244,249,250,0.92), rgba(255,255,255,0.96))",
          boxShadow: "0 8px 24px -18px rgba(13, 18, 22, 0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#064e63",
              fontFamily: "Manrope, Noto Sans JP, system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            EDITORIAL CHECK ／ {articleKind === "COLUMN" ? "考察記事" : "実用ガイド"}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <Link href="/legal/editorial-policy" style={{ color: "#064e63", textDecoration: "underline" }}>
              編集方針
            </Link>
            <Link href="/legal/sources-factcheck" style={{ color: "#064e63", textDecoration: "underline" }}>
              出典・ファクトチェック
            </Link>
            <Link href="/contact" style={{ color: "#064e63", textDecoration: "underline" }}>
              誤りの報告
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          {[
            ["著者・編集", authorText],
            ["確認範囲", "一次情報・公的資料・メーカー発表・記事内リンク・数値表記を公開前に確認"],
            ["出典", sourcesText],
            ["更新", checkedDate ? `${checkedDate} 時点の内容` : "公開後も必要に応じて更新"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: "12px 14px",
                border: "1px solid #eef2f4",
                borderRadius: "14px",
                background: "#fff",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#97a2a9",
                  fontFamily: "Manrope, Noto Sans JP, system-ui, sans-serif",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                }}
              >
                {label}
              </span>
              <strong
                style={{
                  display: "block",
                  color: "#2b3338",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: 1.75,
                }}
              >
                {value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
