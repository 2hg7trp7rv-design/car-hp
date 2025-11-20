// app/cars/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug } from "@/lib/cars";

type Props = {
  params: { slug: string };
};

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs text-gray-400">
          <Link href="/cars" className="underline underline-offset-2">
            車種一覧
          </Link>
          {" ＞ "}
          {car.name}
        </p>
        <h1 className="text-xl font-semibold text-white">{car.name}</h1>
        <p className="text-xs text-gray-400">
          {car.maker ?? "メーカー不明"}
          {car.releaseYear && `・${car.releaseYear}年`}
        </p>
        {car.difficulty === "advanced" && (
          <span className="inline-block rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
            マニアック解説あり
          </span>
        )}
      </header>

      {car.summary && (
        <section className="space-y-1 text-xs leading-relaxed text-gray-100">
          <h2 className="text-sm font-semibold text-white">どんなクルマか</h2>
          {car.summary
            .split("。")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line, idx) => (
              <p key={idx}>{line}。</p>
            ))}
        </section>
      )}

      {car.specHighlights && (
        <section className="space-y-1 text-xs text-gray-100">
          <h2 className="text-sm font-semibold text-white">押さえどころ</h2>
          <ul className="space-y-0.5">
            {car.specHighlights
              .split("・")
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .map((line, idx) => (
                <li key={idx}>・{line}</li>
              ))}
          </ul>
        </section>
      )}

      {car.pros && (
        <section className="space-y-1 text-xs text-gray-100">
          <h2 className="text-sm font-semibold text-white">良くなった点・強み</h2>
          <ul className="space-y-0.5">
            {car.pros
              .split("・")
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .map((line, idx) => (
                <li key={idx}>・{line}</li>
              ))}
          </ul>
        </section>
      )}

      {car.cons && (
        <section className="space-y-1 text-xs text-gray-100">
          <h2 className="text-sm font-semibold text-white">気になる点・弱み</h2>
          <ul className="space-y-0.5">
            {car.cons
              .split("・")
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .map((line, idx) => (
                <li key={idx}>・{line}</li>
              ))}
          </ul>
        </section>
      )}

      {car.changeSummary && (
        <section className="space-y-1 text-xs text-gray-100">
          <h2 className="text-sm font-semibold text-white">
            先代やライバルから変わったポイント
          </h2>
          {car.changeSummary
            .split("。")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line, idx) => (
              <p key={idx}>{line}。</p>
            ))}
        </section>
      )}

      {car.referenceUrl && (
        <section className="text-xs text-gray-300">
          <h2 className="mb-1 text-sm font-semibold text-white">参考リンク</h2>
          <a
            href={car.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-purple-300 underline underline-offset-2"
          >
            公式サイト・プレスリリースを見る
          </a>
        </section>
      )}
    </div>
  );
}
