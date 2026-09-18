import type { Metadata } from "next";
import { Fragment } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAbout, getSettings } from "@/lib/settings";
import type { Media } from "@/payload-types";

export const metadata: Metadata = {
  title: "O meni",
  description: "Neža Sevčnikar — izobrazba, izkušnje in veščine.",
  openGraph: { title: "O meni — Neža Sevčnikar", description: "Neža Sevčnikar — izobrazba, izkušnje in veščine." },
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const doc = typeof about.portrait === "object" ? (about.portrait as Media | null) : null;
  const portrait = doc?.mimeType?.startsWith("image/") ? doc : null;

  // Work is kept in the same list as schooling in the admin; a row written
  // "Delovne izkušnje - …" is listed under its own heading instead.
  const WORK = /^\s*delovne izkušnje\s*[-–—:]\s*/i;
  const rows = about.education ?? [];
  const education = rows.filter((item) => !WORK.test(item.label));
  const work = rows
    .filter((item) => WORK.test(item.label))
    .map((item) => ({ ...item, label: item.label.replace(WORK, "") }));

  const factRows = [
    { title: "Izobrazba", items: education },
    { title: "Delovne izkušnje", items: work },
  ].filter((row) => row.items.length > 0);

  return (
    <div className="sheet">
      <Header active="about" title="O meni" />

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

        <div className="cell page-cell" style={{ gridColumn: portrait?.url ? "span 2" : "span 3" }}>
          <div className="bio">{about.bio && <RichText data={about.bio} />}</div>
        </div>

        <div className="cell page-cell">
          <span className="page-label">Pošta</span>
          <a href={`mailto:${settings.email}`} className="page-note">
            {settings.email}
          </a>
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
                    <span className="page-note">{item.dateRange}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Fragment>
        ))}

        <div className="cell page-cell">
          <span className="page-label">Veščine</span>
        </div>
        <div className="cell page-cell" style={{ gridColumn: "span 3" }}>
          <p className="page-text">{(about.skills ?? []).map((s) => s.skill).join(" · ")}</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
