// app/cars/[slug]/page.tsx

import { getCarBySlug, getAllCars } from "@/lib/cars";
import { notFound } from "next/navigation";
import Image from "next/image";

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((c) => ({ slug: c.slug }));
}

export default async function CarDetailPage({ params }: { params: { slug: string } }) {
  const car = await getCarBySlug(params.slug);

  if (!car) return notFound();

  // 追加：アクセントカラー
  const accentColor = car.accentColor ?? "#0fb8b3";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5fbfb] to-white pb-20">
      {/* ヒーロー */}
      <section
        className="relative w-full h-[320px] sm:h-[420px] flex items-end justify-start"
        style={{
          background: `linear-gradient(to right, ${accentColor}33, transparent)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 p-6 sm:p-10">
          <h1 className="font-display-serif text-3xl sm:text-5xl font-bold text-gray-900 drop-shadow-md">
            {car.name}
          </h1>
          <p className="text-gray-800 mt-2">{car.summary}</p>
        </div>
      </section>

      {/* スペック */}
      <section className="px-6 sm:px-10 mt-10 space-y-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 font-display-serif">主要スペック</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700">
            <div>
              <p className="font-medium">年式</p>
              <p>{car.releaseYear ?? "–"}</p>
            </div>
            <div>
              <p className="font-medium">エンジン</p>
              <p>{car.engine ?? "–"}</p>
            </div>
            <div>
              <p className="font-medium">最高出力</p>
              <p>{car.powerPs ? `${car.powerPs}ps` : "–"}</p>
            </div>
            <div>
              <p className="font-medium">トルク</p>
              <p>{car.torqueNm ? `${car.torqueNm}Nm` : "–"}</p>
            </div>
            <div>
              <p className="font-medium">駆動方式</p>
              <p>{car.drive ?? "–"}</p>
            </div>
          </div>
        </div>

        {/* pros / cons */}
        {car.pros && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 font-display-serif">好きになれるポイント</h2>
            <pre className="whitespace-pre-wrap text-gray-700">{car.pros}</pre>
          </div>
        )}

        {car.cons && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 font-display-serif">気になるポイント</h2>
            <pre className="whitespace-pre-wrap text-gray-700">{car.cons}</pre>
          </div>
        )}
      </section>

      {/* 参考URL */}
      {car.referenceUrl && (
        <div className="px-6 sm:px-10 mt-10">
          <a
            href={car.referenceUrl}
            target="_blank"
            className="text-blue-600 underline text-sm"
          >
            メーカー公式ページを見る
          </a>
        </div>
      )}
    </main>
  );
}
