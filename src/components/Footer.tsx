export default function Footer() {
  return (
    <footer
      style={{
        padding: "56px 48px",
        borderTop: "1px solid oklch(20% 0.01 260 / 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 24,
      }}
    >
      <div>
        <div className="font-serif" style={{ fontSize: 15, marginBottom: 8 }}>
          Ime Priimek
        </div>
        <div style={{ fontSize: 13, color: "oklch(20% 0.01 260 / 0.55)" }}>ime.priimek@email.com</div>
      </div>
      <div style={{ fontSize: 12, color: "oklch(20% 0.01 260 / 0.4)" }}>© 2026</div>
    </footer>
  );
}
