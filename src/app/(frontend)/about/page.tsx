import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageSlot from "@/components/ImageSlot";
import { getAbout } from "@/lib/settings";
import { getSettings } from "@/lib/settings";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const portrait = typeof about.portrait === "object" ? (about.portrait as Media | null) : null;

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
          <ImageSlot label="portret" aspectRatio="4/5" src={portrait?.url} alt={portrait?.alt} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "oklch(20% 0.01 260 / 0.65)" }}>
            <span>{settings.email}</span>
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
              {settings.name}
            </h1>
            <div className="bio">{about.bio && <RichText data={about.bio} />}</div>
          </div>

          <div>
            <h2
              className="font-serif"
              style={{ fontStyle: "italic", fontWeight: 400, fontSize: 20, margin: "0 0 18px", color: "oklch(55% 0.18 258)" }}
            >
              Izobrazba
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(about.education ?? []).map((item, i, arr) => (
                <div
                  key={item.id ?? i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    fontSize: 14,
                    borderBottom: i < arr.length - 1 ? "1px solid oklch(20% 0.01 260 / 0.08)" : undefined,
                    paddingBottom: i < arr.length - 1 ? 12 : 2,
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ color: "oklch(20% 0.01 260 / 0.45)", flexShrink: 0 }}>{item.dateRange}</span>
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
              {(about.skills ?? []).map((s) => s.skill).join("     ·     ")}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
