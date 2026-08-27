import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSettings();
  return (
    <footer
      style={{
        padding: "56px var(--page-pad)",
        borderTop: "1px solid var(--rule)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 24,
      }}
    >
      <div>
        <div style={{ fontSize: 15, marginBottom: 8 }}>
          {settings.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{settings.email}</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--faint)" }}>© {new Date().getFullYear()}</div>
    </footer>
  );
}
