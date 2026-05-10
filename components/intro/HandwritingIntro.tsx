"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./handwriting-intro.module.css";

// 長い待ち時間を作らない、短い導入演出。
// 現在未使用だが、再利用されても仕様に反しない長さに抑える。
const T_LINE1 = 260;
const T_GAP_12 = 90;
const T_LINE2 = 260;
const T_GAP_23 = 90;
const T_SIGN = 180;
const T_OUT = 220;

export function HandwritingIntro(props: { onDone: () => void }) {
  const { onDone } = props;

  const [phase, setPhase] = useState<"play" | "out">("play");
  const doneRef = useRef(false);
  const outTimerRef = useRef<number | null>(null);

  const total = useMemo(() => T_LINE1 + T_GAP_12 + T_LINE2 + T_GAP_23 + T_SIGN, []);

  const finish = (fast?: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;

    if (fast) {
      onDone();
      return;
    }

    setPhase("out");
    if (outTimerRef.current) window.clearTimeout(outTimerRef.current);
    outTimerRef.current = window.setTimeout(() => {
      outTimerRef.current = null;
      onDone();
    }, T_OUT);
  };

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches) {
      finish(true);
      return;
    }

    const t = window.setTimeout(() => finish(false), total);
    const skip = () => finish(false);

    window.addEventListener("pointerdown", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    window.addEventListener("wheel", skip, { passive: true } as AddEventListenerOptions);
    window.addEventListener("keydown", skip);

    return () => {
      window.clearTimeout(t);
      if (outTimerRef.current) window.clearTimeout(outTimerRef.current);
      window.removeEventListener("pointerdown", skip as EventListener);
      window.removeEventListener("touchstart", skip as EventListener);
      window.removeEventListener("wheel", skip as EventListener);
      window.removeEventListener("keydown", skip as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className={phase === "out" ? styles.overlayOut : styles.overlay} aria-label="Intro">
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.center}>
        <div className={styles.block}>
          <div className={styles.line1}>
            <span className={styles.scriptLine}>車は、時代の空気でできている。</span>
          </div>

          <div className={styles.line2}>
            <span className={styles.scriptLine}>選ぶことは、暮らしを整えること。</span>
          </div>
        </div>
      </div>

      <div className={styles.signature} aria-hidden="true">
        <span className={styles.signatureText}>car boutique journal</span>
      </div>

      <button type="button" className={styles.skip} onClick={() => finish(false)}>
        閉じる
      </button>
    </div>
  );
}
