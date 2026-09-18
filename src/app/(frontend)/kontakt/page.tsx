import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt za povpraševanja o projektih, sodelovanjih in besedilih.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="sheet">
      <Header active="kontakt" title="Kontakt" />

      <div className="ruled page-grid">
        <div className="cell page-cell">
          <span className="page-label">Pošta</span>
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
              <span className="page-label">Telefon</span>
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
            Za povpraševanja o projektih, sodelovanjih in besedilih mi pišite ali me pokličite.
          </p>
        </div>
        <div className="cell" />
      </div>

      <Footer />
    </div>
  );
}
