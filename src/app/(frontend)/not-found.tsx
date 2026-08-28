import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="sheet">
      <Header title="404" />

      <div className="ruled page-grid">
        <div className="cell page-cell">
          <span className="page-label">Napaka</span>
        </div>
        <div className="cell page-cell" style={{ gridColumn: "span 2" }}>
          <p className="page-lead" style={{ margin: 0 }}>
            Te strani ni.
          </p>
          <p className="page-text">
            Povezava je morda zastarela ali napačno prepisana.
          </p>
          <Link href="/" className="head-link" style={{ marginTop: 4 }}>
            ← Nazaj na projekte
          </Link>
        </div>
        <div className="cell" />
      </div>

      <Footer />
    </div>
  );
}
