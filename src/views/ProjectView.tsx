import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCollage, { type Slide } from "@/components/ProjectCollage";
import EssayFigures from "@/components/EssayFigures";
import { getProjectBySlug, getNextProject } from "@/lib/projects-data";
import { href, kind, localize, T, type Lang } from "@/lib/i18n";
import type { Media } from "@/payload-types";

/** 9,1 MB in Slovene, 9.1 MB in English. */
const fileSize = (bytes: number, lang: Lang) => {
  const mb = (bytes / 1024 / 1024).toFixed(1);
  return bytes >= 1024 * 1024
    ? `${lang === "sl" ? mb.replace(".", ",") : mb} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} kB`;
};

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

/** The first sentence, so a link preview reads as a sentence and not a cut. */
const firstSentence = (text: string) => (text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text).slice(0, 200);

export async function projectMetadata(slug: string, lang: Lang): Promise<Metadata> {
  const found = await getProjectBySlug(slug);
  if (!found) return {};
  const project = localize(found, lang);
  const hero = typeof project.heroImage === "object" ? (project.heroImage as Media | null) : null;
  const description = [project.subtitle, project.intro && firstSentence(project.intro)]
    .filter(Boolean)
    .join(". ")
    .replace(/\.\./g, ".");
  const title = `${project.title} – Neža Sevčnikar`;
  const images = hero?.url && hero.mimeType?.startsWith("image/") ? [{ url: hero.url, alt: project.title }] : undefined;
  return {
    title: project.title,
    alternates: {
      canonical: href(lang, `/projects/${slug}`),
      languages: { sl: `/projects/${slug}`, en: `/en/projects/${slug}` },
    },
    description: description || undefined,
    openGraph: { title, description: description || undefined, ...(images ? { images } : {}) },
    twitter: { title, description: description || undefined, ...(images ? { images } : {}) },
  };
}

/** A project's page, in either language; the routes only choose which. */
export default async function ProjectView({ slug, lang }: { slug: string; lang: Lang }) {
  const found = await getProjectBySlug(slug);

  if (!found) {
    notFound();
  }

  const t = T[lang];
  const project = localize(found, lang);
  const nextFound = await getNextProject(slug);
  const next = nextFound ? localize(nextFound, lang) : null;
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
    { label: t.year, value: project.year ? String(project.year) : null },
    { label: t.client, value: project.stranka },
    { label: t.role, value: project.vloga },
  ].filter((fact) => fact.value);

  return (
    <div className="sheet" lang={lang}>
      <Header
        title={project.title}
        lang={lang}
        other={lang === "sl" ? `/en/projects/${slug}` : `/projects/${slug}`}
      />

      <div className={isEssay ? "ruled project-grid essay-grid" : "ruled project-grid"}>
        <aside className="cell project-side">
          <Link href={href(lang, "/")} className="project-back">
            {t.back}
          </Link>

          <span className="page-label">
            {kind(lang, project.category)} · {project.year}
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
              <span>{project.documentLabel?.trim() || t.wholeDocument}</span>
              <span className="project-download-meta">
                PDF{document.filesize ? `, ${fileSize(document.filesize, lang)}` : ""} ↓
              </span>
            </a>
          )}

          {!isEssay && project.concept && (
            <section className="project-concept">
              <h2 className="page-label">{t.concept}</h2>
              <div className="concept">
                <RichText data={project.concept} />
              </div>
            </section>
          )}
        </aside>

        {isEssay ? (
          <>
            {/* The essays are written in Slovene and stay so; the English site
                says it, and marks the text as Slovene for readers and screen readers. */}
            <article className="cell essay-text" lang="sl">
              {lang === "en" && (
                <p className="essay-language" lang="en">
                  {t.essayInSlovene}
                </p>
              )}
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
                      <h2 className="essay-apparatus-title">{lang === "en" ? "Opombe" : t.notes}</h2>
                      <ol>
                        {notes.map((note, i) => (
                          <li key={i} id={`opomba-${i + 1}`}>
                            <span className="essay-note-num">{i + 1}</span>
                            <span className="essay-note-text">
                              {note}{" "}
                              <a href={`#ref-${i + 1}`} className="essay-note-back" aria-label={t.backToText}>
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
                      <h2 className="essay-apparatus-title">{lang === "en" ? "Viri" : t.sources}</h2>
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
            <EssayFigures slides={slides} title={project.title} notes={notes} lang={lang} />
          </>
        ) : (
          <ProjectCollage
            slides={slides}
            fallbackTitle={project.title}
            placeholderLabel={project.imgLabel ?? t.photo}
            lang={lang}
          />
        )}
      </div>

      <nav className="ruled project-nav">
        <div className="cell page-cell">
          <Link href={href(lang, "/")} className="head-link">
            {t.allProjects}
          </Link>
        </div>
        <div className="cell" />
        <div className="cell" />
        <div className="cell page-cell head-end">
          {next && (
            <Link href={href(lang, `/projects/${next.slug}`)} className="head-link">
              {next.title} →
            </Link>
          )}
        </div>
      </nav>

      <Footer />
    </div>
  );
}
