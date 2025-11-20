// app/cars/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getCarBySlug } from "@/lib/cars";

type Props = {
  params: {
    slug: string;
  };
};

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">{car.name}</h1>
        <p className="text-xs text-gray-400">
          {car.maker ?? "メーカー不明"}
          {car.releaseYear && `・${car.releaseYear}年`}
        </p>
      </header>

      <section className="space-y-2 text-xs text-gray-200">
        <h2 className="text-sm font-semibold text-white">概要</h2>
        <p className="whitespace-pre-line">{car.summary}</p>
      </section>

      <section className="space-y-2 text-xs text-gray-200">
        <h2 className="text-sm font-semibold text-white">スペックの押さえどころ</h2>
        <p className="whitespace-pre-line">{car.specHighlights}</p>
      </section>

      <section className="grid gap-4 text-xs text-gray-200 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white">良くなった点／強み</h2>
          <p className="whitespace-pre-line">{car.pros}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white">気になる点／弱み</h2>
          <p className="whitespace-pre-line">{car.cons}</p>
        </div>
      </section>

      <section className="space-y-2 text-xs text-gray-200">
        <h2 className="text-sm font-semibold text-white">何が変わったか要約</h2>
        <p className="whitespace-pre-line">{car.changeSummary}</p>
      </section>

      {car.referenceUrl && (
        <section className="text-xs text-gray-400">
          <a
            href={car.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-purple-300"
          >
            メーカー公式サイト・プレスリリースを見る
          </a>
        </section>
      )}
    </div>
  );
}
