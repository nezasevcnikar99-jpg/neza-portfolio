"use client";

import { useEffect } from "react";

/** Below this width the index is the phone's stack, which is where this runs. */
const PHONE = 900;

/**
 * The phone's stand-in for the hover: the pictures are in black and white and
 * the row nearest the middle of the screen is in colour, so scrolling moves the
 * colour down the page. Exactly one row is always in colour, also at the very
 * top and bottom where no row can reach the middle.
 *
 * The grid only carries the "motion" class once this runs, so without
 * JavaScript, on a wide screen, or with reduced motion asked for, every
 * picture is simply in colour.
 */
export default function IndexMotion() {
  useEffect(() => {
    const grid = document.querySelector<HTMLElement>(".index-grid");
    if (!grid) return;

    const phone = window.matchMedia(`(max-width: ${PHONE}px)`);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cells = Array.from(grid.querySelectorAll<HTMLElement>(".cell-image"));
    let frame = 0;

    const colour = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let best: { top: number; distance: number } | null = null;
      const boxes = cells.map((cell) => cell.getBoundingClientRect());
      boxes.forEach((box) => {
        const distance = Math.abs(box.top + box.height / 2 - middle);
        if (!best || distance < best.distance) best = { top: box.top, distance };
      });
      // A pair of square pictures shares a row, and the colour with it.
      cells.forEach((cell, i) => {
        cell.classList.toggle("is-mid", best !== null && Math.abs(boxes[i].top - (best as { top: number }).top) < 4);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(colour);
    };

    const start = () => {
      grid.classList.add("motion");
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      colour();
    };

    const stop = () => {
      grid.classList.remove("motion");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      cells.forEach((cell) => cell.classList.remove("is-mid"));
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
