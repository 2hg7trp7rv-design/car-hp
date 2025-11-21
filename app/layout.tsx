// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Car Boutique",
  description: "シンプルで上質な大人のためのクルマ情報サイト",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/reviews", label: "試乗記" },
  { href: "/tech", label: "技術解説" },
  { href: "/used", label: "中古車" },
  { href: "/columns", label: "コラム" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-900"
              >
                CAR BOUTIQUE
              </Link>
              <nav className="hidden gap-6 text-[11px] font-medium text-neutral-600 sm:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="tracking-[0.16em] transition hover:text-neutral-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-neutral-200 bg-white/80">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-6 text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
              <p className="tracking-[0.18em] uppercase">
                © {new Date().getFullYear()} Car Boutique
              </p>
              <p>シンプルで上質なクルマの情報を、静かに丁寧に。</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
