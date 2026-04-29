// app/start/page.tsx
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "サイトマップへ移動",
  description: "主要カテゴリをまとめたサイトマップへ移動します。",
  robots: { index: false, follow: true },
};

export default function StartPage() {
  permanentRedirect("/site-map");
}
