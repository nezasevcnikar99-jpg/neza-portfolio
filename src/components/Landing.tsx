import type { Media } from "@/payload-types";

/**
 * The first screen: one picture or one film with the statement over it.
 *
 * It is sticky, and the grid that follows scrolls up over it — which is the
 * slide the whole thing is for, and it needs no JavaScript to do.
 *
 * A film is only asked for on wide screens. On a phone autoplay is unreliable
 * and the download is expensive, so the poster stands in; the browser never
 * fetches the film because the element is not rendered there.
 */
export default function Landing({
  media,
  poster,
  quote,
  source,
  label,
  name,
  light = false,
}: {
  media: Media | null;
  poster: Media | null;
  /** The epigraph, set like one on a book's title page. */
  quote: string;
  source: string;
  /** Small, bottom left under the arrow — what the book is, e.g. "Portfolio". */
  label: string;
  /** Small, top left — whose it is. */
  name: string;
  /** A light picture — a drawing on paper — takes dark text kept off the drawing. */
  light?: boolean;
}) {
  const isVideo = Boolean(media?.mimeType?.startsWith("video/"));
  const still = isVideo ? poster : media;
  // The sheet's proportions, so the stylesheet can work out how wide the drawing
  // stands and keep the quote clear of it.
  const ratio = still?.width && still?.height ? still.width / still.height : 1.5;

  return (
    <section
      className={light ? "landing is-light" : "landing"}
      style={{ "--sheet-ratio": ratio } as React.CSSProperties}
    >
      {light && (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <filter id="landing-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="gamma" amplitude="1" exponent="2.4" offset="0" />
              <feFuncG type="gamma" amplitude="1" exponent="2.4" offset="0" />
              <feFuncB type="gamma" amplitude="1" exponent="2.4" offset="0" />
            </feComponentTransfer>
          </filter>
        </svg>
      )}
      <div className="landing-top">
        <span className="landing-name">{name}</span>
      </div>

      <div className="landing-media">
        {isVideo && media?.url && (
          <video
            className="landing-video"
            src={media.url}
            poster={still?.url ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}

        {still?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={still.url}
            alt={still.alt ?? ""}
            className={`landing-still${isVideo ? " is-fallback" : ""}`}
            // A drawing on paper is placed by the stylesheet, whole and against the
            // bottom right; an inline focal point would win over that and centre it.
            style={light ? undefined : { objectPosition: `${still.focalX ?? 50}% ${still.focalY ?? 50}%` }}
          />
        ) : (
          !isVideo && <span className="landing-blank">uvodna slika ali video</span>
        )}
      </div>

      <div className="landing-text">
        <blockquote className="landing-quote">
          <p>{`\u00bb${quote.trim()}\u00ab`}</p>
        </blockquote>
        {source.trim() && <p className="landing-source">{source.trim()}</p>}
      </div>

      <div className="landing-bottom">
        <span className="landing-cue" aria-hidden="true">
          <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
            <path
              d="M7 0 L7 23 M1.5 17.5 L7 24 L12.5 17.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label.trim() && <span className="landing-label">{label.trim()}</span>}
      </div>
    </section>
  );
}
