"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon } from "@/components/CinemaIcons";

const navLinks = [
  { label: "車種一覧", labelEn: "CARS", href: "/cars", long: false },
  { label: "実用ガイド", labelEn: "GUIDE", href: "/guide", long: false },
  { label: "考察コラム", labelEn: "COLUMN", href: "/column", long: false },
  { label: "系譜特集", labelEn: "HERITAGE", href: "/heritage", long: true },
] as const;

function isFooterInView() {
  if (typeof window === "undefined") return false;
  const footer = document.querySelector<HTMLElement>("[data-cbj-editorial-footer]");
  if (!footer) return false;
  const rect = footer.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top <= viewportHeight && rect.bottom >= 0;
}

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setFooterVisible(isFooterInView());
      });
    };

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(raf);
      mutationObserver.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const hideHeader = menuOpen || footerVisible;

  return (
    <>
      <nav
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[opacity,transform] duration-300 ${
          hideHeader ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
        aria-hidden={hideHeader}
      >
        <div className="pointer-events-auto relative overflow-hidden bg-[#111313] shadow-[0_18px_46px_rgba(0,0,0,0.22)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.13),transparent_35%),radial-gradient(circle_at_78%_34%,rgba(255,255,255,0.075),transparent_34%),linear-gradient(180deg,#2e3030_0%,#171919_50%,#050606_100%)] opacity-95"
          />
          <div className="relative mx-auto flex h-[clamp(72px,9.2svh,86px)] max-w-[1440px] items-center justify-between px-[clamp(22px,5.8svw,56px)]">
            <Link
              href="/"
              className="font-editorial text-[clamp(13px,3.45svw,22px)] uppercase leading-none tracking-[0.32em] text-white/[0.92] drop-shadow-[0_1px_6px_rgba(255,255,255,0.10)]"
            >
              CAR BOUTIQUE
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="メニューを開く"
              aria-expanded={menuOpen}
              className="-mr-1 grid h-[clamp(38px,10svw,54px)] w-[clamp(38px,10svw,54px)] place-items-center text-white/[0.82] transition-colors hover:text-white"
            >
              <MenuIcon size={34} strokeWidth={1.12} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[70] isolate overflow-y-auto overflow-x-hidden bg-[#151818]/[0.88] text-white backdrop-blur-[22px] transition-[opacity,visibility] duration-500 ${
          menuOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 min-h-full bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.15),transparent_30%),radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.10),transparent_34%),radial-gradient(circle_at_70%_78%,rgba(255,255,255,0.06),transparent_40%),linear-gradient(180deg,#343939_0%,#1b1f1f_34%,#090b0b_76%,#020303_100%)] opacity-[0.92]"
        />
        <div aria-hidden="true" className="absolute inset-0 min-h-full bg-black/[0.24]" />

        <div className="relative flex min-h-svh flex-col">
          <div className="flex h-[clamp(82px,11.2svh,102px)] shrink-0 items-center justify-between px-[clamp(22px,5.8svw,54px)]">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="font-editorial text-[clamp(13px,3.5svw,22px)] uppercase leading-none tracking-[0.30em] text-white/[0.70] drop-shadow-[0_1px_8px_rgba(255,255,255,0.10)]"
            >
              CAR BOUTIQUE
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="メニューを閉じる"
              className="grid h-[clamp(38px,10svw,54px)] w-[clamp(38px,10svw,54px)] place-items-center text-white/[0.74] transition-colors hover:text-white"
            >
              <CloseIcon size={28} strokeWidth={1.3} />
            </button>
          </div>

          <div className="flex flex-1 items-start justify-center px-[clamp(20px,5.6svw,54px)] pb-[calc(clamp(54px,10svh,82px)+env(safe-area-inset-bottom))] pt-[clamp(58px,8svh,84px)] text-center">
            <div className="w-full space-y-[clamp(54px,8svh,70px)]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="group mx-auto block w-fit"
                >
                  <span
                    className={`block font-editorial uppercase leading-[0.92] text-white/[0.52] drop-shadow-[0_8px_22px_rgba(0,0,0,0.26)] transition-colors duration-300 group-hover:text-white/[0.82] ${
                      link.long
                        ? "text-[clamp(35px,9.6svw,58px)] tracking-[0.18em]"
                        : "text-[clamp(38px,10.4svw,62px)] tracking-[0.20em]"
                    }`}
                  >
                    {link.labelEn}
                  </span>
                  <span className="mt-[clamp(12px,1.7svh,18px)] block text-[clamp(12px,3.0svw,16px)] leading-none tracking-[0.34em] text-white/[0.40] transition-colors duration-300 group-hover:text-white/[0.60]">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
