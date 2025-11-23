import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* 背景画像 - 指示通りのファイル名を使用 */}
      <Image
        src="/images/hero-sedan.jpg"
        alt="Luxury Car"
        fill
        className="object-cover"
        priority
      />
      
      {/* オーバーレイ - 明るいティファニーブルー系のグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-tiffany-900/20 via-transparent to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-tiffany-100/20 mix-blend-overlay" />

      {/* コンテンツ */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 pb-20 z-10">
        <h2 className="text-lg md:text-xl text-tiffany-50 tracking-[0.2em] mb-4 font-serif drop-shadow-sm">
          CAR BOUTIQUE
        </h2>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-md font-serif">
          Driving Elegance.
        </h1>
        <p className="text-white/95 text-lg md:text-xl max-w-2xl leading-relaxed font-medium drop-shadow-md">
          車のニュースと、その先にある物語を。<br />
          静かな時間の中で、愛車との未来を想うための場所です。
        </p>
      </div>
    </section>
  );
}
