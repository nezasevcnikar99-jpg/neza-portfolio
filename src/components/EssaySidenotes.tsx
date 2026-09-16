"use client";

import { useEffect, useRef, useState } from "react";

/** Lifts a note so its first line sits on the line of its mark. */
const LIFT = 6;
/** The least room between two notes when one has to give way to the other. */
const GAP = 14;

/**
 * An essay's notes in the right-hand column, each level with the line that
 * points to it and pushed down only when the one above needs the room. On a
 * phone the column is hidden and the same notes are listed under the text.
 */
export default function EssaySidenotes({ notes }: { notes: string[] }) {
  const list = useRef<HTMLOListElement>(null);
  const [tops, setTops] = useState<number[] | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const marks = notes.map((_, i) => document.getElementById(`ref-${i + 1}`));
    const shown = () => getComputedStyle(el).display !== "none";

    const place = () => {
      if (!shown()) return;
      const base = el.getBoundingClientRect().top;
      const items = Array.from(el.children) as HTMLElement[];
      const next: number[] = [];
      let floor = 0;
      items.forEach((item, i) => {
        const mark = marks[i];
        const want = mark ? mark.getBoundingClientRect().top - base - LIFT : floor;
        const top = Math.max(0, want, floor);
        next.push(top);
        floor = top + item.offsetHeight + GAP;
      });
      setTops(next);
      setHeight(floor);
    };

    place();
    const observer = new ResizeObserver(place);
    const text = document.querySelector(".essay-text");
    if (text) observer.observe(text);
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);

    // Pointing at a mark lights its note; on the wide layout the note is
    // already beside the line, so a click lights it instead of jumping away.
    const cleanups = marks.map((mark, i) => {
      if (!mark) return () => {};
      const enter = () => setActive(i);
      const leave = () => setActive((current) => (current === i ? null : current));
      const click = (event: Event) => {
        if (!shown()) return;
        event.preventDefault();
        setActive(i);
      };
      mark.addEventListener("mouseenter", enter);
      mark.addEventListener("mouseleave", leave);
      mark.addEventListener("click", click);
      return () => {
        mark.removeEventListener("mouseenter", enter);
        mark.removeEventListener("mouseleave", leave);
        mark.removeEventListener("click", click);
      };
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [notes]);

  // Marks light up from their note as well.
  useEffect(() => {
    notes.forEach((_, i) => document.getElementById(`ref-${i + 1}`)?.classList.toggle("is-active", i === active));
  }, [active, notes]);

  return (
    <ol ref={list} className="essay-sidenotes" style={{ height }} aria-label="Opombe">
      {notes.map((note, i) => (
        <li
          key={i}
          className={i === active ? "essay-sidenote is-active" : "essay-sidenote"}
          style={tops ? { position: "absolute", top: tops[i] } : undefined}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive((current) => (current === i ? null : current))}
        >
          <span className="essay-note-num">{i + 1}</span>
          <span>{note}</span>
        </li>
      ))}
    </ol>
  );
}
