import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArchiveGroups } from "@/lib/projects-data";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  const years = groups.map((g) => g.year);
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";

  return (
    <div className="sheet">
      <Header active="arhiv" title="Arhiv" />

      <div className="ruled page-grid">
        <div className="cell page-cell">
          <span className="page-label">{total} del</span>
          <span className="page-note">{range}</span>
        </div>

        <div className="cell page-cell archive-cell" style={{ gridColumn: "span 3" }}>
          {groups.map((g) => (
            <section key={g.year} className="archive-year">
              <h2 className="page-label">{g.year}</h2>
              <ul className="archive-list">
                {g.items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/projects/${p.slug}`} className="archive-row">
                      <span className="archive-title">{p.title}</span>
                      <span className="archive-num">{p.num}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
