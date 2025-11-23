import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  // variantは不要になるので削除、または無視
}

export function CategoryCard({ title: titleText, description, href, icon: Icon }: CategoryCardProps) {
  return (
    <Link href={href} className="block group">
      <div 
        className="
          bg-white/80 backdrop-blur-sm rounded-3xl p-8 h-full
          border border-tiffany-100/50
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          hover:shadow-soft hover:-translate-y-1 hover:bg-white
          transition-all duration-300 ease-out
          flex flex-col
        "
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-tiffany-700 transition-colors serif-font">
            {titleText}
          </h3>
          {Icon && (
            <Icon className="w-6 h-6 text-tiffany-400 group-hover:text-tiffany-500 transition-colors" />
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed flex-grow font-light">
          {description}
        </p>
        <div className="mt-6 flex justify-end">
           <span className="text-sm text-tiffany-600 font-medium group-hover:underline underline-offset-4 decoration-tiffany-300">
             Explore <span aria-hidden="true">→</span>
           </span>
        </div>
      </div>
    </Link>
  );
}
