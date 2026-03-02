"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Breadcrumb } from '@/components/layout/Breadcrumb';

import styles from '@/components/home/home-masterpiece.module.css';
import { pickExhibitKvPaths } from '@/lib/exhibit/kv';

type TimelineItem = {
  decade: string;
  items: { slug: string; title: string; eraLabel?: string | null; publishedAt?: string | null }[];
};

type TimelineViewItem = TimelineItem & { total: number };

export function HeritageTimeArchive(props: { timeline: TimelineItem[] }) {
  const { timeline } = props;

  const [activeDecade, setActiveDecade] = useState<string>(timeline?.[0]?.decade ?? '—');
  const [mapOpen, setMapOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rootRef = useRef<HTMLElement | null>(null);
  const mapButtonRef = useRef<HTMLButtonElement | null>(null);
  const mapCloseRef = useRef<HTMLButtonElement | null>(null);
  const mapSheetRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const wasMapOpenRef = useRef(false);

  const openMap = () => {
    lastFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    setMapOpen(true);
  };

  const closeMap = () => {
    setMapOpen(false);
  };

  const decadeNote = useMemo(() => {
    const map: Record<string, string> = {
      '2020s': 'Compression. Electrification. Quiet restraint.',
      '2010s': 'Excess recedes. Precision surfaces.',
      '2000s': 'Analog confidence, last call.',
      '1990s': 'Efficiency meets optimism.',
      '1980s': 'Turbo, wedge, ambition.',
      '1970s': 'Crisis. Regulation. Reinvention.',
      '1960s': 'Freedom. Growth. Lightness.',
      'UNFILED': 'Unfiled pieces. Era unspecified.',
    };
    return (decade: string) => map[(decade ?? '').trim()] ?? 'IN PREPARATION. A room being curated.';
  }, []);

  const queryDisplay = (query ?? '').trim();
  const queryNorm = queryDisplay.toLowerCase();
  const viewTimeline: TimelineViewItem[] = useMemo(() => {
    const q = queryNorm;
    return (timeline || []).map((t) => {
      const total = t.items?.length ?? 0;
      if (!q) return { ...t, total };

      const decadeMatch = (t.decade ?? '').toLowerCase().includes(q);
      if (decadeMatch) return { ...t, total };

      const items = (t.items || []).filter((it) => {
        const hay = `${it.title ?? ''} ${it.eraLabel ?? ''} ${it.publishedAt ?? ''} ${it.slug ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
      return { decade: t.decade, items, total };
    });
  }, [timeline, queryNorm]);

  const matchCount = useMemo(() => {
    if (!queryNorm) return 0;
    return viewTimeline.reduce((sum, t) => sum + (t.items?.length ?? 0), 0);
  }, [viewTimeline, queryNorm]);

  useEffect(() => {
    // When the filter changes, keep the header state honest.
    if (!timeline || timeline.length === 0) {
      setActiveDecade('—');
      return;
    }
    if (queryNorm && matchCount === 0) {
      setActiveDecade('—');
      return;
    }
    if (queryNorm) {
      const first = viewTimeline.find((t) => (t.items?.length ?? 0) > 0)?.decade ?? viewTimeline[0]?.decade;
      setActiveDecade(first ?? '—');
      return;
    }
    setActiveDecade(timeline?.[0]?.decade ?? '—');
  }, [queryNorm, matchCount, timeline, viewTimeline]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduce = !!mql?.matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  // Detect active decade while scrolling.
  useEffect(() => {
    const onScroll = () => {
      const sections = Array.from(document.querySelectorAll('[data-decade-section]')) as HTMLElement[];
      if (sections.length === 0) return;

      const viewportH = window.innerHeight || 800;
      const probeY = viewportH * 0.30;

      let best: { decade: string; dist: number } | null = null;
      for (const sec of sections) {
        const r = sec.getBoundingClientRect();
        const mid = r.top + r.height * 0.25;
        const d = Math.abs(mid - probeY);
        const decade = sec.getAttribute('data-decade-section') || '';
        if (!decade) continue;
        if (!best || d < best.dist) best = { decade, dist: d };
      }

      if (best && best.decade && best.decade !== activeDecade) {
        setActiveDecade(best.decade);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll as any);
  }, [activeDecade]);

  // Scroll lock when map is open.
  useEffect(() => {
    if (!mapOpen) return;

    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [mapOpen]);

  // Focus management + ESC close + Tab trap for the decade map.
  useEffect(() => {
    if (!mapOpen) {
      if (!wasMapOpenRef.current) return;
      wasMapOpenRef.current = false;

      const target = mapButtonRef.current || lastFocusRef.current;
      if (target) {
        window.requestAnimationFrame(() => {
          try {
            target.focus();
          } catch {
            // noop
          }
        });
      }
      return;
    }

    wasMapOpenRef.current = true;

    window.requestAnimationFrame(() => {
      const focusTarget = mapCloseRef.current || mapSheetRef.current;
      if (focusTarget) {
        try {
          focusTarget.focus();
        } catch {
          // noop
        }
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMap();
        return;
      }

      if (e.key !== 'Tab') return;

      const sheet = mapSheetRef.current;
      if (!sheet) return;

      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => {
        if (el.hasAttribute('disabled')) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;
        return true;
      });

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active) return;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mapOpen]);

  return (
    <section className={styles.timelineWrap} aria-label="Heritage Time Archive" ref={rootRef as any}>
      <div className={styles.timelineSticky} data-timeline-sticky>
        <div className={styles.timelineCrumbRow}>
          <Breadcrumb
            items={[{ label: 'HOME', href: '/' }, { label: 'HERITAGE' }]}
            tone="light"
            className={styles.timelineCrumb}
          />
        </div>
        <div className={styles.timelineHeader}>
          <div className={styles.timelineHeaderLeft}>
            <div className={styles.timelineEyebrow}>HERITAGE</div>
            <div className={styles.timelineTitle}>Time Archive</div>
          </div>

          <div className={styles.timelineActive}>{activeDecade || '—'}</div>

          <div className={styles.timelineHeaderRight}>
            <button
              ref={mapButtonRef}
              type="button"
              className={`${styles.mapButton} cb-tap`}
              aria-label="Open decade map"
              aria-haspopup="dialog"
              aria-expanded={mapOpen}
              onClick={openMap}
            >
              Map
            </button>
          </div>
        </div>

        <div className={styles.timelineSearchRow}>
          <div className={styles.timelineSearchBox}>
            <input
              type="search"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, eras…"
              aria-label="Search in Heritage"
              className={`${styles.timelineSearchInput} cb-input cb-tap`}
            />
            {queryNorm ? (
              <button
                type="button"
                className={`${styles.timelineSearchClear} cb-tap`}
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                Clear
              </button>
            ) : null}
          </div>
          {queryNorm ? (
            <div className={styles.timelineSearchMeta}>
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </div>
          ) : null}
        </div>

        <div className={styles.timelineHint}>
          <span className={styles.timelineHintLine} aria-hidden="true" />
          <span className={styles.timelineHintText}>Scroll to walk the wall</span>
        </div>
      </div>

      {mapOpen ? (
        <div className={styles.mapOverlay} role="dialog" aria-modal="true" aria-label="Decade map">
          <button
            type="button"
            aria-label="Close map"
            className={styles.mapBackdrop}
            onClick={closeMap}
          />

          <div className={styles.mapSheet} ref={mapSheetRef} tabIndex={-1}>
            <div className={styles.mapTop}>
              <div>
                <div className={styles.mapEyebrow}>MAP</div>
                <div className={styles.mapTitle}>Decades</div>
              </div>
              <button
                ref={mapCloseRef}
                type="button"
                className={`${styles.mapClose} cb-tap`}
                onClick={closeMap}
              >
                Close
              </button>
            </div>

            <p className={styles.mapLead}>A map of rooms. Tap a decade to jump.</p>

            <div className={styles.mapGrid}>
              {viewTimeline.map((t) => (
                <button
                  key={t.decade}
                  type="button"
                  className={`${t.decade === activeDecade ? styles.mapItemActive : styles.mapItem} cb-tap`}
                  onClick={() => {
                    closeMap();
                    scrollToId('decade-' + encodeURIComponent(t.decade));
                  }}
                >
                  <span className={styles.mapItemDecade}>{t.decade}</span>
                  <span className={styles.mapItemNote}>{decadeNote(t.decade)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.timelineList}>
        {viewTimeline.map((t) => {
          const kv = pickExhibitKvPaths('decade:' + t.decade);
          return (
            <section
              key={t.decade}
              id={'decade-' + encodeURIComponent(t.decade)}
              data-decade={t.decade}
              data-decade-section={t.decade}
              className={`${styles.decadeSection} ${t.total === 0 ? styles.decadeSectionEmpty : queryNorm && t.items.length === 0 ? styles.decadeSectionFilteredEmpty : t.total < 3 ? styles.decadeSectionSparse : ''}`}
            >
              <div className={styles.decadeBg} aria-hidden="true">
                <picture>
                  <source media="(min-width: 768px)" srcSet={kv.desktop} />
                  <img src={kv.mobile} alt="" loading="lazy" className={styles.decadeBgImg} />
                </picture>
                <div className={styles.decadeBgOverlay} />
              </div>

              <div className={styles.decadeInner}>
                <div className={styles.decadeLabel}>{t.decade}</div>
                <div className={styles.decadeNote}>{decadeNote(t.decade)}</div>
                <div className={styles.decadeCount}>
                  {queryNorm ? (t.total === 0 ? '0 entries' : `${t.items.length}/${t.total} matches`) : `${t.total} entries`}
                </div>

                <div className={styles.decadeGrid}>
                  {t.items.slice(0, 8).map((it) => (
                    <Link
                      key={it.slug}
                      href={'/heritage/' + it.slug}
                      className={`${styles.decadeCard} cb-tap`}
                    >
                      <div className={styles.decadeCardMeta}>{it.eraLabel || it.publishedAt || ''}</div>
                      <div className={styles.decadeCardTitle}>{it.title}</div>
                    </Link>
                  ))}

                  {t.total === 0 ? (
                    <div className={styles.decadeCardMuted} aria-hidden="true">
                      <div className={styles.decadeCardMeta}>IN PREPARATION</div>
                      <div className={styles.decadeCardTitle}>No entries yet. This room is being curated.</div>
                    </div>
                  ) : queryNorm && t.items.length === 0 ? (
                    <div className={styles.decadeCardMuted}>
                      <div className={styles.decadeCardMeta}>NO MATCHES</div>
                      <div className={styles.decadeCardTitle}>No entries match “{queryDisplay || queryNorm}”.</div>
                    </div>
                  ) : !queryNorm && t.total < 3 ? (
                    <div className={styles.decadeCardMuted} aria-hidden="true">
                      <div className={styles.decadeCardMeta}>IN PREPARATION</div>
                      <div className={styles.decadeCardTitle}>This decade is still being curated.</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
