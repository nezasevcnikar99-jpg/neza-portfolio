export type Category = "Arhitektura" | "Literarni esej" | "Grafika";

export interface ProjectDetail {
  intro: string;
  meta: { leto: string; stranka: string; vloga: string };
  concept: string[];
  gallery: [string, string, string, string];
}

export interface Project {
  slug: string;
  title: string;
  category: Category;
  year: number;
  quote: string;
  imgLabel: string;
  detail: ProjectDetail;
}

export const CATEGORIES = ["Vse", "Arhitektura", "Literarni esej", "Grafika"] as const;

export const GRID_SIZES = [
  { col: 2, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 2, row: 1 },
  { col: 1, row: 1 },
];

const placeholderDetail = (year: number): ProjectDetail => ({
  intro: "Podroben opis projekta bo dodan kmalu.",
  meta: { leto: String(year), stranka: "—", vloga: "—" },
  concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  gallery: ["detajl", "notranjost", "tloris / skica", "zunanjost"],
});

export const PROJECTS: Project[] = [
  {
    slug: "stanovanjska-hisa-na-robu-gozda",
    title: "Stanovanjska hiša na robu gozda",
    category: "Arhitektura",
    year: 2024,
    quote: "Hiša se ne postavi proti gozdu, temveč vanj.",
    imgLabel: "fotografija objekta",
    detail: {
      intro:
        "Enodružinska hiša na robu gozda, zasnovana kot zaporedje zavetij, ki se odpirajo proti krošnjam. Lesena konstrukcija in temna lesena obloga hišo potopita v okolico, medtem ko notranjost ostaja svetla in odprta.",
      meta: { leto: "2024", stranka: "Zasebna naročnica", vloga: "Projektiranje, vodenje izvedbe" },
      concept: [
        "Parcela je bila zaraščena in strma, z redkimi jasami med drevesi. Namesto ene same stavbe smo zasnovali tri manjše volumne, povezane s pokritim hodnikom — vsak s svojim razgledom in svojo svetlobo.",
        "Fasada iz zoglenelega lesa (shou sugi ban) skozi leta temni in sivi skupaj z lubjem okoliških borov, medtem ko notranje površine ostajajo iz svetlega hrasta — kontrast med zunanjim umikom in notranjo toplino.",
      ],
      gallery: ["notranjost, dnevni prostor", "detajl fasade", "tloris / načrt", "pogled od zunaj, večer"],
    },
  },
  {
    slug: "preureditev-opuscene-mlekarne",
    title: "Preureditev opuščene mlekarne",
    category: "Arhitektura",
    year: 2023,
    quote: "Stari zidovi so znali čakati.",
    imgLabel: "fotografija objekta",
    detail: placeholderDetail(2023),
  },
  {
    slug: "paviljon-ob-jezeru",
    title: "Paviljon ob jezeru",
    category: "Arhitektura",
    year: 2023,
    quote: "Streha kot obzorje, ki se ne konča.",
    imgLabel: "vizualizacija",
    detail: placeholderDetail(2023),
  },
  {
    slug: "mestna-knjiznica-natecaj",
    title: "Mestna knjižnica — natečaj",
    category: "Arhitektura",
    year: 2022,
    quote: "Prostor, kjer tišina bere z nami.",
    imgLabel: "konceptna skica",
    detail: placeholderDetail(2022),
  },
  {
    slug: "vrtec-soncek-prizidek",
    title: "Vrtec Sonček, prizidek",
    category: "Arhitektura",
    year: 2022,
    quote: "Merilo otroka, ne merilo stavbe.",
    imgLabel: "fotografija objekta",
    detail: placeholderDetail(2022),
  },
  {
    slug: "obnova-kmecke-domacije",
    title: "Obnova kmečke domačije",
    category: "Arhitektura",
    year: 2021,
    quote: "Vsaka razpoka nosi svoj datum.",
    imgLabel: "fotografija objekta",
    detail: placeholderDetail(2021),
  },
  {
    slug: "poslovna-stavba-ob-savi",
    title: "Poslovna stavba ob Savi",
    category: "Arhitektura",
    year: 2021,
    quote: "Fasada, ki diha z reko.",
    imgLabel: "vizualizacija",
    detail: placeholderDetail(2021),
  },
  {
    slug: "paviljon-za-razstavo-lesa",
    title: "Paviljon za razstavo lesa",
    category: "Arhitektura",
    year: 2020,
    quote: "Les govori, če mu pustimo.",
    imgLabel: "fotografija objekta",
    detail: placeholderDetail(2020),
  },
  {
    slug: "terasasta-stanovanjska-soseska",
    title: "Terasasta stanovanjska soseska",
    category: "Arhitektura",
    year: 2020,
    quote: "Sosedstvo, sestavljeno iz teras.",
    imgLabel: "maketa",
    detail: placeholderDetail(2020),
  },
  {
    slug: "o-prostoru-ki-nas-oblikuje",
    title: "O prostoru, ki nas oblikuje",
    category: "Literarni esej",
    year: 2024,
    quote: "Prostor nas oblikuje, še preden spregovorimo.",
    imgLabel: "naslovni detajl",
    detail: placeholderDetail(2024),
  },
  {
    slug: "tisina-med-zidovi",
    title: "Tišina med zidovi",
    category: "Literarni esej",
    year: 2023,
    quote: "Tišina ni odsotnost, je gradivo.",
    imgLabel: "naslovni detajl",
    detail: placeholderDetail(2023),
  },
  {
    slug: "beton-in-spomin",
    title: "Beton in spomin",
    category: "Literarni esej",
    year: 2022,
    quote: "Beton pomni tisto, kar mi pozabimo.",
    imgLabel: "naslovni detajl",
    detail: placeholderDetail(2022),
  },
  {
    slug: "hisa-kot-telo",
    title: "Hiša kot telo",
    category: "Literarni esej",
    year: 2021,
    quote: "Hiša diha, kot diha telo.",
    imgLabel: "naslovni detajl",
    detail: placeholderDetail(2021),
  },
  {
    slug: "vizualna-identiteta-biro-ravna",
    title: "Vizualna identiteta — biro Ravna",
    category: "Grafika",
    year: 2023,
    quote: "Linija, ki nosi ime biroja.",
    imgLabel: "vizual identitete",
    detail: placeholderDetail(2023),
  },
  {
    slug: "katalog-razstave-prostor-vmes",
    title: 'Katalog razstave "Prostor vmes"',
    category: "Grafika",
    year: 2022,
    quote: "Med eno in drugo stvarjo.",
    imgLabel: "postavitev kataloga",
    detail: placeholderDetail(2022),
  },
];

export function getProjectsByCategory(category: (typeof CATEGORIES)[number]) {
  return category === "Vse" ? PROJECTS : PROJECTS.filter((p) => p.category === category);
}

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getArchiveGroups() {
  const sorted = [...PROJECTS].sort((a, b) => b.year - a.year);
  let counter = 0;
  const numbered = sorted.map((p) => ({ ...p, num: String(++counter).padStart(2, "0") }));
  const years = [...new Set(numbered.map((p) => p.year))];
  return years.map((year) => ({ year, items: numbered.filter((p) => p.year === year) }));
}

export function getNextProject(slug: string) {
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(idx + 1) % PROJECTS.length];
}
