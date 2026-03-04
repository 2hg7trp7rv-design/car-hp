import type { Metadata } from "next";
import "./globals.css";
import { Noto_Serif_JP, Cormorant_Garamond } from "next/font/google";
import CornerNav from "@/components/corner-nav";
import GrainOverlay from "@/components/grain-overlay";
import ProgressIndicator from "@/components/progress-indicator";

const jp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jp",
  display: "swap",
});

const latin = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Car Boutique Journal",
  description: "Atmospheric layout reset demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${jp.variable} ${latin.variable}`}>
      <body>
        <div className="cbj-shell">
          <GrainOverlay />
          <CornerNav />
          <ProgressIndicator />
          <div className="cbj-stage">{children}</div>
        </div>
      </body>
    </html>
  );
}
