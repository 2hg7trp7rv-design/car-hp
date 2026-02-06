"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "scale";

type RevealProps = {
  children: ReactNode;
  /** アニメーション開始までの遅延時間(ms) */
  delay?: number;
  /** 追加のクラス名 */
  className?: string;
  /** IntersectionObserverの閾値(0.0〜1.0) */
  threshold?: number;
  /** 出現方向 */
  direction?: RevealDirection;
  /** アニメーション時間(ms)。未指定時はTailwindのduration-1000を使う */
  duration?: number;
  /** trueなら最初から表示してアニメーションを無効化 */
  disabled?: boolean;
  /**
   * trueならIntersectionObserverを使わず常に表示状態にする
   * 一覧のカードが出ないなど違和感がある時の保険用
   */
  forceVisible?: boolean;
};

/**
 * Reveal
 *
 * CAR BOUTIQUE全体で使う「フェードイン+移動」の標準アニメーションコンポーネント。
 * - IntersectionObserverでビューポートインを検知して一度だけ再生
 * - directionで出現方向を指定(up/down/left/right/fade/scale)
 * - delayでスタッガー表示を制御
 * - モーションに弱いユーザー(prefers-reduced-motion)にはアニメ無効化
 *
 * よくある使い方:
 * - セクションタイトルや見出し: <Reveal><h2>...</h2></Reveal>
 * - カードのリスト: map内でdelayを段階的に増やす
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  threshold = 0.15,
  direction = "up",
  duration,
  disabled = false,
  forceVisible = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // prefers-reduced-motion判定
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReducedMotion(media.matches);
    listener();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // IntersectionObserverでビューポートインを検知
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // アニメーションを無効化したいケース
    if (disabled || forceVisible || reducedMotion) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      // 古いブラウザ用フォールバック
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        // 少し早めに発火させて、スクロールした瞬間に真っ白にならないようにする
        rootMargin: "0px 0px -20% 0px",
        threshold,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, disabled, forceVisible, reducedMotion]);

  // ベースのトランジション
  const baseClass =
    "transform-gpu transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform";

  // 状態ごとのクラス
  let stateClass = "";

  if (visible) {
    // 表示状態
    switch (direction) {
      case "up":
      case "down":
      case "left":
      case "right":
      case "fade":
      case "scale":
      default:
        stateClass = "opacity-100 translate-x-0 translate-y-0 scale-100";
        break;
    }
  } else {
    // 初期/非表示状態（※ SSR/遷移直後に“真っ白”を作らないため opacity は落とさない）
    switch (direction) {
      case "up":
        stateClass = "opacity-100 translate-y-6";
        break;
      case "down":
        stateClass = "opacity-100 -translate-y-6";
        break;
      case "left":
        stateClass = "opacity-100 translate-x-6";
        break;
      case "right":
        stateClass = "opacity-100 -translate-x-6";
        break;
      case "scale":
        stateClass = "opacity-100 scale-95";
        break;
      case "fade":
      default:
        stateClass = "opacity-100";
        break;
    }
  }

  // 遅延と任意のdurationをstyleで制御
  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
  };
  if (duration != null) {
    style.transitionDuration = `${duration}ms`;
  }

  const mergedClassName = [baseClass, stateClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={mergedClassName} style={style}>
      {children}
    </div>
  );
}
