import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArchiveGroups } from "@/lib/projects-data";
import { CATEGORIES } from "@/lib/categories";
import { href, kind, localize, T, type Lang } from "@/lib/i18n";

/**
 * Every project by year, with its kind of work beside the title. The kinds are
 * also a filter, as plain links, so it works without script and each filtered
 * list has its own address.
 */
export default async function ArchiveView({ vrsta, lang }: { vrsta?: string; lang: Lang }) {
  const t = T[lang];
  const base = href(lang, "/archive");
  const groups = (await getArchiveGroups()).map((g) => ({
    ...g,
    items: g.items.map((p) => ({ ...localize(p, lang), num: p.num })),
  }));
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
    <div className="sheet" lang={lang}>
      <Header active="arhiv" title={t.archive} lang={lang} other={lang === "sl" ? "/en/archive" : "/archive"} />

      <div className="ruled page-grid">
        <div className="cell page-cell">
          <span className="page-label">{t.works(all.length)}</span>
          <span className="page-note">{range}</span>

          <nav className="archive-filter" aria-label={t.kindOfWork}>
            <Link href={base} className={active ? "archive-kind-link" : "archive-kind-link is-active"}>
              {t.all} <span>{all.length}</span>
            </Link>
            {kinds.map(({ kind: kindName, count }) => (
              <Link
                key={kindName}
                href={`${base}?vrsta=${encodeURIComponent(kindName)}`}
                className={active === kindName ? "archive-kind-link is-active" : "archive-kind-link"}
              >
                {kind(lang, kindName)} <span>{count}</span>
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
                    <Link href={href(lang, `/projects/${p.slug}`)} className="archive-row">
                      <span className="archive-title">{p.title}</span>
                      <span className="archive-kind">{kind(lang, p.category)}</span>
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
