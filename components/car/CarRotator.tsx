// components/car/CarRotator.tsx
"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MouseEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";

type CarRotatorProps = {
  /** 360度画像のURL配列（通常36〜72枚想定） */
  images?: string[];
  /** 単一画像のみの利用時（互換用） */
  imageUrl?: string;
  /** Tailwindのアスペクト比クラス (default: aspect-[16/9]) */
  aspectRatio?: string;
  className?: string;
  /** 自動回転の有無 */
  autoRotate?: boolean;
};

/**
 * Haptic 360° Car Viewer
 * ドラッグ操作により車両を回転させ、擬似的な「触れる」体験を提供するコンポーネント。
 *
 * - images があれば 360° ビュー
 * - images が無く imageUrl のみあれば 1枚の画像を静的表示
 */
export function CarRotator({
  images,
  imageUrl,
  aspectRatio = "aspect-[16/9]",
  className = "",
  autoRotate = false,
}: CarRotatorProps) {
  // 実際に使うフレーム配列（images 優先・なければ imageUrl 1枚）
  const frames = images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const totalFrames = frames.length;

  // State Management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sensitivity = 15; // ドラッグ感度 (値が大きいほど重厚な回転になる)

  // ローディング進捗計算
  const isAllLoaded = loadedCount >= totalFrames && totalFrames > 0;
  const progress =
    totalFrames > 0 ? Math.round((loadedCount / totalFrames) * 100) : 0;

  // 画像プリロード処理
  useEffect(() => {
    if (totalFrames === 0) return;

    let mounted = true;

    const preloadImages = () => {
      frames.forEach((src) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
          if (mounted) setLoadedCount((prev) => prev + 1);
        };
        img.onerror = () => {
          // エラー時もカウントアップしてスタックを防ぐ
          if (mounted) setLoadedCount((prev) => prev + 1);
        };
      });
    };

    preloadImages();
    return () => {
      mounted = false;
    };
  }, [frames, totalFrames]);

  // 自動回転ロジック (インタラクションがあるまでゆっくり回る演出)
  useEffect(() => {
    if (!autoRotate || hasInteracted || !isAllLoaded || isDragging) return;
    if (totalFrames <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalFrames);
    }, 100); // 100msごとにフレーム送り

    return () => clearInterval(interval);
  }, [autoRotate, hasInteracted, isAllLoaded, isDragging, totalFrames]);

  // --- Event Handlers (Haptic Logic) ---

  const handleStart = (clientX: number) => {
    if (!isAllLoaded || totalFrames <= 1) return;
    setIsDragging(true);
    setStartX(clientX);
    setHasInteracted(true);
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || totalFrames <= 1) return;

      // 移動量（Delta）を計算
      const delta = startX - clientX;

      // 感度を超えた場合のみフレームを更新（無駄なレンダリング抑制）
      if (Math.abs(delta) > sensitivity) {
        const direction = delta > 0 ? 1 : -1; // 正なら右回転、負なら左回転

        setCurrentIndex((prev) => {
          let next = prev + direction;
          // ループ処理: 最後の次は最初へ、最初の前は最後へ
          if (next >= totalFrames) next = 0;
          if (next < 0) next = totalFrames - 1;
          return next;
        });

        // 次の計算のために始点をリセット（連続的なドラッグに対応）
        setStartX(clientX);
      }
    },
    [isDragging, startX, sensitivity, totalFrames],
  );

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse Events
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleStart(e.clientX);
  };
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => handleEnd();

  // Touch Events
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    handleStart(e.touches[0].clientX);
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };
  const onTouchEnd = () => handleEnd();

  // 画像がない場合のフォールバック
  if (totalFrames === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400 ${aspectRatio}`}
      >
        NO IMAGES
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full overflow-hidden rounded-2xl bg-slate-50 shadow-inner
        ${aspectRatio} ${className} 
        ${isAllLoaded ? "cursor-grab active:cursor-grabbing" : "cursor-wait"}
        touch-none select-none
      `}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="360度ビューワー。ドラッグして回転できます。"
    >
      {/* 360 Badge (Tiffany Style) */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
        <div className="relative h-2 w-2">
          <div className="absolute inset-0 animate-ping rounded-full bg-tiffany-400 opacity-75" />
          <div className="relative h-2 w-2 rounded-full bg-tiffany-500" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.2em] text-slate-900">
          360° VIEW
        </span>
      </div>

      {/* Loading Overlay */}
      {!isAllLoaded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="mb-3 text-[10px] font-bold tracking-[0.3em] text-slate-400 animate-pulse">
            LOADING EXPERIENCE
          </div>
          {/* Progress Bar */}
          <div className="h-[2px] w-32 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-tiffany-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-[9px] font-medium text-tiffany-600">
            {progress}%
          </div>
        </div>
      )}

      {/* Interaction Guide (Initial only) */}
      {isAllLoaded && !hasInteracted && !autoRotate && totalFrames > 1 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex animate-fade-in-up flex-col items-center gap-3 rounded-2xl bg-slate-900/60 px-6 py-4 backdrop-blur-md transition-opacity duration-700">
            <div className="flex gap-4 opacity-80">
              <svg
                className="h-5 w-5 animate-bounce-horizontal-left text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0 7-7m-7 7h18"
                />
              </svg>
              <svg
                className="h-5 w-5 animate-bounce-horizontal-right text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0-7 7m7-7H3"
                />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-[0.2em] text-white">
              DRAG TO ROTATE
            </span>
          </div>
        </div>
      )}

      {/* Image Renderer Layer */}
      <div className="relative h-full w-full">
        {frames.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Vehicle Angle ${index}`}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className={`object-cover transition-opacity duration-100 ${
              index === currentIndex ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            draggable={false}
            priority={index === 0}
          />
        ))}
      </div>

      {/* Bottom Indicator (Slider Style) */}
      {totalFrames > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center px-4">
          <div className="relative h-1 w-full max-w-[120px] rounded-full bg-slate-900/10 backdrop-blur-sm">
            <div
              className="absolute top-0 h-full rounded-full bg-tiffany-500 shadow-[0_0_10px_rgba(10,186,181,0.5)] transition-all duration-75 ease-out"
              style={{
                width: "20%",
                left: `${(currentIndex / totalFrames) * 80}%`, // 簡易的な位置計算 (100% - width%)
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CarRotator;
