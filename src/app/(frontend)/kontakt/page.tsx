import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";

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

        <div className="cell" />
        <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
          <p className="page-text">
            Za povpraševanja o projektih, sodelovanjih in besedilih pišite na zgornji naslov.
          </p>
        </div>
        <div className="cell" />
      </div>

      <Footer />
    </div>
  );
}
