import type React from "react";
import Link from "next/link";
import type { Media } from "@/payload-types";
import { buildIndexCells, type Cell, type Project } from "@/lib/projects";

function ImageCell({ cell }: { cell: Extract<Cell, { kind: "image" }> }) {
  const p = cell.project;
  const doc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
  const hero = doc?.mimeType?.startsWith("image/") ? doc : null;
  const quote = p.quote?.trim();

  return (
    <Link
      href={`/projects/${p.slug}`}
      className="cell cell-image"
      style={{ gridColumn: `span ${cell.span}`, "--seq": cell.index * 2 } as React.CSSProperties}
    >
      <span className="cell-inner">
        {hero?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt={hero.alt}
            className="cell-photo"
            style={{ objectPosition: `${hero.focalX ?? 50}% ${hero.focalY ?? 50}%` }}
          />
        ) : (
          <span className="cell-blank">{p.imgLabel ?? "fotografija"}</span>
        )}

        {/* Only when there is something to say — an empty quote used to render
            as the literal word "null" across the picture. */}
        {quote && (
          <span className="cell-quote">
            <span className="cell-quote-text">{`\u201c${quote}\u201d`}</span>
          </span>
        )}
      </span>
    </Link>
  );
}

function LabelCell({ cell }: { cell: Extract<Cell, { kind: "label" }> }) {
  const p = cell.project;
  return (
    <Link
      href={`/projects/${p.slug}`}
      className={`cell cell-label corner-${cell.align}`}
      style={{ "--seq": cell.index * 2 + 1 } as React.CSSProperties}
    >
      <span className="cell-caption">
        <span className="caption-title">{p.title}</span>
        <span className="caption-meta">{p.year}</span>
      </span>
    </Link>
  );
}

export default function IndexGrid({ projects }: { projects: Project[] }) {
  const cells = buildIndexCells(projects);

  return (
    <div className="ruled">
      {cells.map((cell, i) => {
        if (cell.kind === "image") return <ImageCell key={i} cell={cell} />;
        if (cell.kind === "label") return <LabelCell key={i} cell={cell} />;
        return <span key={i} className="cell" />;
      })}
    </div>
  );
}
