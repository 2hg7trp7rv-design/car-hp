// app/cars/[slug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCars, getCarBySlug, CarDetail } from "@/lib/cars";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars
    .filter((car) => !!car.slug)
    .map((car) => ({
      slug: car.slug,
    }));
}

function formatYear(year: number | null): string {
  if (!year) return "";
  return `${year}年`;
}

function DifficultyBadge({ difficulty }: { difficulty: CarDetail["difficulty"] }) {
  if (difficulty !== "advanced") return null;
  return (
    <span className="ml-2 rounded bg-purple-600 px-2 py-0.5 text-[10px] font-semibold text-white">
      マニアック解説あり
    </span>
  );
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-6 text-gray-100">
      {/* パンくず */}
      <nav className="text-xs text-gray-400">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>
        <span className="mx-1">›</span>
        <Link href="/cars" className="hover:underline">
          車種一覧
        </Link>
        <span className="mx-1">›</span>
        <span>{car.name}</span>
      </nav>

      {/* タイトルブロック */}
      <header className="space-y-2 rounded-lg bg-gray-900/70 p-4 shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">{car.name}</h1>
            <p className="mt-1 text-sm text-gray-400">
              {car.maker ?? "メーカー不明"}
              {car.releaseYear && <>・{formatYear(car.releaseYear)}</>}
              <DifficultyBadge difficulty={car.difficulty} />
            </p>
          </div>
        </div>
        {car.summary && (
          <p className="mt-2 text-sm leading-relaxed text-gray-200">
            {car.summary}
          </p>
        )}
        {!car.summary && (
          <p className="mt-2 text-xs text-gray-400">
            概要テキストは準備中です。Notionの「summary」に入力するとここに表示されます。
          </p>
        )}
      </header>

      {/* メインコンテンツ */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* 左カラム */}
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-900/70 p-4">
            <h2 className="text-sm font-semibold text-white">
              ざっくり押さえどころ
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              {car.specHighlights ??
                "Notionの「spec_highlights」に、この車のポイントを2〜5行で入力するとここに表示されます。"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-900/70 p-4">
            <h2 className="text-sm font-semibold text-green-300">
              良くなったところ・強み
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              {car.pros ??
                "Notionの「pros」に、良くなった点・おすすめポイントを書いておくとここに表示されます。"}
            </p>
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-900/70 p-4">
            <h2 className="text-sm font-semibold text-red-300">
              気になるところ・弱み
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              {car.cons ??
                "Notionの「cons」に、少し気になる点や注意点を書いておくとここに表示されます。"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-900/70 p-4">
            <h2 className="text-sm font-semibold text-blue-300">
              先代モデルから「何が変わったか」
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              {car.changeSummary ??
                "Notionの「change_summary」に、先代やライバルと比べてどう変わったかを書いておくとここに表示されます。"}
            </p>
          </div>
        </div>
      </section>

      {/* 参考リンク */}
      <section className="rounded-lg bg-gray-900/70 p-4">
        <h2 className="text-sm font-semibold text-white">参考リンク</h2>
        {car.referenceUrl ? (
          <a
            href={car.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-blue-300 underline hover:text-blue-200"
          >
            公式サイト・プレスリリースなどを見る
          </a>
        ) : (
          <p className="mt-2 text-xs text-gray-400">
            Notionの「reference_url」に公式サイトなどのURLを入れると表示されます。
          </p>
        )}
      </section>
    </main>
  );
}
