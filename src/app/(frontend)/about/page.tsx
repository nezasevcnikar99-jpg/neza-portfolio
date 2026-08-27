import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAbout, getSettings } from "@/lib/settings";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const doc = typeof about.portrait === "object" ? (about.portrait as Media | null) : null;
  const portrait = doc?.mimeType?.startsWith("image/") ? doc : null;

  return (
    <div className="sheet">
      <Header active="about" title="O meni" />

      <div className="ruled page-grid">
        <div className="cell cell-image is-static">
          <span className="cell-inner">
            {portrait?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portrait.url}
                alt={portrait.alt}
                className="cell-photo"
                style={{ objectPosition: `${portrait.focalX ?? 50}% ${portrait.focalY ?? 50}%` }}
              />
            ) : (
              <span className="cell-blank">portret</span>
            )}
          </span>
        </div>

        <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
          <div className="bio">{about.bio && <RichText data={about.bio} />}</div>
        </div>

        <div className="cell page-cell">
          <span className="page-label">Pošta</span>
          <a href={`mailto:${settings.email}`} className="page-note">
            {settings.email}
          </a>
        </div>

        <div className="cell page-cell">
          <span className="page-label">Izobrazba</span>
        </div>
        <div className="cell page-cell" style={{ gridColumn: "span 3" }}>
          <ul className="fact-list">
            {(about.education ?? []).map((item, i) => (
              <li key={item.id ?? i}>
                <span>{item.label}</span>
                <span className="page-note">{item.dateRange}</span>
              </li>
            ))}
          </ul>
        </div>

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
