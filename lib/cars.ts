// lib/cars.ts

export type Car = {
  id: string;
  name: string;
  slug: string;
  maker: string | null;
  releaseYear: number | null;
  difficulty: string | null;
  summary: string | null;
  specHighlights: string | null;
  pros: string | null;
  cons: string | null;
  changeSummary: string | null;
  referenceUrl: string | null;
};

// Notionの代わりに、ここに直接データを書きます
// 必要に応じてこのリストに車を追加していくだけでOKです
const STATIC_CARS: Car[] = [
  {
    id: 'bmw-530i-g30',
    name: 'BMW 530i M Sport (G30)',
    slug: 'bmw-530i-g30',
    maker: 'BMW',
    releaseYear: 2018,
    difficulty: 'advanced',
    summary: '「ビジネスアスリート」の異名を持つ、Dセグメントセダンのベンチマーク。静粛性とスポーツ性能のバランスが極めて高いレベルで融合している。',
    specHighlights: '直列4気筒2.0Lターボエンジンは252psを発揮。M Sportサスペンションによる引き締まった足回りが特徴。',
    pros: '高速巡航時の圧倒的なスタビリティ。\nジェスチャーコントロールなどの先進機能。',
    cons: 'ランフラットタイヤによる若干の硬さ。\nボディサイズが大きく、狭い駐車場では気を使う。',
    changeSummary: 'F10型と比較して約100kgの軽量化に成功。アルミニウム合金を多用し、ハンドリングの軽快感が増した。',
    referenceUrl: 'https://www.bmw.co.jp',
  },
  {
    id: 'toyota-crown-sport',
    name: 'TOYOTA CROWN SPORT',
    slug: 'crown-sport',
    maker: 'TOYOTA',
    releaseYear: 2023,
    difficulty: 'basic',
    summary: '新しいクラウン群の中でも最もエモーショナルなデザインを持つSUV。走りを楽しむためのクラウンとして位置づけられている。',
    specHighlights: '2.5LハイブリッドシステムとE-Fourの組み合わせ。後輪操舵（DRS）により、小回りと高速安定性を両立。',
    pros: '一目で心を奪われるスタイリング。\nクラウンらしい上質な乗り心地と静粛性。',
    cons: 'ラゲッジスペースはスタイリング優先のためやや狭め。\n後席の窓が小さく、閉塞感を感じる場合がある。',
    changeSummary: '従来のセダンイメージを完全に打破。TNGAプラットフォームをベースに、スポーツ走行に特化したチューニングが施された。',
    referenceUrl: null,
  },
];

export async function getAllCars(): Promise<Car[]> {
  // データを返すだけ（非同期を模倣）
  return Promise.resolve(STATIC_CARS);
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const car = STATIC_CARS.find((c) => c.slug === slug);
  return Promise.resolve(car || null);
}
