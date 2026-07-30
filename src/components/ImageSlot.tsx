export default function ImageSlot({
  label,
  aspectRatio,
  className,
  src,
  alt,
  mimeType,
  filename,
  focalX,
  focalY,
  fit = "cover",
}: {
  label: string;
  aspectRatio: string;
  className?: string;
  src?: string | null;
  alt?: string;
  mimeType?: string | null;
  filename?: string | null;
  focalX?: number | null;
  focalY?: number | null;
  fit?: "cover" | "contain";
}) {
  const isDocument = Boolean(src) && mimeType != null && !mimeType.startsWith("image/");
  const hasImage = Boolean(src) && !isDocument;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius: 2,
        overflow: "hidden",
        background: hasImage
          ? fit === "contain"
            ? "oklch(97% 0.004 260)"
            : undefined
          : "repeating-linear-gradient(135deg, oklch(20% 0.01 260 / 0.05) 0px, oklch(20% 0.01 260 / 0.05) 1px, transparent 1px, transparent 9px), oklch(96% 0.006 260)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {isDocument ? (
        <a
          href={src ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "oklch(20% 0.01 260 / 0.55)",
            padding: "0 14px",
          }}
        >
          <span style={{ fontSize: 22 }}>{"⎘"}</span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.04em",
              wordBreak: "break-all",
            }}
          >
            {filename ?? label}
          </span>
        </a>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? label}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            objectPosition: fit === "cover" ? `${focalX ?? 50}% ${focalY ?? 50}%` : "center",
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.04em",
            color: "oklch(20% 0.01 260 / 0.35)",
            padding: "0 14px",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
