import Image from "next/image";
import { notFound } from "next/navigation";
import { collectionItems } from "@/lib/collection";

export function generateStaticParams() {
  return collectionItems.map((it) => ({ slug: it.slug }));
}

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const item = collectionItems.find((it) => it.slug === params.slug);
  if (!item) return notFound();

  return (
    <main style={{ maxWidth: "1100px" }}>
      <header style={{ maxWidth: "760px" }}>
        <div className="eyebrow">COLLECTION / {item.tags.join(" / ")}</div>
        <h1 className="title-jp" style={{ margin: "14px 0 0", whiteSpace: "pre-line" }}>{item.title}</h1>
        <p className="lead" style={{ margin: "16px 0 0" }}>{item.subtitle}</p>
      </header>

      <div style={{ height: "clamp(28px, 5vw, 70px)" }} />

      <div className="frame" style={{ maxWidth: "920px" }}>
        <div className="frame-inner">
          <div className="frame-media" style={{ width: "100%", aspectRatio: "16 / 9" }}>
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 860px) 92vw, 60vw"
              style={{ objectFit: "cover", filter: "saturate(0.78) contrast(1.02)" }}
              priority
            />
          </div>
        </div>
      </div>

      <div style={{ height: "clamp(26px, 4vw, 56px)" }} />

      <article style={{ maxWidth: "720px" }}>
        <p className="lead">
          ここには、説明のための説明を置かない。写真と余白が先に立ち、文章は後から追いつく。
        </p>

        <div style={{ height: "26vh" }} />

        <p className="lead">
          読者が触れるのは、結論ではなく手触りだ。断片が揃った瞬間にだけ、意味が見える。
        </p>

        <div style={{ height: "22vh" }} />

        <p className="lead">
          もし説明が必要なら、別のページに逃がす。ここは、沈黙のまま置く。
        </p>
      </article>
    </main>
  );
}
