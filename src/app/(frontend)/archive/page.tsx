import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArchiveGroups } from "@/lib/projects-data";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Arhiv",
  description: "Vsa dela Neže Sevčnikar po letih in vrstah dela.",
};

export const dynamic = "force-dynamic";

/**
 * Every project by year, with its kind of work beside the title. The kinds are
 * also a filter, as plain links, so it works without script and each filtered
 * list has its own address.
 */
export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ vrsta?: string }> }) {
  const { vrsta } = await searchParams;
  const groups = await getArchiveGroups();
  const all = groups.flatMap((g) => g.items);

  const kinds = CATEGORIES.map((kind) => ({ kind, count: all.filter((p) => p.category === kind).length })).filter(
    (k) => k.count > 0,
  );
  const active = kinds.some((k) => k.kind === vrsta) ? vrsta : null;

  const shown = groups
    .map((g) => ({ ...g, items: active ? g.items.filter((p) => p.category === active) : g.items }))
    .filter((g) => g.items.length > 0);
  const years = all.map((p) => p.year);
  const range = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "";

  return (
    <div className="sheet">
      <Header active="arhiv" title="Arhiv" />

      <div className="ruled page-grid">
        <div className="cell page-cell">
          <span className="page-label">{all.length} del</span>
          <span className="page-note">{range}</span>

          <nav className="archive-filter" aria-label="Vrsta dela">
            <Link href="/archive" className={active ? "archive-kind-link" : "archive-kind-link is-active"}>
              Vse <span>{all.length}</span>
            </Link>
            {kinds.map(({ kind, count }) => (
              <Link
                key={kind}
                href={`/archive?vrsta=${encodeURIComponent(kind)}`}
                className={active === kind ? "archive-kind-link is-active" : "archive-kind-link"}
              >
                {kind} <span>{count}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="cell page-cell archive-cell" style={{ gridColumn: "span 3" }}>
          {shown.map((g) => (
            <section key={g.year} className="archive-year">
              <h2 className="page-label">{g.year}</h2>
              <ul className="archive-list">
                {g.items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/projects/${p.slug}`} className="archive-row">
                      <span className="archive-title">{p.title}</span>
                      <span className="archive-kind">{p.category}</span>
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
