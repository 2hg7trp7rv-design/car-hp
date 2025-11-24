// app/column/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "コラム一覧 | CAR BOUTIQUE",
  description:
    "オーナー体験記、修理や維持のリアル、技術やブランドの背景まで。読み物としてじっくり楽しめるコラム集です。",
};

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "OWNER_STORY":
      return "オーナーの本音ストーリー";
    case "MAINTENANCE":
      return "メンテナンスとトラブルの裏側";
    case "TECHNICAL":
      return "技術・歴史・ブランドの物語";
    default:
      return "COLUMN";
  }
}

export default async function ColumnPage() {
  const items = await getAllColumns();

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {/* 見出し */}
        <header className="mb-10">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            STORIES
          </p>
          <h1 className="font-display-serif mt-3 text-3xl font-semibold sm:text-4xl">
            コラムとストーリー
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-sub">
            オーナー目線のリアル、修理の裏側、技術や歴史の深掘りなど。
            一歩踏み込んだ長文読み物を、落ち着いたデザインで読みやすくまとめています。
          </p>
        </header>

        {/* コラム一覧 */}
        <div className="space-y-4">
          {items.map((item) => {
            const categoryLabel = mapCategoryLabel(item.category);

            return (
              <GlassCard
                key={item.id}
                as="article"
                className="transition hover:shadow-lg"
              >
                <Link href={`/column/${item.slug}`} className="block">
                  <div className="flex flex-col gap-2">
                    {/* カテゴリ */}
                    <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                      {categoryLabel}
                    </p>

                    {/* タイトル */}
                    <h2 className="font-display-serif text-lg font-semibold leading-snug">
                      {item.title}
                    </h2>

                    {/* メタ情報（投稿日／読了時間） */}
                    <div className="mt-1 flex items-center justify-between text-[11px] text-text-sub">
                      <p>{item.date}</p>
                      {item.readingTime && (
                        <p>{`${item.readingTime} min read`}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </GlassCard>
            );
          })}
        </div>

        {/* 0件のとき */}
        {items.length === 0 && (
          <p className="mt-10 text-center text-sm text-text-sub">
            まだコラムがありません。
          </p>
        )}
      </div>
    </main>
  );
}
