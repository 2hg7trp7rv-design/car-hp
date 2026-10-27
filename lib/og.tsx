import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#1E2440";
const SUN = "#FFC93C";
const CORAL = "#FF5A4E";
const SKY = "#3AA8F0";

/** 画像に使う文字だけを含む丸ゴシックを Google Fonts から取得する（ビルド時のみ）。 */
async function loadRoundFont(text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@800&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error("OGP用フォントを取得できませんでした");
  return (await fetch(src)).arrayBuffer();
}

async function avatar(name: "shuna" | "rina"): Promise<string> {
  const data = await readFile(join(process.cwd(), "assets/og", `${name}.png`), "base64");
  return `data:image/png;base64,${data}`;
}

export async function renderOgCard({ title, label }: { title: string; label: string }) {
  const logoText = "クルマのいろは";
  const font = await loadRoundFont(`${title.replace(/\n/g, "")}${label}${logoText}`);
  const [shuna, rina] = await Promise.all([avatar("shuna"), avatar("rina")]);
  const circle = { width: 132, height: 132, borderRadius: 66, border: `6px solid ${INK}` };

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: SUN, padding: 48, fontFamily: "Round" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            background: "#FFFFFF",
            border: `6px solid ${INK}`,
            borderRadius: 40,
            boxShadow: `12px 12px 0 ${INK}`,
            padding: "44px 52px",
            color: INK,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "4px 22px",
                border: `4px solid ${INK}`,
                borderRadius: 999,
                background: SKY,
                fontSize: 30,
              }}
            >
              {label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 68, lineHeight: 1.3 }}>
              {title.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 34 }}>
              <span>クルマの</span>
              {[
                ["い", CORAL, "#FFFFFF"],
                ["ろ", SUN, INK],
                ["は", SKY, "#FFFFFF"],
              ].map(([ch, bg, fg]) => (
                <span
                  key={ch}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    border: `4px solid ${INK}`,
                    background: bg,
                    color: fg,
                    fontSize: 36,
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <img src={shuna} alt="" style={circle} />
              <img src={rina} alt="" style={circle} />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Round", data: font, weight: 800, style: "normal" }] },
  );
}
