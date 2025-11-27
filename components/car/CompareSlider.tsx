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
  /**
   * 比較の「Before」となる画像（左側）。
   * 旧モデル、カモフラージュ、コンセプトスケッチなどを想定。
   */
  beforeImage: string;
  beforeLabel?: string;
  beforeAlt?: string;

  /**
   * 比較の「After」となる画像（右側）。
   * 新モデル、実車、完成形などを想定。
   */
  afterImage: string;
  afterLabel?: string;
  afterAlt?: string;

  /**
   * スライダーの初期位置（パーセンテージ 0-100）。
   * デフォルトは50（中央）。
   */
  initialPosition?: number;

  /**
   * コンテナに追加するクラス名。
   * アスペクト比や幅の調整に使用。
   */
  className?: string;
};

/**
 * CompareSlider Component
 *
 * 2枚の画像を重ね合わせ、スライダーによって表示領域を制御することで
 * 視覚的な比較体験を提供するインタラクティブコンポーネント。
 * ラグジュアリーな操作感を実現するため、スムーズなドラッグ追従と
 * ブランドカラーを用いたハンドルデザインを採用している。
 */
export function CompareSlider({
  beforeImage,
  beforeLabel,
  beforeAlt = "Before Image",
  afterImage,
  afterLabel,
  afterAlt = "After Image",
  initialPosition = 50,
  className = "",
}: CompareSliderProps) {
  // スライダー位置の状態管理（0〜100%）
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 入力座標に基づいてスライダー位置を計算・更新する関数。
   * マウスイベントとタッチイベントの両方から呼び出される。
   */
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  }, []);

  // --- マウスイベントハンドラ ---
  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  // --- タッチイベントハンドラ（モバイル対応） ---
  const onTouchStart = () => setIsDragging(true);
  const onTouchEnd = () => setIsDragging(false);
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 0) return;
    // CSS の touch-action: none とセットで使う想定
    handleMove(e.touches[0].clientX);
  };

  // --- キーボードアクセシビリティ ---
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div
      className={`group relative w-full select-none overflow-hidden rounded-3xl shadow-soft-card touch-none ${className}`}
      ref={containerRef}
      role="slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="画像比較スライダー"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp} // コンテナ外に出たらドラッグ終了
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* 
        画像のコンテナ：アスペクト比は親要素またはclassNameで制御されることを想定。
        デフォルトでは画像のサイズに依存しないよう、fill layoutを使用。
      */}
      <div className="relative h-full w-full">
        {/* 背景画像 (Right / After) */}
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={afterImage}
            alt={afterAlt}
            fill
            className="object-cover"
            priority
          />
          {afterLabel && (
            <div className="absolute bottom-4 right-4 z-10 rounded-full bg-slate-900/60 px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-md transition-opacity group-hover:opacity-100 sm:opacity-80">
              {afterLabel}
            </div>
          )}
        </div>

        {/* 前景画像 (Left / Before) - クリップ領域 */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden border-r border-white/20"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* 
            重要: 画像が歪まないよう、親コンテナと同じ幅を持つラッパーを配置し、
            その中で画像をフル表示する「逆補正」のテクニックを使用。
          */}
          <div
            className="absolute inset-0 h-full"
            style={{
              width: containerRef.current
                ? `${containerRef.current.clientWidth}px`
                : "100%",
            }}
          >
            <Image
              src={beforeImage}
              alt={beforeAlt}
              fill
              className="object-cover"
              priority
            />
          </div>

          {beforeLabel && (
            <div className="absolute bottom-4 left-4 z-10 rounded-full bg-tiffany-600/90 px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-md transition-opacity group-hover:opacity-100 sm:opacity-80">
              {beforeLabel}
            </div>
          )}
        </div>

        {/* スライダーハンドル (操作部) */}
        <div
          className="absolute inset-y-0 z-20 cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {/* 垂直分割線 */}
          <div className="h-full w-[2px] -translate-x-1/2 bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]" />

          {/* 中央ハンドルボタン */}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-tiffany-500 shadow-[0_4px_20px_rgba(10,186,181,0.4)] transition-transform hover:scale-110 active:scale-95">
              {/* 左右矢印アイコン */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white drop-shadow-sm"
              >
                <path d="M15 18l-6-6 6-6" />
                <polyline
                  points="9 18 15 12 9 6"
                  transform="rotate(180 12 12)"
                ></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* アクセシビリティ用オーバーレイ入力（スクリーンリーダー対応） */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default CompareSlider;
