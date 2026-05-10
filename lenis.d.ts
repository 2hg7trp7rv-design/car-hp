// lenis.d.ts
// 型エラー回避用のローカル宣言。
// ランタイム実装は node_modules/@studio-freight/lenis 側をそのまま利用する。

declare module "@studio-freight/lenis" {
  export type LenisOrientation = "vertical" | "horizontal";
  export type LenisGestureOrientation = "vertical" | "horizontal" | "both";

  export type LenisEasingFunction = (t: number) => number;

  export interface LenisOptions {
    /**
     * スクロールさせるラッパー要素（未指定なら window 相当）
     */
    wrapper?: HTMLElement | Window;
    /**
     * スクロールコンテンツ本体（ラッパーの子要素）
     */
    content?: HTMLElement;
    /**
     * アニメーションの基準時間（秒）
     */
    duration?: number;
    /**
     * イージング関数
     */
    easing?: LenisEasingFunction;
    /**
     * 線形補間係数（0〜1）
     */
    lerp?: number;
    /**
     * マウスホイール入力をスムース化するか
     */
    smoothWheel?: boolean;
    /**
     * タッチ入力をスムース化するか
     */
    smoothTouch?: boolean;
    /**
     * 無限スクロール（ループ）を有効化するか
     */
    infinite?: boolean;
    /**
     * スクロール方向
     */
    orientation?: LenisOrientation;
    /**
     * ジェスチャー方向（trackpad など）
     */
    gestureOrientation?: LenisGestureOrientation;
    /**
     * タッチ時の感度
     */
    touchMultiplier?: number;
    /**
     * ホイール時の感度
     */
    wheelMultiplier?: number;
    /**
     * サイズの自動リサイズ
     */
    autoResize?: boolean;
    /**
     * requestAnimationFrame をライブラリ側で自動ループするか
     */
    autoRaf?: boolean;
  }

  export interface LenisScrollToOptions {
    offset?: number;
    immediate?: boolean;
    lerp?: number;
    duration?: number;
    easing?: LenisEasingFunction;
  }

  export type LenisScrollEvent = {
    scroll: number;     // 現在スクロール量
    limit: number;      // 最大スクロール量
    velocity: number;   // スクロール速度
    progress: number;   // 0〜1 の進捗
  };

  export default class Lenis {
    constructor(options?: LenisOptions);

    /**
     * 外部の requestAnimationFrame から毎フレーム呼ぶ
     */
    raf(time: number): void;

    /**
     * 指定位置へスクロール
     */
    scrollTo(
      target: number | string | HTMLElement,
      options?: LenisScrollToOptions,
    ): void;

    /**
     * イベント購読
     */
    on(event: "scroll", callback: (event: LenisScrollEvent) => void): () => void;
    on(event: string, callback: (event: unknown) => void): () => void;

    /**
     * インスタンス破棄
     */
    destroy(): void;
  }
}
