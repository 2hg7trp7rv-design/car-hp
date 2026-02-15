// components/heritage/HeritageToGuideSection.tsx

import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

// lucide-react の依存を削除し、SVGを直接定義
const IconArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

type Props = {
  guides: {
    slug: string;
    title: string;
    summary?: string;
    category?: string;
  }[];
};

export function HeritageToGuideSection({ guides }: Props) {
  if (guides.length === 0) return null;

  return (
    <section className="py-12">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-tiffany-600">
              OWNERSHIP REALITY
            </p>
            <h2 className="serif-heading mt-2 text-xl text-slate-900">
              このブランドと付き合うための現実的なガイド
            </h2>
          </div>
          <Link 
            href="/guide" 
            className="text-[11px] font-medium text-slate-500 hover:text-tiffany-600 transition-colors"
          >
            GUIDE一覧 →
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide, idx) => (
          <Reveal key={guide.slug} delay={idx * 100}>
            <Link href={`/guide/${guide.slug}`} className="group block h-full">
              <GlassCard 
                interactive 
                className="h-full flex flex-col justify-between p-5 border border-tiffany-100/50 bg-gradient-to-br from-white/90 to-vapor/80 hover:border-tiffany-300 transition-all duration-300"
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-tiffany-50 text-[10px] font-bold tracking-wider text-tiffany-700">
                      {guide.category || "GUIDE"}
                    </span>
                  </div>
                  <h3 className="serif-heading text-lg font-medium text-slate-900 group-hover:text-tiffany-600 transition-colors">
                    {guide.title}
                  </h3>
                  {guide.summary && (
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-500 line-clamp-2">
                      {guide.summary}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-end text-[11px] font-bold tracking-widest text-tiffany-600 group-hover:underline decoration-1 underline-offset-4">
                  READ MORE
                  <IconArrowRight className="ml-1 h-3 w-3" />
                </div>
              </GlassCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
