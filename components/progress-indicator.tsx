"use client";

import { usePathname } from "next/navigation";
import { format2, getSectionMeta } from "@/lib/route-map";

export default function ProgressIndicator() {
  const pathname = usePathname() || "/";
  const meta = getSectionMeta(pathname);

  const placement = pathname === "/" ? "center" : "right";

  return (
    <div className={`progress ${placement}`} aria-hidden="true">
      <span>{format2(meta.index)}</span>
      <span className="slash">/</span>
      <span>{format2(meta.total)}</span>
    </div>
  );
}
