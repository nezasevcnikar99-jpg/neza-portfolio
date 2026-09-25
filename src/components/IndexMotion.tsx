"use client";

import { useEffect } from "react";

/** How far a picture travels inside its frame, top to bottom of the screen. */
const TRAVEL = 26;
/** Below this width the index is the phone's stack, which is where this runs. */
const PHONE = 900;

/**
 * Gives the phone's index its movement: each picture settles out of a slight
 * zoom as it arrives, then travels slowly inside its frame while the page
 * scrolls, so the frame reads as a window. Pictures shown whole never move —
 * they may not be cropped — and a phone set to reduce motion gets none of it.
 *
 * The grid only carries the "motion" class once this runs, so without
 * JavaScript every picture simply stands there, as before.
 */
export default function IndexMotion() {
  useEffect(() => {
    const grid = document.querySelector<HTMLElement>(".index-grid");
    if (!grid) return;

    const phone = window.matchMedia(`(max-width: ${PHONE}px)`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cells = Array.from(grid.querySelectorAll<HTMLElement>(".cell-image"));
    const moving = cells.filter((cell) => !cell.querySelector(".is-whole"));
    let observer: IntersectionObserver | null = null;
    let frame = 0;

    const travel = () => {
      frame = 0;
      const height = window.innerHeight;
      for (const cell of moving) {
        const layer = cell.querySelector<HTMLElement>(".cell-par");
        if (!layer) continue;
        const box = cell.getBoundingClientRect();
        if (box.bottom < -height || box.top > height * 2) continue;
        const middle = (box.top + box.height / 2) / height - 0.5;
        layer.style.transform = `translateY(${(-middle * TRAVEL).toFixed(1)}px)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(travel);
    };

    const start = () => {
      grid.classList.add("motion");
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
      );
      cells.forEach((cell) => observer?.observe(cell));
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      travel();
    };

    const stop = () => {
      grid.classList.remove("motion");
      observer?.disconnect();
      observer = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      cells.forEach((cell) => cell.classList.remove("is-in"));
      moving.forEach((cell) => {
        const layer = cell.querySelector<HTMLElement>(".cell-par");
        if (layer) layer.style.transform = "";
      });
    };

    const decide = () => (phone.matches && !still.matches ? start() : stop());
    decide();
    phone.addEventListener("change", decide);
    still.addEventListener("change", decide);

    return () => {
      stop();
      phone.removeEventListener("change", decide);
      still.removeEventListener("change", decide);
    };
  }, []);

  return null;
}
