import { OG_SIZE, renderOgCard } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}｜${SITE.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({ title: "クルマのこと、いろはから。", label: SITE.tagline });
}
