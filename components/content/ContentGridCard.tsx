import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  date?: string | null;
  imageSrc?: string | null;
  className?: string;
};

export function ContentGridCard({ href, title, date, imageSrc, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-[#222222]/10 bg-white shadow-soft transition",
        "hover:-translate-y-[1px] hover:border-[#0ABAB5]/35 hover:shadow-soft-card",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-[#F3F4F6]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 260px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="p-4">
        {date ? (
          <p className="text-[10px] tracking-[0.18em] text-[#222222]/45">
            {date}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#222222] group-hover:text-[#0ABAB5]">
          {title}
        </p>
      </div>
    </Link>
  );
}
