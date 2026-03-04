import Link from "next/link";

const links = [
  { href: "/", label: "HOME", desc: "断片のトップ" },
  { href: "/collection", label: "COLLECTION", desc: "拾い集める" },
  { href: "/about", label: "ABOUT", desc: "説明しない、でも残す" },
  { href: "/contact", label: "CONTACT", desc: "必要最低限の接点" },
];

export default function MenuPage() {
  return (
    <main style={{ maxWidth: "980px" }}>
      <header>
        <div className="eyebrow">MENU</div>
        <h1 className="title-jp" style={{ margin: "14px 0 0" }}>索引</h1>
        <p className="lead" style={{ margin: "16px 0 0" }}>
          ここだけは、迷わないように。リンクは少なく、距離は長く。
        </p>
      </header>

      <div className="dash" style={{ marginTop: "clamp(22px, 3.6vw, 44px)" }} />

      <section style={{ marginTop: "clamp(18px, 3.2vw, 34px)" }}>
        {links.map((l, i) => (
          <div key={l.href} style={{ padding: "clamp(18px, 2.6vw, 26px) 0" }}>
            <Link href={l.href} style={{ display: "inline-block" }}>
              <div className="eyebrow" style={{ opacity: 0.88 }}>{String(i + 1).padStart(2, "0")} {l.label}</div>
              <div className="lead" style={{ marginTop: "10px", maxWidth: "620px" }}>{l.desc}</div>
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
