import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";
import { T, type Lang } from "@/lib/i18n";

/** The contact page, in either language. */
export default async function ContactView({ lang }: { lang: Lang }) {
  const settings = await getSettings();
  const t = T[lang];

  return (
    <div className="sheet" lang={lang}>
      <Header active="kontakt" title={t.contact} lang={lang} other={lang === "sl" ? "/en/contact" : "/kontakt"} />

      <div className="ruled page-grid">
        <div className="cell page-cell">
          <span className="page-label">{t.mail}</span>
        </div>
        <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
          <a href={`mailto:${settings.email}`} className="page-lead">
            {settings.email}
          </a>
        </div>
        <div className="cell" />

        {settings.phone?.trim() && (
          <>
            <div className="cell page-cell">
              <span className="page-label">{t.phone}</span>
            </div>
            <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="page-lead">
                {settings.phone.trim()}
              </a>
            </div>
            <div className="cell" />
          </>
        )}
        {settings.linkedin?.trim() && (
          <>
            <div className="cell page-cell">
              <span className="page-label">LinkedIn</span>
            </div>
            <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
              <a href={settings.linkedin.trim()} className="page-note" target="_blank" rel="noopener noreferrer">
                {settings.linkedin.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            </div>
            <div className="cell" />
          </>
        )}

        <div className="cell" />
        <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
          <p className="page-text">
            {t.contactText}
          </p>
        </div>
        <div className="cell" />
      </div>

      <Footer />
    </div>
  );
}
