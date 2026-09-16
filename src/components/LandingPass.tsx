"use client";

import { useEffect } from "react";

export const LANDING_KEY = "landing-passed";

/**
 * Takes the landing out once the grid has slid all the way over it, and moves
 * the scroll position up by the same height in the same frame, so nothing on
 * screen moves — the visitor simply can no longer scroll back to it. It stays
 * out for the rest of the visit.
 */
export default function LandingPass() {
  useEffect(() => {
    const root = document.documentElement;
    const landing = document.querySelector<HTMLElement>(".landing");
    if (!landing || root.classList.contains(LANDING_KEY)) return;

    const onScroll = () => {
      const height = landing.offsetHeight;
      if (window.scrollY < height) return;
      root.classList.add(LANDING_KEY);
      window.scrollTo(0, window.scrollY - height);
      try {
        sessionStorage.setItem(LANDING_KEY, "1");
      } catch {
        // Private windows can refuse storage; the landing then just returns next visit.
      }
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
