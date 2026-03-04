"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { format2, getSectionMeta } from "@/lib/route-map";

type NavItem = {
  href: string;
  label: string;
  corner: "TL" | "TR" | "BL" | "BR";
};

const items: NavItem[] = [
  { href: "/menu", label: "MENU", corner: "TL" },
  { href: "/about", label: "ABOUT", corner: "TR" },
  { href: "/collection", label: "COLLECTION", corner: "BL" },
  { href: "/contact", label: "CONTACT", corner: "BR" },
];

function cornerClass(corner: NavItem["corner"]) {
  if (corner === "TL") return "corner cornerTL";
  if (corner === "TR") return "corner cornerTR";
  if (corner === "BL") return "corner cornerBL";
  return "corner cornerBR";
}

export default function CornerNav() {
  const pathname = usePathname() || "/";
  const meta = getSectionMeta(pathname);

  return (
    <>
      {items.map((it) => {
        const isCurrent = pathname === it.href || (it.href === "/collection" && pathname.startsWith("/collection"));
        const showNumber = it.corner === "TL";

        return (
          <nav key={it.href} className={cornerClass(it.corner)} aria-label={it.label}>
            <Link href={it.href} aria-current={isCurrent ? "page" : undefined} style={{ opacity: isCurrent ? 0.95 : undefined }}>
              {showNumber ? <span className="num">{format2(meta.index)}</span> : null}
              <span className="label">{it.label}</span>
            </Link>
          </nav>
        );
      })}
    </>
  );
}
