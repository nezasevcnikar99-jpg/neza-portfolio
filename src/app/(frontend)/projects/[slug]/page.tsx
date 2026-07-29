import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageSlot from "@/components/ImageSlot";
import { getAllProjects, getProjectBySlug, getNextProject } from "@/lib/projects-data";
import type { Media } from "@/payload-types";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const next = await getNextProject(slug);
  const heroImage = typeof project.heroImage === "object" ? (project.heroImage as Media | null) : null;

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
          {project.intro}
        </p>
      </section>

      <ImageSlot
        label={`glavna ${project.imgLabel ?? "fotografija"}`}
        aspectRatio="16/9"
        className="block"
        src={heroImage?.url}
        alt={heroImage?.alt}
      />

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
          <div style={{ fontSize: 15 }}>{project.year}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "oklch(20% 0.01 260 / 0.45)", marginBottom: 6 }}>
            Stranka
          </div>
          <div style={{ fontSize: 15 }}>{project.stranka}</div>
        </div>
        <div>
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

      {project.gallery && project.gallery.length > 0 && (
        <section style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
            {project.gallery.map((item, i) => {
              const image = typeof item.image === "object" ? (item.image as Media) : null;
              return (
                <ImageSlot
                  key={item.id ?? i}
                  label={item.caption ?? "slika"}
                  aspectRatio="4/3"
                  src={image?.url}
                  alt={image?.alt ?? item.caption ?? undefined}
                />
              );
            })}
          </div>
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
