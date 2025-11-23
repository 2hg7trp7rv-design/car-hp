// components/home/CategoryCard.tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
}

export function CategoryCard({
  title: titleText,
  description,
  href,
  icon: Icon,
}: CategoryCardProps) {
  return (
    <Link href={href} className="block group">
      <div
        className={[
          "bg-white/80 backdrop-blur-sm rounded-3xl p-8 h-full",
          "border border-tiffany-100/60",
          "shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
          "hover:shadow-soft hover:-translate-y-1 hover:bg-white",
          "transition-all duration-300 ease-out",
          "flex flex-col",
        ].join(" ")}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="serif-font text-2xl font-bold tracking-tight text-foreground group-hover:text-tiffany-700 transition-colors">
            {titleText}
          </h3>
          {Icon && (
            <Icon className="h-6 w-6 text-tiffany-400 group-hover:text-tiffany-500 transition-colors" />
          )}
        </div>
        <p className="flex-grow leading-relaxed text-muted-foreground font-light">
          {description}
        </p>
        <div className="mt-6 flex justify-end">
          <span className="text-sm font-medium text-tiffany-600 group-hover:underline underline-offset-4 decoration-tiffany-300">
            Explore <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
