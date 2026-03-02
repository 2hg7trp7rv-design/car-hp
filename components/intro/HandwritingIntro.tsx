"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './handwriting-intro.module.css';

// Intentionally no "seen" flag.
// The intro is designed to replay on each reload of the top page.

// Total timings (ms) — tuned for mobile.
const T_LINE1 = 900;
const T_GAP_12 = 140;
const T_LINE2 = 780;
const T_GAP_23 = 220;
const T_SIGN = 650;
const T_OUT = 420;

export function HandwritingIntro(props: { onDone: () => void }) {
  const { onDone } = props;

  const [phase, setPhase] = useState<'play' | 'out'>('play');
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

    setPhase('out');
    if (outTimerRef.current) window.clearTimeout(outTimerRef.current);
    outTimerRef.current = window.setTimeout(() => {
      outTimerRef.current = null;
      onDone();
    }, T_OUT);
  };

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mql?.matches) {
      finish(true);
      return;
    }

    const t = window.setTimeout(() => finish(false), total);

    const skip = () => finish(false);

    // User intent = skip. (Mobile: tap/scroll)
    window.addEventListener('pointerdown', skip, { passive: true });
    window.addEventListener('touchstart', skip, { passive: true });
    window.addEventListener('wheel', skip, { passive: true } as any);
    window.addEventListener('keydown', skip);

    return () => {
      window.clearTimeout(t);
      if (outTimerRef.current) window.clearTimeout(outTimerRef.current);
      window.removeEventListener('pointerdown', skip as any);
      window.removeEventListener('touchstart', skip as any);
      window.removeEventListener('wheel', skip as any);
      window.removeEventListener('keydown', skip as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock background scroll while intro is visible.
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className={phase === 'out' ? styles.overlayOut : styles.overlay} aria-label="Intro">
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.center}>
        <div className={styles.block}>
          <div className={styles.line1}>
            <span className={styles.scriptLine}>Cars are not products.</span>
          </div>

          <div className={styles.line2}>
            <span className={styles.scriptLine}>They are outcomes of an era.</span>
          </div>
        </div>
      </div>

      <div className={styles.signature} aria-hidden="true">
        <span className={styles.signatureText}>carboutiquejournal</span>
      </div>

      <button type="button" className={styles.skip} onClick={() => finish(false)}>
        Skip
      </button>
    </div>
  );
}
