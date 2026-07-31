"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeMotion = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const motionSnapshot = () => !window.matchMedia(REDUCED_MOTION).matches;
const motionServerSnapshot = () => true;

/** Scroll distance the pinned sequence occupies, as a multiple of the viewport. */
const DRIVER_HEIGHT = "250svh";
/** How small the heading ends up once it settles into the final composition. */
const SCALE_END = 0.5;
/** Resting distance of the settled heading from the top of the viewport. */
const FINAL_TOP = 104;
/** Space between heading and description while both are shown. */
const GAP = 24;

/** Phase boundaries along the 0→1 scroll progress. */
const LEAD_ONLY_UNTIL = 0.35;
const DESCRIPTION_IN_BY = 0.62;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function HomeIntro({
  lead,
  accent,
  description,
  children,
}: {
  lead: string;
  accent: string;
  description: string;
  children: ReactNode;
}) {
  const driverRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  const motion = useSyncExternalStore(subscribeMotion, motionSnapshot, motionServerSnapshot);
  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState({ panelH: 0, leadH: 0, descH: 0 });

  const measure = useCallback(() => {
    setSize({
      panelH: panelRef.current?.offsetHeight ?? 0,
      leadH: leadRef.current?.offsetHeight ?? 0,
      descH: descRef.current?.offsetHeight ?? 0,
    });
  }, []);

  useEffect(() => {
    if (!motion) return;

    measure();
    document.fonts?.ready.then(measure).catch(() => {});

    let raf = 0;
    const update = () => {
      raf = 0;
      const driver = driverRef.current;
      const panel = panelRef.current;
      if (!driver || !panel) return;
      const rect = driver.getBoundingClientRect();
      const total = rect.height - panel.offsetHeight;
      setProgress(total <= 0 ? 1 : clamp01(-rect.top / total));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Animation frames are paused while the tab is hidden, which can leave the
    // sequence on a stale frame; resync as soon as it comes back.
    document.addEventListener("visibilitychange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [measure, motion]);

  const heading = (
    <>
      {lead} <span style={{ fontStyle: "italic", color: "oklch(55% 0.18 258)" }}>{accent}</span>
    </>
  );

  // Static fallback for anyone who has asked the system to reduce motion.
  if (!motion) {
    return (
      <div>
        <section className="intro-static">
          <h1 className="font-serif intro-lead" style={{ fontSize: `clamp(${36 * SCALE_END}px, ${5 * SCALE_END}vw, ${58 * SCALE_END}px)` }}>
            {heading}
          </h1>
          <p className="intro-description" style={{ marginTop: GAP }}>
            {description}
          </p>
        </section>
        <div style={{ paddingBottom: 120 }}>{children}</div>
      </div>
    );
  }

  const reveal = easeInOut(range(progress, LEAD_ONLY_UNTIL, DESCRIPTION_IN_BY));
  const settle = easeInOut(range(progress, DESCRIPTION_IN_BY, 1));
  const arrow = 1 - range(progress, DESCRIPTION_IN_BY, DESCRIPTION_IN_BY + 0.12);
  const mosaic = easeInOut(range(progress, DESCRIPTION_IN_BY + 0.08, 0.98));

  const blockH = size.leadH + reveal * (GAP + size.descH);
  const centeredTop = Math.max(FINAL_TOP, (size.panelH - blockH) / 2);
  const fullTop = Math.max(FINAL_TOP, (size.panelH - (size.leadH + GAP + size.descH)) / 2);
  const top = settle > 0 ? lerp(fullTop, FINAL_TOP, settle) : centeredTop;

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={driverRef}
        style={{ height: DRIVER_HEIGHT, position: "relative", zIndex: 2, pointerEvents: "none" }}
      >
        <div ref={panelRef} style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: "var(--page-pad)",
              top,
              maxWidth: 980,
              transform: `scale(${lerp(1, SCALE_END, settle)})`,
              transformOrigin: "left top",
              willChange: "transform, top",
            }}
          >
            <h1 ref={leadRef} className="font-serif intro-lead">
              {heading}
            </h1>
            <div
              style={{
                overflow: "hidden",
                maxHeight: reveal * size.descH,
                marginTop: reveal * GAP,
                opacity: reveal * (1 - settle),
              }}
            >
              <p ref={descRef} className="intro-description">
                {description}
              </p>
            </div>
          </div>

          <div
            className="intro-arrow"
            style={{ opacity: arrow, transform: `translateY(${(1 - arrow) * 12}px)` }}
            aria-hidden="true"
          >
            <svg width="16" height="30" viewBox="0 0 16 30" fill="none">
              <path
                d="M8 0 L8 27 M1.5 20.5 L8 28 L14.5 20.5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* The composition is revealed by scroll progress, so without JS it would
          never become visible. Show it outright in that case. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: ".mosaic-reveal{opacity:1!important;transform:none!important;pointer-events:auto!important}",
          }}
        />
      </noscript>

      <div
        className="mosaic-reveal"
        style={{
          marginTop: `-100svh`,
          position: "relative",
          zIndex: 1,
          paddingTop: FINAL_TOP + size.leadH * SCALE_END + 80,
          paddingBottom: 120,
          opacity: mosaic,
          transform: `translateY(${(1 - mosaic) * 40}px)`,
          pointerEvents: mosaic > 0.9 ? "auto" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
