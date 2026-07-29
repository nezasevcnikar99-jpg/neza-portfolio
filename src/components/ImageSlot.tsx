export default function ImageSlot({
  label,
  aspectRatio,
  className,
}: {
  label: string;
  aspectRatio: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius: 2,
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
        {label}
      </span>
    </div>
  );
}
