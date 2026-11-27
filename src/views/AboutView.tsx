import { Fragment } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAbout, getSettings } from "@/lib/settings";
import type { Media } from "@/payload-types";
import { localizeAbout, T, type Lang } from "@/lib/i18n";

/** The about page, in either language. */
export default async function AboutView({ lang }: { lang: Lang }) {
  const [found, settings] = await Promise.all([getAbout(), getSettings()]);
  const about = localizeAbout(found, lang);
  const t = T[lang];
  const doc = typeof about.portrait === "object" ? (about.portrait as Media | null) : null;
  const portrait = doc?.mimeType?.startsWith("image/") ? doc : null;

  // Work is kept in the same list as schooling in the admin; a row written
  // "Delovne izkušnje - …" is listed under its own heading instead.
  const WORK = /^\s*(delovne izkušnje|work experience)\s*[-–—:]\s*/i;
  const rows = about.education ?? [];
  const education = rows.filter((item) => !WORK.test(item.label));
  const work = rows
    .filter((item) => WORK.test(item.label))
    .map((item) => ({ ...item, label: item.label.replace(WORK, "") }));

  const factRows = [
    { title: t.education, items: education },
    { title: t.work, items: work },
  ].filter((row) => row.items.length > 0);

  return (
    <div className="sheet" lang={lang}>
      <Header active="about" title={t.about} lang={lang} other={lang === "sl" ? "/en/about" : "/about"} />

      <div className="ruled page-grid">
        {/* Without a portrait the text takes its place rather than an empty frame. */}
        {portrait?.url && (
          <div className="cell cell-image is-static">
            <span className="cell-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portrait.url}
                alt={portrait.alt}
                className="cell-photo"
                style={{ objectPosition: `${portrait.focalX ?? 50}% ${portrait.focalY ?? 50}%` }}
              />
            </span>
          </div>
        )}

        {/* An empty first column keeps the text to the same measure and edge as
            the lists below it. */}
        {!portrait?.url && <div className="cell" />}
        <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
          <div className="bio">{about.bio && <RichText data={about.bio} />}</div>
        </div>

        <div className="cell page-cell">
          <span className="page-label">{t.contactLabel}</span>
          <a href={`mailto:${settings.email}`} className="page-note">
            {settings.email}
          </a>
          {settings.phone?.trim() && (
            <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="page-note">
              {settings.phone.trim()}
            </a>
          )}
        </div>

        {factRows.map((row) => (
          <Fragment key={row.title}>
            <div className="cell page-cell">
              <span className="page-label">{row.title}</span>
            </div>
            <div className="cell page-cell" style={{ gridColumn: "span 3" }}>
              <ul className="fact-list">
                {row.items.map((item, i) => (
                  <li key={item.id ?? i}>
                    <span>{item.label}</span>
                    {/* "2017 - 2021" and "2025-2026" typed either way, set as a range. */}
                    <span className="page-note fact-date">{item.dateRange.replace(/\s*[-–]\s*/g, " – ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Fragment>
        ))}

        <div className="cell page-cell">
          <span className="page-label">{t.skills}</span>
        </div>
        <div className="cell page-cell" style={{ gridColumn: "span 3" }}>
          <p className="page-text">{(about.skills ?? []).map((s) => s.skill).join(" · ")}</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
