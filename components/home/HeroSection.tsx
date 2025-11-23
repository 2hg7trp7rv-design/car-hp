// components/home/HeroSection.tsx
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* 背景画像 */}
      <Image
        src="/images/hero-sedan.jpg"
        alt="Luxury sedan in motion"
        fill
        className="object-cover"
        priority
      />

      {/* オーバーレイ ティファニーブルー系と背景ホワイトのミックス */}
      <div className="absolute inset-0 bg-gradient-to-b from-tiffany-900/30 via-transparent to-background/90 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-tiffany-100/30" />

      {/* コンテンツ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-20 text-center z-10">
        <p className="serif-font text-sm md:text-base tracking-[0.35em] text-tiffany-100 mb-4 drop-shadow-sm">
          CAR BOUTIQUE
        </p>
        <h1 className="serif-font text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-md">
          Driving Elegance.
        </h1>
        <p className="text-white/90 text-base md:text-xl max-w-2xl leading-relaxed font-medium drop-shadow">
          車のニュースと、その先にある物語を。
          <br />
          静かな時間の中で、愛車との未来を想うための場所です。
        </p>
      </div>
    </section>
  );
}
