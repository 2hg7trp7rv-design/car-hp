import Image from "next/image";

export default function AboutPage() {
  return (
    <main style={{ maxWidth: "1100px" }}>
      <header style={{ maxWidth: "820px" }}>
        <div className="eyebrow">ABOUT</div>
        <h1 className="title-jp" style={{ margin: "14px 0 0" }}>説明しない美学</h1>
        <p className="lead" style={{ margin: "16px 0 0" }}>
          ここは理念を並べる場所ではない。断片と余白が、結果だけを残す。
        </p>
      </header>

      <div style={{ height: "clamp(24px, 4vw, 48px)" }} />
      <div className="dash" />

      <section className="about-grid" aria-label="about fragments">
        <div className="about-left">
          <div className="frame">
            <div className="frame-inner">
              <div className="frame-media" style={{ width: "100%", aspectRatio: "3 / 4" }}>
                <Image
                  src="/demo/fragment-3.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 860px) 92vw, 38vw"
                  style={{ objectFit: "cover", filter: "saturate(0.74) contrast(1.02)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="about-right">
          <p className="lead">
            “わかりやすい”は、ときに雑になる。CBJは、説明を削って、温度だけを残す実験をする。
          </p>

          <div style={{ height: "18vh" }} />

          <p className="lead">
            情報が必要な場面では、別のレイヤーで出す。ここは、空気のレイヤー。
          </p>
        </div>
      </section>
    </main>
  );
}
