// components/car/CompareSlider.tsx
"use client";

import React, {
  useState,
  useRef,
  useCallback,
  type MouseEvent,
  type TouchEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";

type CompareSliderProps = {
  /** 左側（Before） */
  leftImage: string;
  leftLabel?: string;
  leftAlt?: string;

  /** 右側（After） */
  rightImage: string;
  rightLabel?: string;
  rightAlt?: string;

  /** 初期位置 (0〜100) */
  initialPosition?: number;

  className?: string;
};

export default function CompareSlider({
  leftImage,
  leftLabel,
  leftAlt = "Left Image",
  rightImage,
  rightLabel,
  rightAlt = "Right Image",
  initialPosition = 50,
  className = "",
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(() =>
    Math.min(100, Math.max(0, initialPosition)),
  );
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** 位置更新（0〜100%に正規化） */
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  }, []);

  // --- Mouse events ---
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onMouseUp = () => {
    setIsDragging(false);
  };
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  // --- Touch events ---
  const onTouchStart = () => {
    setIsDragging(true);
  };
  const onTouchEnd = () => {
    setIsDragging(false);
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  // --- Keyboard accessibility ---
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`
        group relative w-full select-none overflow-hidden rounded-3xl
        bg-slate-900/5 shadow-soft-card touch-none
        ${className}
      `}
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-orientation="horizontal"
      aria-label="画像比較スライダー"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* 右側画像（After） */}
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={rightImage}
          alt={rightAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
          quality={72}
        />
        {rightLabel && (
          <div className="absolute bottom-4 right-4 z-10 rounded-full bg-slate-900/70 px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-md">
            {rightLabel}
          </div>
        )}
      </div>

      {/* 左側画像（Before・クリップ） */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden border-r border-white/30"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={leftImage}
          alt={leftAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
          quality={72}
        />
        {leftLabel && (
          <div className="absolute bottom-4 left-4 z-10 rounded-full bg-tiffany-600/90 px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-md">
            {leftLabel}
          </div>
        )}
      </div>

      {/* スライダーのハンドル（ドラッグ対象） */}
      <div
        className="absolute inset-y-0 z-20 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* 縦ライン */}
        <div className="porcelain h-full w-[2px] -translate-x-1/2 bg-white/95 shadow-[0_0_18px_rgba(15,23,42,0.45)]" />

        {/* 丸いハンドル */}
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`
              flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white
              bg-tiffany-500 text-white shadow-[0_6px_24px_rgba(10,186,181,0.5)]
              transition-transform duration-150
              group-hover:scale-105 active:scale-95
            `}
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              className="text-white"
              viewBox="0 0 24 24"
            >
              {/* 左矢印 */}
              <path d="M11 18l-6-6 6-6" />
              {/* 右矢印（同じ形を反転） */}
              <path d="M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* アクセシビリティ用の不可視レンジ（ポインタ操作を補助） */}
      <input
        type="range"
        min={0}
        max={100}
        value={sliderPosition}
        onChange={(e) =>
          setSliderPosition(Math.min(100, Math.max(0, Number(e.target.value))))
        }
        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
        aria-hidden="true"
      />
    </div>
  );
}
