import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PROJECTS, getArchiveGroups } from "@/lib/projects";

export default function ArchivePage() {
  const groups = getArchiveGroups();

  return (
    <>
      <Header active="arhiv" />

      <section
        style={{
          flex: 1,
          padding: "110px 48px 100px",
          maxWidth: 1000,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
            marginBottom: 64,
            flexWrap: "wrap",
          }}
        >
          <h1
            className="font-serif"
            style={{ fontWeight: 500, fontSize: "clamp(32px, 4.5vw, 50px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}
          >
            Arhiv <span style={{ fontStyle: "italic", color: "oklch(55% 0.18 258)" }}>projektov.</span>
          </h1>
          <div style={{ fontSize: 13, color: "oklch(20% 0.01 260 / 0.45)" }}>{PROJECTS.length} del, 2020–2024</div>
        </div>

        {groups.map((g) => (
          <div key={g.year} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 32, marginBottom: 8 }}>
            <div
              className="font-sans"
              style={{ fontWeight: 500, fontSize: 14, letterSpacing: "0.06em", color: "oklch(20% 0.01 260 / 0.35)", paddingTop: 20 }}
            >
              {g.year}
            </div>
            <div>
              {g.items.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="archive-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    alignItems: "baseline",
                    gap: 20,
                    padding: "14px 0",
                    borderBottom: "1px solid oklch(20% 0.01 260 / 0.08)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span className="font-serif" style={{ fontSize: 19 }}>
                    {p.title}
                  </span>
                  <span style={{ fontSize: 12, letterSpacing: "0.03em", textTransform: "uppercase", color: "oklch(55% 0.18 258)" }}>
                    {p.category}
                  </span>
                  <span style={{ fontSize: 13, color: "oklch(20% 0.01 260 / 0.3)" }}>{p.num}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
}
