import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

// lucide-react の代わりに SVG コンポーネントを定義
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

const IconSearch = ({ className }: { className?: string }) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

type HeritageSectionCardProps = {
  index: number;
  title: string;
  body: string;
  image?: string;
  className?: string;
  relatedCarQuery?: string;
};

export function HeritageSectionCard({
  index,
  title,
  body,
  image,
  className,
  relatedCarQuery,
}: HeritageSectionCardProps) {
  return (
    <Reveal delay={index * 100}>
      <section className={cn("relative scroll-mt-24", className)}>
        {/* 年代/世代ラベル */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-400">
            {index + 1}
          </span>
          <span className="h-px flex-1 bg-slate-100" />
        </div>

        <GlassCard className="overflow-hidden border border-slate-200/60 bg-white/90 p-0 shadow-soft-card">
          <div className="grid md:grid-cols-2">
            {/* 画像エリア */}
            {image ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 md:h-full md:aspect-auto">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={72}
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            ) : (
              <div className="flex items-center justify-center bg-slate-50 text-xs text-slate-400 md:h-full">
                No Image
              </div>
            )}

            {/* テキストエリア */}
            <div className="flex flex-col justify-center p-6 md:p-10">
              <h3 className="serif-heading mb-6 text-2xl text-slate-900">
                {title}
              </h3>
              <div className="space-y-4 text-[13px] leading-loose text-slate-600">
                {body.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* 在庫を見るボタン */}
              {relatedCarQuery && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    href={`/cars?q=${encodeURIComponent(relatedCarQuery)}`}
                    className="group inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-tiffany-600 transition-colors hover:text-tiffany-700"
                  >
                    <IconSearch className="h-3 w-3" />
                    <span>このモデルの在庫を見る</span>
                    <IconArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </section>
    </Reveal>
  );
}
