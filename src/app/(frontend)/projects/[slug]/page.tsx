import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCollage, { type Slide } from "@/components/ProjectCollage";
import EssayFigures from "@/components/EssayFigures";
import { getProjectBySlug, getNextProject } from "@/lib/projects-data";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

/** 9,1 MB, 640 kB — Slovene decimal comma. */
const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} kB`;

/** One entry per line; a typed "1." or "1)" in front is dropped, the list numbers itself. */
const lines = (value?: string | null) =>
  (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[.)]\s+/, "").trim())
    .filter(Boolean);

const SUPERSCRIPT = 1 << 6;

/** A superscript number in an essay is a note mark: it links down to its note. */
const withNoteMarks: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: (args) => {
    const { node } = args;
    const n = node.text.trim();
    if (node.format & SUPERSCRIPT && /^\d+$/.test(n)) {
      return (
        <sup className="note-mark" id={`ref-${n}`}>
          <a href={`#opomba-${n}`} aria-label={`Opomba ${n}`}>
            {n}
          </a>
        </sup>
      );
    }
    const text = defaultConverters.text;
    return typeof text === "function" ? text(args) : node.text;
  },
});

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const next = await getNextProject(slug);
  // A written piece is read, not looked at: its text takes the middle of the
  // grid and the pictures move to the side. Chosen per project, not implied by
  // the category, so a text can sit in whatever category suits it.
  const isEssay = project.asText === true;
  const notes = isEssay ? lines(project.notes) : [];
  const sources = isEssay ? lines(project.sources) : [];
  const heroImage = typeof project.heroImage === "object" ? (project.heroImage as Media | null) : null;
  const document = typeof project.document === "object" ? (project.document as Media | null) : null;

  // The hero always holds the first slot on the page; every other picture is
  // there because it was ticked. Rows saved before the tick existed count as
  // ticked, so nothing disappeared when it was added.
  const slides: Slide[] = [
    ...(heroImage ? [{ image: heroImage, caption: null, onPage: true }] : []),
    ...(project.gallery ?? []).map((item) => ({
      image: typeof item.image === "object" ? (item.image as Media) : null,
      caption: item.caption,
      onPage: item.onPage !== false,
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

      <div className={isEssay ? "ruled project-grid essay-grid" : "ruled project-grid"}>
        <aside className="cell project-side">
          <Link href="/" className="project-back">
            ← Projekti
          </Link>

          <span className="page-label">
            {project.category} · {project.year}
          </span>

          {project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}
          {!isEssay && project.intro && <p className="project-intro">{project.intro}</p>}

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

          {document?.url && (
            // Blob is another origin, where the download attribute is ignored;
            // a new tab at least keeps the project page open behind the PDF.
            <a href={document.url} className="project-download" target="_blank" rel="noopener noreferrer">
              <span>{project.documentLabel?.trim() || "Celoten dokument"}</span>
              <span className="project-download-meta">
                PDF{document.filesize ? `, ${fileSize(document.filesize)}` : ""} ↓
              </span>
            </a>
          )}

          {!isEssay && project.concept && (
            <section className="project-concept">
              <h2 className="page-label">Koncept</h2>
              <div className="concept">
                <RichText data={project.concept} />
              </div>
            </section>
          )}
        </aside>

        {isEssay ? (
          <>
            <article className="cell essay-text">
              {project.intro && <p className="essay-lead">{project.intro}</p>}
              {project.concept && (
                <div className="essay-body">
                  <RichText data={project.concept} converters={withNoteMarks} />
                </div>
              )}
              {(notes.length > 0 || sources.length > 0) && (
                <footer className="essay-apparatus">
                  {notes.length > 0 && (
                    <section className="essay-notes">
                      <h2 className="essay-apparatus-title">Opombe</h2>
                      <ol>
                        {notes.map((note, i) => (
                          <li key={i} id={`opomba-${i + 1}`}>
                            <span className="essay-note-num">{i + 1}</span>
                            <span className="essay-note-text">
                              {note}{" "}
                              <a href={`#ref-${i + 1}`} className="essay-note-back" aria-label="Nazaj v besedilo">
                                ↩
                              </a>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                  {sources.length > 0 && (
                    <section className="essay-sources">
                      <h2 className="essay-apparatus-title">Viri</h2>
                      <ul>
                        {sources.map((source, i) => (
                          <li key={i}>{source}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                </footer>
              )}
            </article>
            <EssayFigures slides={slides} title={project.title} />
          </>
        ) : (
          <ProjectCollage
            slides={slides}
            fallbackTitle={project.title}
            placeholderLabel={project.imgLabel ?? "fotografija"}
          />
        )}
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
