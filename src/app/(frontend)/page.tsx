import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectGrid from "@/components/ProjectGrid";
import { getAllProjects } from "@/lib/projects-data";
import { getHome } from "@/lib/settings";

export default async function Home() {
  const [home, projects] = await Promise.all([getHome(), getAllProjects()]);

  return (
    <>
      <Header active="delo" />

      <section
        style={{
          padding: "110px 48px 70px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 900 }}>
          <h1
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: "clamp(36px, 5vw, 58px)",
              lineHeight: 1.12,
              margin: "0 0 24px",
              letterSpacing: "-0.01em",
            }}
          >
            {home.heroLead}{" "}
            <span style={{ fontStyle: "italic", color: "oklch(55% 0.18 258)" }}>{home.heroAccent}</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "oklch(20% 0.01 260 / 0.7)", maxWidth: 560, margin: 0 }}>
            {home.heroDescription}
          </p>
        </div>
      </section>

      <ProjectGrid projects={projects} />

      <Footer />
    </>
  );
}
