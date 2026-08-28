import type React from "react";
import Link from "next/link";
import type { Media } from "@/payload-types";
import { buildIndexCells, type Cell, type Project } from "@/lib/projects";

function ImageCell({ cell }: { cell: Extract<Cell, { kind: "image" }> }) {
  const p = cell.project;
  const doc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
  const hero = doc?.mimeType?.startsWith("image/") ? doc : null;
  const quote = p.quote?.trim();
  // The index may crop the picture differently from the project page, which
  // uses whatever was set on the image itself.
  const x = p.indexFocal?.x ?? hero?.focalX ?? 50;
  const y = p.indexFocal?.y ?? hero?.focalY ?? 50;

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
            style={{ objectPosition: `${x}% ${y}%` }}
          />
        ) : (
          <span className="cell-blank">{p.imgLabel ?? "fotografija"}</span>
        )}

        {/* Always the colour, so every project answers the pointer; the line
            only where one is written, or an empty quote prints as bare marks. */}
        <span className="cell-quote">
          <span className="cell-quote-name">{p.title}</span>
          {quote && <span className="cell-quote-text">{`\u201c${quote}\u201d`}</span>}
        </span>
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
