import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArchiveGroups } from "@/lib/projects-data";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  const years = groups.map((g) => g.year);
  const yearRange = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";

  return (
    <div className="sheet">
      <Header active="projects" title="Arhiv" />

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
           
            style={{ fontWeight: 500, fontSize: "clamp(32px, 4.5vw, 50px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}
          >
            Arhiv
          </h1>
          <div style={{ fontSize: 13, color: "var(--faint)" }}>
            {total} del, {yearRange}
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.year} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 32, marginBottom: 8 }}>
            <div
             
              style={{ fontWeight: 500, fontSize: 14, letterSpacing: "0.06em", color: "var(--faint)", paddingTop: 20 }}
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
                    gridTemplateColumns: "1fr auto",
                    alignItems: "baseline",
                    gap: 20,
                    paddingTop: 14,
                    paddingBottom: 14,
                    borderBottom: "1px solid var(--rule)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span style={{ fontSize: 19 }}>
                    {p.title}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--faint)" }}>{p.num}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
