// components/ui/Breadcrumb.tsx
import Link from 'next/link';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-white/50 mb-6 font-mono">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/80" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
