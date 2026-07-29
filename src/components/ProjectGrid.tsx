"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, GRID_SIZES, PROJECTS, getProjectsByCategory } from "@/lib/projects";

export default function ProjectGrid() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("Vse");
  const filtered = getProjectsByCategory(filter);

  return (
    <>
      <section
        style={{
          padding: "0 48px 60px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: 230,
            gridAutoFlow: "dense",
            gap: 24,
          }}
        >
          {filtered.map((p, i) => {
            const size = GRID_SIZES[i % GRID_SIZES.length];
            return (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="project-cell"
                style={{
                  gridColumn: `span ${size.col}`,
                  gridRow: `span ${size.row}`,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-linear-gradient(135deg, oklch(20% 0.01 260 / 0.05) 0px, oklch(20% 0.01 260 / 0.05) 1px, transparent 1px, transparent 9px), oklch(96% 0.006 260)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      color: "oklch(20% 0.01 260 / 0.35)",
                      padding: "0 14px",
                    }}
                  >
                    {p.imgLabel}
                  </span>
                </div>
                <div
                  className="project-cell-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "oklch(55% 0.18 258 / 0.94)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 22,
                  }}
                >
                  <div
                    className="font-serif"
                    style={{ fontStyle: "italic", fontSize: 17, lineHeight: 1.4, color: "#fff", textAlign: "center" }}
                  >
                    {`"${p.quote}"`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 18,
          padding: "0 48px 56px",
          fontSize: 13,
          color: "oklch(20% 0.01 260 / 0.55)",
        }}
      >
        {CATEGORIES.map((cat) => {
          const active = filter === cat;
          const count = cat === "Vse" ? PROJECTS.length : PROJECTS.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="font-sans"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 13,
                color: active ? "oklch(55% 0.18 258)" : "oklch(20% 0.01 260 / 0.5)",
                borderBottom: active ? "1px solid oklch(55% 0.18 258)" : "1px solid transparent",
                paddingBottom: 2,
              }}
            >
              {cat === "Vse" ? `Vse (${count})` : `${cat} (${count})`}
            </button>
          );
        })}
      </nav>
    </>
  );
}
