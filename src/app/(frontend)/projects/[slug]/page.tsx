import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCollage, { type Slide } from "@/components/ProjectCollage";
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

  // Only the facts that are filled in — an empty label reads as broken.
  const facts = [
    { label: "Leto", value: project.year ? String(project.year) : null },
    { label: "Stranka", value: project.stranka },
    { label: "Vloga", value: project.vloga },
  ].filter((fact) => fact.value);

  return (
    <div className="sheet">
      <Header title={project.title} />

      <div className="ruled project-grid">
        <aside className="cell project-side">
          <Link href="/" className="project-back">
            ← Projekti
          </Link>

          <span className="page-label">
            {project.category} · {project.year}
          </span>

          {project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}
          {project.intro && <p className="project-intro">{project.intro}</p>}

          {facts.length > 0 && (
            <dl className="project-facts">
              {facts.map((fact) => (
                <div key={fact.label} className="project-fact">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {project.concept && (
            <section className="project-concept">
              <h2 className="page-label">Koncept</h2>
              <div className="concept">
                <RichText data={project.concept} />
              </div>
            </section>
          )}
        </aside>

        <ProjectCollage
          slides={slides}
          fallbackTitle={project.title}
          placeholderLabel={project.imgLabel ?? "fotografija"}
        />
      </div>

      <nav className="ruled project-nav">
        <div className="cell page-cell">
          <Link href="/" className="head-link">
            ← Vsi projekti
          </Link>
        </div>
        <div className="cell" />
        <div className="cell" />
        <div className="cell page-cell head-end">
          {next && (
            <Link href={`/projects/${next.slug}`} className="head-link">
              {next.title} →
            </Link>
          )}
        </div>
      </nav>

      <Footer />
    </div>
  );
}
