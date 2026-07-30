import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoSlider, { type Slide } from "@/components/PhotoSlider";
import ProjectPhotoMosaic from "@/components/ProjectPhotoMosaic";
import { getProjectBySlug, getNextProject } from "@/lib/projects-data";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const next = await getNextProject(slug);
  const heroImage = typeof project.heroImage === "object" ? (project.heroImage as Media | null) : null;

  const slides: Slide[] = [
    ...(heroImage ? [{ image: heroImage, caption: null }] : []),
    ...(project.gallery ?? []).map((item) => ({
      image: typeof item.image === "object" ? (item.image as Media) : null,
      caption: item.caption,
    })),
  ];

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
          style={{
            fontWeight: 500,
            fontSize: "clamp(32px, 4.5vw, 50px)",
            lineHeight: 1.15,
            margin: project.subtitle ? "0 0 10px" : "0 0 24px",
            letterSpacing: "-0.01em",
          }}
        >
          {project.title}
        </h1>
        {project.subtitle && (
          <p
            className="font-sans"
            style={{
              fontSize: 11,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.5,
              color: "oklch(20% 0.01 260)",
              margin: "0 0 32px",
            }}
          >
            {project.subtitle}
          </p>
        )}
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "oklch(20% 0.01 260 / 0.75)", margin: "0 0 56px" }}>
          {project.intro}
        </p>
      </section>

      <div style={{ padding: "0 48px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <PhotoSlider slides={slides} aspectRatio="16/10" fallbackLabel={`glavna ${project.imgLabel ?? "fotografija"}`} />
      </div>

      <section
        style={{
          padding: "56px 48px",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          gap: 64,
          flexWrap: "wrap",
          borderBottom: "1px solid oklch(20% 0.01 260 / 0.08)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Leto
          </div>
          <div style={{ fontSize: 15 }}>{project.year}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Stranka
          </div>
          <div style={{ fontSize: 15 }}>{project.stranka}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Vloga
          </div>
          <div style={{ fontSize: 15 }}>{project.vloga}</div>
        </div>
      </section>

      <section style={{ padding: "56px 48px", maxWidth: 760, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <h2 className="font-serif" style={{ fontStyle: "italic", fontWeight: 400, fontSize: 22, margin: "0 0 20px", color: "oklch(55% 0.18 258)" }}>
          Koncept
        </h2>
        <div className="concept">{project.concept && <RichText data={project.concept} />}</div>
      </section>

      {slides.length > 0 && (
        <section style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          <ProjectPhotoMosaic slides={slides} />
        </section>
      )}

      <nav style={{ display: "flex", justifyContent: "space-between", padding: "40px 48px", borderTop: "1px solid oklch(20% 0.01 260 / 0.08)", fontSize: 14 }}>
        <Link href="/" className="nav-link" style={{ textDecoration: "none" }}>
          ← Vsi projekti
        </Link>
        {next && (
          <Link href={`/projects/${next.slug}`} className="nav-link" style={{ textDecoration: "none" }}>
            Naslednji projekt →
          </Link>
        )}
      </nav>

      <Footer />
    </>
  );
}
