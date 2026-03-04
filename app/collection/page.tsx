import Link from "next/link";
import Image from "next/image";
import { collectionItems } from "@/lib/collection";

export default function CollectionPage() {
  return (
    <main>
      <header style={{ maxWidth: "980px" }}>
        <div className="eyebrow">COLLECTION</div>
        <h1 className="title-jp" style={{ margin: "14px 0 0" }}>拾い集める</h1>
        <p className="lead" style={{ margin: "16px 0 0" }}>
          まとまった説明は置かない。断片と余白の連なりだけを、静かに並べる。
        </p>
      </header>

      <div className="dash" style={{ marginTop: "clamp(22px, 3.6vw, 44px)" }} />

      <section className="tiles" aria-label="collection list">
        {collectionItems.map((it, idx) => {
          const offset = idx % 3 === 0 ? "offset-a" : idx % 3 === 1 ? "offset-b" : "offset-c";
          return (
            <article key={it.slug} className={`tile ${offset}`}>
              <Link href={`/collection/${it.slug}`} aria-label={it.title}>
                <div className="frame">
                  <div className="frame-inner">
                    <div className="frame-media" style={{ width: "100%", aspectRatio: "4 / 5" }}>
                      <Image
                        src={it.image}
                        alt=""
                        fill
                        sizes="(max-width: 860px) 92vw, 28vw"
                        style={{ objectFit: "cover", filter: "saturate(0.78) contrast(1.02)" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="meta">
                  <div className="t">{it.title}</div>
                  <div className="s">{it.subtitle}</div>
                  <div className="e">{it.excerpt}</div>
                </div>
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
