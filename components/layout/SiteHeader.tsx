// components/layout/SiteHeader.tsx
import Link from "next/link";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-tiffany-300 to-tiffany-500 shadow-soft-card" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold tracking-[0.3em] text-slate-700">
              CAR
            </span>
            <span className="text-xs font-semibold tracking-[0.3em] text-slate-700">
              BOUTIQUE
            </span>
          </div>
        </Link>

        <div className="hidden md:flex">
          <MainNav />
        </div>

        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
