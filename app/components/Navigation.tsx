"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon } from "@/components/CinemaIcons";

const navLinks = [
  { label: "ガイド", labelEn: "GUIDE", href: "/guide" },
  { label: "コラム", labelEn: "COLUMN", href: "/column" },
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
        <div className="pointer-events-auto relative border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
          <div className="relative mx-auto flex h-[clamp(64px,8.4svh,76px)] max-w-[1440px] items-center justify-between px-[clamp(22px,5.8svw,56px)]">
            <Link
              href="/"
              className="font-editorial text-[clamp(13px,3.45svw,20px)] font-bold uppercase leading-none tracking-[0.32em] text-[var(--ink)]"
            >
              CBJ
            </Link>
            <div className="flex items-center gap-[clamp(10px,2.6svw,28px)]">
              <div className="hidden items-center gap-[clamp(14px,2.4svw,26px)] sm:flex">
                {navLinks.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative pb-1 text-[12px] font-medium tracking-[0.18em] transition-colors ${
                        active
                          ? "text-[var(--teal)] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[var(--teal)]"
                          : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="メニューを開く"
                aria-expanded={menuOpen}
                className="-mr-1 grid h-[clamp(38px,10svw,48px)] w-[clamp(38px,10svw,48px)] place-items-center text-[var(--ink)] transition-colors hover:text-[var(--teal)]"
              >
                <MenuIcon size={30} strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[70] isolate overflow-y-auto overflow-x-hidden bg-[var(--paper)]/[0.97] text-[var(--ink)] backdrop-blur-[18px] transition-[opacity,visibility] duration-500 ${
          menuOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 min-h-full bg-[radial-gradient(circle_at_18%_8%,rgba(14,124,123,0.07),transparent_32%),radial-gradient(circle_at_78%_80%,rgba(229,96,76,0.06),transparent_36%)]"
        />

        <div className="relative flex min-h-svh flex-col">
          <div className="flex h-[clamp(76px,10.4svh,96px)] shrink-0 items-center justify-between border-b border-[var(--line)] px-[clamp(22px,5.8svw,54px)]">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="font-editorial text-[clamp(13px,3.5svw,20px)] font-bold uppercase leading-none tracking-[0.30em] text-[var(--ink)]"
            >
              CBJ
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="メニューを閉じる"
              className="grid h-[clamp(38px,10svw,48px)] w-[clamp(38px,10svw,48px)] place-items-center text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              <CloseIcon size={26} strokeWidth={1.4} />
            </button>
          </div>

          <div className="flex flex-1 items-start justify-center px-[clamp(20px,5.6svw,54px)] pb-[calc(clamp(54px,10svh,82px)+env(safe-area-inset-bottom))] pt-[clamp(58px,8svh,84px)] text-center">
            <div className="w-full space-y-[clamp(54px,8svh,70px)]">
              {navLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="group mx-auto block w-fit"
                  >
                    <span
                      className={`block font-editorial text-[clamp(38px,10.4svw,62px)] font-bold uppercase leading-[0.92] tracking-[0.20em] transition-colors duration-300 ${
                        active ? "text-[var(--teal)]" : "text-[var(--ink)] group-hover:text-[var(--teal)]"
                      }`}
                    >
                      {link.labelEn}
                    </span>
                    <span className="mt-[clamp(12px,1.7svh,18px)] block text-[clamp(12px,3.0svw,16px)] leading-none tracking-[0.34em] text-[var(--ink-soft)] transition-colors duration-300 group-hover:text-[var(--ink)]">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
