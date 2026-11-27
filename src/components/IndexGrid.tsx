import type React from "react";
import Link from "next/link";
import type { Media } from "@/payload-types";
import { buildIndexCells, type Cell, type Project } from "@/lib/projects";
import IndexMotion from "./IndexMotion";
import { href, kind, localize, type Lang } from "@/lib/i18n";

/** How a picture sits in the phone's stack: wide across, or narrower beside its caption. */
type Phone = { side: "wide" | "sq-left" | "sq-right"; order: number };

/**
 * The project's second picture for the hover: the one chosen in the admin, or
 * else the first photograph or visualisation in the gallery, or failing that
 * its first drawing — faint behind the quote, a plan reads well too.
 */
function secondPicture(p: Project, hero: Media | null): Media | null {
  const chosen = typeof p.hoverImage === "object" ? (p.hoverImage as Media | null) : null;
  if (chosen?.url && chosen.mimeType?.startsWith("image/")) return chosen;
  const pictures = (p.gallery ?? [])
    .map((row) => (typeof row.image === "object" ? (row.image as Media | null) : null))
    .filter((m): m is Media => Boolean(m?.url && m.mimeType?.startsWith("image/") && (!hero || m.id !== hero.id)));
  return pictures.find((m) => !m.showWhole) ?? pictures[0] ?? null;
}

function ImageCell({ cell, phone, lang }: { cell: Extract<Cell, { kind: "image" }>; phone: Phone; lang: Lang }) {
  const p = cell.project;
  const doc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
  const hero = doc?.mimeType?.startsWith("image/") ? doc : null;
  const quote = p.quote?.trim();
  const second = secondPicture(p, hero);
  // The index may crop the picture differently from the project page, which
  // uses whatever was set on the image itself.
  const x = p.indexFocal?.x ?? hero?.focalX ?? 50;
  const y = p.indexFocal?.y ?? hero?.focalY ?? 50;

  return (
    <Link
      href={href(lang, `/projects/${p.slug}`)}
      className="cell cell-image"
      data-m={phone.side}
      style={
        { gridColumn: `span ${cell.span}`, "--seq": cell.index * 2, "--m-order": phone.order } as React.CSSProperties
      }
    >
      <span className="cell-inner">
        {hero?.url ? (
          // The picture sits in a layer of its own so it can travel inside the
          // frame while the page scrolls (IndexMotion), leaving the image's own
          // transform free for the settling zoom.
          <span className="cell-par">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.url}
              alt={hero.alt}
              className={hero.showWhole ? "cell-photo is-whole" : "cell-photo"}
              style={hero.showWhole ? undefined : { objectPosition: `${x}% ${y}%` }}
            />
          </span>
        ) : p.asText ? (
          // A written piece with no picture stands on a line from it, set like
          // the quotes elsewhere; the title is already in its caption.
          <span className="cell-type">
            <span className="cell-type-text">{quote ? `\u00bb${quote}\u00ab` : p.title}</span>
          </span>
        ) : (
          <span className="cell-blank">{p.imgLabel ?? (lang === "en" ? "photograph" : "fotografija")}</span>
        )}

        {/* Always the colour, so every project answers the pointer; the line
            only where one is written, or an empty quote prints as bare marks.
            The marks are the Slovene ones. */}
        {/* Shows faintly through the panel, as through tracing paper. Lazy, and
            hidden on a phone where nothing hovers, so it is only fetched where
            it can be seen. */}
        {second?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second.url}
            alt=""
            loading="lazy"
            className="cell-photo-alt"
            style={{ objectPosition: `${second.focalX ?? 50}% ${second.focalY ?? 50}%` }}
          />
        )}
        <span className={second?.url ? "cell-quote has-alt" : "cell-quote"}>
          {p.category && <span className="cell-quote-kind">{kind(lang, p.category)}</span>}
          <span className="cell-quote-name">{p.title}</span>
          {quote && <span className="cell-quote-text">{`\u00bb${quote}\u00ab`}</span>}
        </span>
      </span>
      {/* On a phone the caption cells are hidden and each picture carries its own
          title underneath, so a picture and its name can never drift apart. */}
      <span className="cell-mcaption" aria-hidden="true">
        <span>{p.title}</span>
        <span className="cell-mcaption-year">{p.year}</span>
      </span>
    </Link>
  );
}

function LabelCell({ cell, phone, lang }: { cell: Extract<Cell, { kind: "label" }>; phone: Phone; lang: Lang }) {
  const p = cell.project;
  return (
    <Link
      href={href(lang, `/projects/${p.slug}`)}
      className={`cell cell-label corner-${cell.align}`}
      data-m={phone.side}
      style={
        {
          "--seq": cell.index * 2 + 1,
          // Beside a picture on the right, the caption comes first in the row.
          "--m-order": phone.side === "sq-right" ? phone.order - 1 : phone.order + 1,
        } as React.CSSProperties
      }
    >
      <span className="cell-caption">
        <h2 className="caption-title">{p.title}</h2>
        <span className="caption-meta">{p.year}</span>
      </span>
    </Link>
  );
}

export default function IndexGrid({ projects, lang = "sl" }: { projects: Project[]; lang?: Lang }) {
  const cells = buildIndexCells(projects.map((p) => localize(p, lang)));

  // The phone keeps the desktop's rhythm instead of one column of equal
  // pictures: wide pictures run the full width, square ones stand narrower with
  // their caption beside them, alternating left and right down the page.
  const phone = new Map<number, Phone>();
  let squares = 0;
  for (const cell of cells) {
    if (cell.kind !== "image") continue;
    const side = cell.span === 2 ? "wide" : squares++ % 2 === 0 ? "sq-left" : "sq-right";
    phone.set(cell.index, { side, order: cell.index * 4 + 1 });
  }

  return (
    <div className="ruled index-grid">
      <IndexMotion />
      {cells.map((cell, i) => {
        if (cell.kind === "image") return <ImageCell key={i} cell={cell} phone={phone.get(cell.index)!} lang={lang} />;
        if (cell.kind === "label") return <LabelCell key={i} cell={cell} phone={phone.get(cell.index)!} lang={lang} />;
        return <span key={i} className="cell" />;
      })}
    </div>
  );
}
