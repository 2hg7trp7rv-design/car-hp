import Link from "next/link";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  const latest = await getLatestNews(5);

  return (
    <main className="min-h-screen">
      {/* ここにヒーローなど既存のセクション */}

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-wide serif-font">
            LATEST NEWS
          </h2>
          <Link
            href="/news"
            className="text-xs font-semibold tracking-[0.2em] text-accent-foreground"
          >
            VIEW ALL NEWS →
          </Link>
        </div>

        <div className="space-y-4">
          {latest.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm"
            >
              <div className="mb-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-semibold">{item.source}</span>
                <span>{item.publishedAt}</span>
              </div>

              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="mb-1 text-sm font-medium leading-snug hover:text-primary">
                  {item.title}
                </h3>
              </Link>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ここに他のセクション */}
    </main>
  );
}
