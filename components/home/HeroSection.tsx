import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* 背景画像 */}
      <Image
        src="/images/hero-car.jpg" // 適切な画像パスに変更してください
        alt="Luxury Car"
        fill
        className="object-cover"
        priority
      />
      
      {/* オーバーレイ - ティファニーブルー系の明るいグラデーションに変更 */}
      <div className="absolute inset-0 bg-gradient-to-b from-tiffany-900/30 via-transparent to-background/90 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-tiffany-100/30" />

      {/* コンテンツ */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 pb-20 z-10">
        <h2 className="text-lg md:text-xl text-tiffany-100 tracking-[0.2em] mb-4 serif-font drop-shadow-sm">
          CAR BOUTIQUE
        </h2>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-md serif-font">
          Driving Elegance.
        </h1>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed font-medium drop-shadow">
          車のニュースと、その先にある物語を。<br />
          静かな時間の中で、愛車との未来を想うための場所です。
        </p>
      </div>
    </section>
  );
}
