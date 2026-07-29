export default function ImageSlot({
  label,
  aspectRatio,
  className,
  src,
  alt,
}: {
  label: string;
  aspectRatio: string;
  className?: string;
  src?: string | null;
  alt?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius: 2,
        overflow: "hidden",
        background: src
          ? undefined
          : "repeating-linear-gradient(135deg, oklch(20% 0.01 260 / 0.05) 0px, oklch(20% 0.01 260 / 0.05) 1px, transparent 1px, transparent 9px), oklch(96% 0.006 260)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? label}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
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
