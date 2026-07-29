import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageSlot from "@/components/ImageSlot";
import { PROJECTS, getProjectBySlug, getNextProject } from "@/lib/projects";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const next = getNextProject(slug);

  return (
    <>
      <Header active="delo" />

      <Link
        href="/"
        className="back-link"
        style={{
          margin: "32px 48px 0",
          fontSize: 13,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← Nazaj na delo
      </Link>

      <section style={{ padding: "24px 48px 0", maxWidth: 760 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.03em", textTransform: "uppercase", color: "oklch(55% 0.18 258)", marginBottom: 14 }}>
          {project.category} · {project.year}
        </div>
        <h1
          className="font-serif"
          style={{ fontWeight: 500, fontSize: "clamp(32px, 4.5vw, 50px)", lineHeight: 1.15, margin: "0 0 24px", letterSpacing: "-0.01em" }}
        >
          {project.title}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "oklch(20% 0.01 260 / 0.75)", margin: "0 0 56px" }}>
          {project.detail.intro}
        </p>
      </section>

      <ImageSlot label={`glavna ${project.imgLabel}`} aspectRatio="16/9" className="block" />

      <section
        style={{
          padding: "56px 48px",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          borderBottom: "1px solid oklch(20% 0.01 260 / 0.08)",
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Leto
          </div>
          <div style={{ fontSize: 15 }}>{project.detail.meta.leto}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Stranka
          </div>
          <div style={{ fontSize: 15 }}>{project.detail.meta.stranka}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Vloga
          </div>
          <div style={{ fontSize: 15 }}>{project.detail.meta.vloga}</div>
        </div>
      </section>

      <section style={{ padding: "56px 48px", maxWidth: 760, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <h2 className="font-serif" style={{ fontStyle: "italic", fontWeight: 400, fontSize: 22, margin: "0 0 20px", color: "oklch(55% 0.18 258)" }}>
          Koncept
        </h2>
        {project.detail.concept.map((paragraph, i) => (
          <p
            key={i}
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: "oklch(20% 0.01 260 / 0.78)",
              margin: i < project.detail.concept.length - 1 ? "0 0 18px" : 0,
            }}
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
          {project.detail.gallery.map((label, i) => (
            <ImageSlot key={i} label={label} aspectRatio="4/3" />
          ))}
        </div>
      </section>

      <nav style={{ display: "flex", justifyContent: "space-between", padding: "40px 48px", borderTop: "1px solid oklch(20% 0.01 260 / 0.08)", fontSize: 14 }}>
        <Link href="/" className="nav-link" style={{ textDecoration: "none" }}>
          ← Vsi projekti
        </Link>
        <Link href={`/projects/${next.slug}`} className="nav-link" style={{ textDecoration: "none" }}>
          Naslednji projekt →
        </Link>
      </nav>

      <Footer />
    </>
  );
}
