import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageSlot from "@/components/ImageSlot";

const SKILLS = [
  "AutoCAD",
  "Rhino + Grasshopper",
  "SketchUp",
  "Adobe InDesign",
  "Adobe Photoshop",
  "Fizični modeli / makete",
  "Tehnično risanje",
  "Pisanje in urejanje besedil",
];

const EDUCATION = [
  { label: "Magistrski študij arhitekture, Fakulteta za arhitekturo, Ljubljana", range: "2019–2022" },
  { label: "Dodiplomski študij arhitekture, Fakulteta za arhitekturo, Ljubljana", range: "2016–2019" },
  { label: "Delovne izkušnje — arhitekturni biro Ravna, projektantka", range: "2022–danes" },
];

export default function AboutPage() {
  return (
    <>
      <Header active="about" />

      <section
        style={{
          flex: 1,
          padding: "80px 48px 100px",
          maxWidth: 920,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ImageSlot label="portret" aspectRatio="4/5" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "oklch(20% 0.01 260 / 0.65)" }}>
            <span>ime.priimek@email.com</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <div>
            <h1
              className="font-serif"
              style={{
                fontWeight: 500,
                fontSize: "clamp(32px, 4vw, 44px)",
                lineHeight: 1.15,
                margin: "0 0 20px",
                letterSpacing: "-0.01em",
              }}
            >
              Ime Priimek
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "oklch(20% 0.01 260 / 0.75)", margin: "0 0 16px" }}>
              Sem arhitektka in avtorica, ki prostor razume kot besedilo — nekaj, kar se bere, preden se zgradi.
              Ukvarjam se z arhitekturnim projektiranjem, pišem eseje o prostoru in spominu, občasno pa oblikujem tudi
              vizualne identitete za manjše biroje in razstave.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "oklch(20% 0.01 260 / 0.75)", margin: 0 }}>
              Zanima me predvsem, kako stavbe nosijo čas — kako material stara, kako tišina postane del načrta. To
              radovednost prenašam med disciplinami: iz skice v stavek in nazaj.
            </p>
          </div>

          <div>
            <h2
              className="font-serif"
              style={{ fontStyle: "italic", fontWeight: 400, fontSize: 20, margin: "0 0 18px", color: "oklch(55% 0.18 258)" }}
            >
              Izobrazba
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {EDUCATION.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    fontSize: 14,
                    borderBottom: i < EDUCATION.length - 1 ? "1px solid oklch(20% 0.01 260 / 0.08)" : undefined,
                    paddingBottom: i < EDUCATION.length - 1 ? 12 : 2,
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: "oklch(20% 0.01 260 / 0.45)", flexShrink: 0 }}>{item.range}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2
              className="font-serif"
              style={{ fontStyle: "italic", fontWeight: 400, fontSize: 20, margin: "0 0 18px", color: "oklch(55% 0.18 258)" }}
            >
              Veščine in orodja
            </h2>
            <div style={{ fontSize: 14, color: "oklch(20% 0.01 260 / 0.75)", lineHeight: 2.3, letterSpacing: "0.01em" }}>
              {SKILLS.join("     ·     ")}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
