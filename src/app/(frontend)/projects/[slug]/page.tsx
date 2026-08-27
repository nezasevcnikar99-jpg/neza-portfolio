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

  // Only the facts that are actually filled in — an empty label reads as broken.
  const facts = [
    { label: "Leto", value: project.year ? String(project.year) : null },
    { label: "Stranka", value: project.stranka },
    { label: "Vloga", value: project.vloga },
  ].filter((fact) => fact.value);

  return (
    <div className="sheet">
      <Header active="projects" title="Projekt" />

      <article className="project">
        <div className="project-body">
          <aside className="project-info">
            <Link href="/" className="back-link project-back">
              ← Projekti
            </Link>
            <div className="project-eyebrow">
              {project.category} · {project.year}
            </div>
            <h1 className="project-title">{project.title}</h1>
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
                <h2>Koncept</h2>
                <div className="concept">
                  <RichText data={project.concept} />
                </div>
              </section>
            )}
          </aside>

          <div className="project-visual">
            <ProjectCollage
              slides={slides}
              fallbackTitle={project.title}
              placeholderLabel={project.imgLabel ?? "fotografija"}
            />
          </div>
        </div>

        <nav className="project-nav">
          <Link href="/" className="nav-link">
            ← Vsi projekti
          </Link>
          {next && (
            <Link href={`/projects/${next.slug}`} className="nav-link">
              Naslednji projekt →
            </Link>
          )}
        </nav>
      </article>

      <Footer />
    </div>
  );
}
