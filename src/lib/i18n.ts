import type { About, Project } from "@/payload-types";

/**
 * The site in two languages. Slovene lives at the root, English under /en.
 * Content carries its English beside the Slovene (fields ending in "En"); where
 * a piece has none yet, the Slovene is shown, so nothing on the English site is
 * ever empty. The essays stay in Slovene on purpose and say so.
 */
export type Lang = "sl" | "en";

/** The English address of a page, from its Slovene one. */
export function href(lang: Lang, path: string): string {
  if (lang === "sl") return path;
  if (path === "/") return "/en";
  if (path === "/kontakt") return "/en/contact";
  return `/en${path}`;
}

/** The other language's address for the page now shown, for the switch. */
export function counterpart(lang: Lang, path: string): string {
  if (lang === "sl") return href("en", path);
  const sl = path.replace(/^\/en(?=\/|$)/, "") || "/";
  return sl === "/contact" ? "/kontakt" : sl;
}

const KINDS: Record<string, string> = {
  "Idejna zasnova": "Conceptual design",
  "Seminarski projekt": "Studio project",
  Raziskava: "Research",
  Natečaj: "Competition",
  Esej: "Essay",
  "Grafično oblikovanje": "Graphic design",
};

/** A kind of work in the reader's language. */
export const kind = (lang: Lang, category?: string | null) =>
  !category ? "" : lang === "en" ? (KINDS[category] ?? category) : category;

export const T = {
  sl: {
    projects: "Projekti",
    archive: "Arhiv",
    about: "O meni",
    contact: "Kontakt",
    back: "← Projekti",
    allProjects: "← Vsi projekti",
    year: "Leto",
    client: "Stranka",
    role: "Vloga",
    concept: "Koncept",
    notes: "Opombe",
    sources: "Viri",
    backToText: "Nazaj v besedilo",
    wholeDocument: "Celoten dokument",
    openGallery: "Odpri galerijo",
    pictures: (n: number) => `${n} slik`,
    galleryLabel: "Galerija projekta",
    closeGallery: "Zapri galerijo",
    prev: "Prejšnja fotografija",
    next: "Naslednja fotografija",
    photo: "fotografija",
    works: (n: number) => `${n} del`,
    all: "Vse",
    kindOfWork: "Vrsta dela",
    contactLabel: "Kontakt",
    mail: "Pošta",
    phone: "Telefon",
    education: "Izobrazba",
    work: "Delovne izkušnje",
    skills: "Veščine",
    contactText: "Za povpraševanja o projektih, sodelovanjih in besedilih mi pišite ali me pokličite.",
    essayInSlovene: "",
    switchTo: "EN",
    switchLabel: "English",
  },
  en: {
    projects: "Projects",
    archive: "Archive",
    about: "About",
    contact: "Contact",
    back: "← Projects",
    allProjects: "← All projects",
    year: "Year",
    client: "Client",
    role: "Credits",
    concept: "Concept",
    notes: "Notes",
    sources: "Sources",
    backToText: "Back to the text",
    wholeDocument: "Full document",
    openGallery: "Open gallery",
    pictures: (n: number) => `${n} pictures`,
    galleryLabel: "Project gallery",
    closeGallery: "Close gallery",
    prev: "Previous picture",
    next: "Next picture",
    photo: "photograph",
    works: (n: number) => `${n} works`,
    all: "All",
    kindOfWork: "Kind of work",
    contactLabel: "Contact",
    mail: "Email",
    phone: "Phone",
    education: "Education",
    work: "Work experience",
    skills: "Skills",
    contactText: "For enquiries about projects, collaborations and writing, write to me or call.",
    essayInSlovene: "This essay is written in Slovene.",
    switchTo: "SL",
    switchLabel: "Slovenščina",
  },
} as const;

export type Strings = (typeof T)[Lang];

/**
 * A project as the given language shows it: every text that has an English
 * version takes it, everything else stays as written. Pictures, order and
 * settings are untouched, so both languages show the same project.
 */
export function localize(project: Project, lang: Lang): Project {
  if (lang === "sl") return project;
  const pick = <V,>(en: V | null | undefined, sl: V) => (en !== null && en !== undefined && en !== "" ? en : sl);
  return {
    ...project,
    title: pick(project.titleEn, project.title),
    subtitle: pick(project.subtitleEn, project.subtitle),
    quote: pick(project.quoteEn, project.quote),
    intro: pick(project.introEn, project.intro),
    concept: pick(project.conceptEn, project.concept),
    vloga: pick(project.vlogaEn, project.vloga),
    stranka: pick(project.strankaEn, project.stranka),
    documentLabel: pick(project.documentLabelEn, project.documentLabel),
    gallery: (project.gallery ?? []).map((row) => ({ ...row, caption: pick(row.captionEn, row.caption) })),
  };
}

/** The about page in the given language, falling back the same way. */
export function localizeAbout(about: About, lang: Lang): About {
  if (lang === "sl") return about;
  return {
    ...about,
    bio: about.bioEn ?? about.bio,
    education: (about.education ?? []).map((row) => ({
      ...row,
      label: row.labelEn?.trim() || row.label,
      dateRange: row.dateRange.replace(/\bdanes\b/i, "present"),
    })),
    skills: (about.skills ?? []).map((row) => ({ ...row, skill: row.skillEn?.trim() || row.skill })),
  };
}
