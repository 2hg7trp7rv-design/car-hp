import Image from "next/image";

type Props = {
  eyebrow: string;
  eyebrowNote?: string;
  title: string;
  subtitle: string;
};

function Pin({
  label,
  x,
  y,
  lx,
  ly,
  w,
}: {
  label: string;
  x: string;
  y: string;
  lx: string;
  ly: string;
  w: string;
}) {
  return (
    <div className="pin" aria-hidden="true">
      <div className="pin-label" style={{ left: x, top: y }}>{label}</div>
      <div className="pin-line" style={{ left: lx, top: ly, width: w }} />
      <div className="pin-dot" style={{ left: `calc(${lx} + ${w})`, top: `calc(${ly} - 1px)` }} />
    </div>
  );
}

export default function CollageHero(props: Props) {
  return (
    <section style={{ position: "relative", minHeight: "calc(100vh - 160px)" }}>
      <div className="collage-grid">
        {/* Left frame */}
        <div className="collage-left">
          <div className="frame">
            <div className="frame-inner">
              <div className="frame-media" style={{ width: "100%", aspectRatio: "3 / 4" }}>
                <Image
                  src="/demo/fragment-1.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 860px) 92vw, 33vw"
                  style={{ objectFit: "cover", filter: "saturate(0.78) contrast(1.02)" }}
                  priority
                />
                <Pin label="#痕跡" x="44%" y="42%" lx="46%" ly="50%" w="54px" />
              </div>
            </div>
          </div>

          <div className="caption-xy" style={{ marginTop: "10px" }}>
            <div><b>left:</b> 20px</div>
            <div><b>top:</b> -10px</div>
          </div>
        </div>

        {/* Center small square */}
        <div className="collage-mid">
          <div className="frame">
            <div className="frame-inner">
              <div className="frame-media" style={{ width: "100%", aspectRatio: "1 / 1" }}>
                <Image
                  src="/demo/fragment-3.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 860px) 92vw, 22vw"
                  style={{ objectFit: "cover", filter: "saturate(0.72) contrast(1.02)" }}
                />
                <Pin label="#消えそうな色" x="20%" y="74%" lx="24%" ly="82%" w="86px" />
              </div>
            </div>
          </div>

          <div className="caption-xy" style={{ marginTop: "10px" }}>
            <div><b>left:</b> -20px</div>
            <div><b>top:</b> 30px</div>
          </div>
        </div>

        {/* Right wide frame + typography */}
        <div className="collage-right">
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", marginTop: "clamp(8px, 1.2vw, 18px)" }}>
            <div className="frame-media" style={{ width: "100%", height: "100%" }}>
              <Image
                src="/demo/fragment-2.jpg"
                alt=""
                fill
                sizes="(max-width: 860px) 92vw, 55vw"
                style={{ objectFit: "cover", filter: "saturate(0.72) contrast(1.02)" }}
              />
              <Pin label="#8" x="58%" y="52%" lx="60%" ly="60%" w="42px" />
            </div>
          </div>

          <div className="caption-xy" style={{ marginTop: "10px" }}>
            <div><b>left:</b> -20px</div>
            <div><b>top:</b> 30px</div>
          </div>

          <div style={{ marginTop: "clamp(18px, 2.4vw, 28px)", maxWidth: "720px" }}>
            <div className="eyebrow">{props.eyebrow} <span style={{ fontSize: "13px", letterSpacing: "0.02em", opacity: 0.62 }}>13px</span></div>
            {props.eyebrowNote ? <div className="small-note" style={{ marginTop: "6px" }}>{props.eyebrowNote}</div> : null}
            <h1 className="title-jp" style={{ margin: "12px 0 0", whiteSpace: "pre-line" }}>{props.title}</h1>
            <p className="lead" style={{ margin: "16px 0 0", maxWidth: "560px" }}>{props.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="right-rail" aria-hidden="true">
        <span className="muted">Copyr. Disappearance</span>&nbsp;&nbsp;Address&nbsp;11230&nbsp;T&nbsp;8th&nbsp;Street&nbsp;Info
      </div>
    </section>
  );
}
