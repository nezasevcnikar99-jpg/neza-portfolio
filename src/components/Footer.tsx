import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSettings();
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
          {settings.name}
        </div>
        <div style={{ fontSize: 13, color: "oklch(20% 0.01 260 / 0.55)" }}>{settings.email}</div>
      </div>
      <div style={{ fontSize: 12, color: "oklch(20% 0.01 260 / 0.4)" }}>© {new Date().getFullYear()}</div>
    </footer>
  );
}
