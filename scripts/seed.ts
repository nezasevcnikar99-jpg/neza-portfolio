import { getPayload } from "payload";
import config from "@payload-config";

type RichTextParagraph = {
  type: "paragraph";
  children: { type: "text"; text: string; version: 1 }[];
  direction: "ltr";
  format: "";
  indent: 0;
  version: 1;
};

const richText = (paragraphs: readonly string[]) => ({
  root: {
    type: "root",
    children: paragraphs.map(
      (text): RichTextParagraph => ({
        type: "paragraph",
        children: [{ type: "text", text, version: 1 }],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      }),
    ),
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  },
});

const PROJECTS = [
  {
    slug: "stanovanjska-hisa-na-robu-gozda",
    title: "Stanovanjska hiša na robu gozda",
    category: "Arhitektura",
    year: 2024,
    quote: "Hiša se ne postavi proti gozdu, temveč vanj.",
    imgLabel: "fotografija objekta",
    intro:
      "Enodružinska hiša na robu gozda, zasnovana kot zaporedje zavetij, ki se odpirajo proti krošnjam. Lesena konstrukcija in temna lesena obloga hišo potopita v okolico, medtem ko notranjost ostaja svetla in odprta.",
    stranka: "Zasebna naročnica",
    vloga: "Projektiranje, vodenje izvedbe",
    concept: [
      "Parcela je bila zaraščena in strma, z redkimi jasami med drevesi. Namesto ene same stavbe smo zasnovali tri manjše volumne, povezane s pokritim hodnikom — vsak s svojim razgledom in svojo svetlobo.",
      "Fasada iz zoglenelega lesa (shou sugi ban) skozi leta temni in sivi skupaj z lubjem okoliških borov, medtem ko notranje površine ostajajo iz svetlega hrasta — kontrast med zunanjim umikom in notranjo toplino.",
    ],
  },
  {
    slug: "preureditev-opuscene-mlekarne",
    title: "Preureditev opuščene mlekarne",
    category: "Arhitektura",
    year: 2023,
    quote: "Stari zidovi so znali čakati.",
    imgLabel: "fotografija objekta",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "paviljon-ob-jezeru",
    title: "Paviljon ob jezeru",
    category: "Arhitektura",
    year: 2023,
    quote: "Streha kot obzorje, ki se ne konča.",
    imgLabel: "vizualizacija",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "mestna-knjiznica-natecaj",
    title: "Mestna knjižnica — natečaj",
    category: "Arhitektura",
    year: 2022,
    quote: "Prostor, kjer tišina bere z nami.",
    imgLabel: "konceptna skica",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "vrtec-soncek-prizidek",
    title: "Vrtec Sonček, prizidek",
    category: "Arhitektura",
    year: 2022,
    quote: "Merilo otroka, ne merilo stavbe.",
    imgLabel: "fotografija objekta",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "obnova-kmecke-domacije",
    title: "Obnova kmečke domačije",
    category: "Arhitektura",
    year: 2021,
    quote: "Vsaka razpoka nosi svoj datum.",
    imgLabel: "fotografija objekta",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "poslovna-stavba-ob-savi",
    title: "Poslovna stavba ob Savi",
    category: "Arhitektura",
    year: 2021,
    quote: "Fasada, ki diha z reko.",
    imgLabel: "vizualizacija",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "paviljon-za-razstavo-lesa",
    title: "Paviljon za razstavo lesa",
    category: "Arhitektura",
    year: 2020,
    quote: "Les govori, če mu pustimo.",
    imgLabel: "fotografija objekta",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "terasasta-stanovanjska-soseska",
    title: "Terasasta stanovanjska soseska",
    category: "Arhitektura",
    year: 2020,
    quote: "Sosedstvo, sestavljeno iz teras.",
    imgLabel: "maketa",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "o-prostoru-ki-nas-oblikuje",
    title: "O prostoru, ki nas oblikuje",
    category: "Literarni esej",
    year: 2024,
    quote: "Prostor nas oblikuje, še preden spregovorimo.",
    imgLabel: "naslovni detajl",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "tisina-med-zidovi",
    title: "Tišina med zidovi",
    category: "Literarni esej",
    year: 2023,
    quote: "Tišina ni odsotnost, je gradivo.",
    imgLabel: "naslovni detajl",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "beton-in-spomin",
    title: "Beton in spomin",
    category: "Literarni esej",
    year: 2022,
    quote: "Beton pomni tisto, kar mi pozabimo.",
    imgLabel: "naslovni detajl",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "hisa-kot-telo",
    title: "Hiša kot telo",
    category: "Literarni esej",
    year: 2021,
    quote: "Hiša diha, kot diha telo.",
    imgLabel: "naslovni detajl",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "vizualna-identiteta-biro-ravna",
    title: "Vizualna identiteta — biro Ravna",
    category: "Grafika",
    year: 2023,
    quote: "Linija, ki nosi ime biroja.",
    imgLabel: "vizual identitete",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
  {
    slug: "katalog-razstave-prostor-vmes",
    title: 'Katalog razstave "Prostor vmes"',
    category: "Grafika",
    year: 2022,
    quote: "Med eno in drugo stvarjo.",
    imgLabel: "postavitev kataloga",
    intro: "Podroben opis projekta bo dodan kmalu.",
    stranka: "—",
    vloga: "—",
    concept: ["Poglobljen opis koncepta za ta projekt bo dodan kmalu."],
  },
] as const;

const EDUCATION = [
  { label: "Magistrski študij arhitekture, Fakulteta za arhitekturo, Ljubljana", dateRange: "2019–2022" },
  { label: "Dodiplomski študij arhitekture, Fakulteta za arhitekturo, Ljubljana", dateRange: "2016–2019" },
  { label: "Delovne izkušnje — arhitekturni biro Ravna, projektantka", dateRange: "2022–danes" },
];

const SKILLS = [
  "AutoCAD",
  "Rhino + Grasshopper",
  "SketchUp",
  "Adobe InDesign",
  "Adobe Photoshop",
  "Fizični modeli / makete",
  "Tehnično risanje",
  "Pisanje in urejanje besedil",
];

async function seed() {
  const payload = await getPayload({ config });

  console.log("Seeding projects...");
  for (const [index, project] of PROJECTS.entries()) {
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: project.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      console.log(`  skip (exists): ${project.title}`);
      continue;
    }
    await payload.create({
      collection: "projects",
      data: {
        title: project.title,
        slug: project.slug,
        category: project.category,
        year: project.year,
        quote: project.quote,
        imgLabel: project.imgLabel,
        intro: project.intro,
        stranka: project.stranka,
        vloga: project.vloga,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        concept: richText(project.concept) as any,
        order: index,
      },
    });
    console.log(`  created: ${project.title}`);
  }

  console.log("Seeding Home global...");
  await payload.updateGlobal({
    slug: "home",
    data: {
      heroLead: "Arhitektura, prostor in besede —",
      heroAccent: "projekti, ki iščejo tišino v strukturi.",
      heroDescription:
        "Zbirka arhitekturnih projektov, esejev o prostoru in vizualnih del — od zasnove do izvedbe, od misli do stavka.",
    },
  });

  console.log("Seeding About global...");
  await payload.updateGlobal({
    slug: "about",
    data: {
      bio: richText([
        "Sem arhitektka in avtorica, ki prostor razume kot besedilo — nekaj, kar se bere, preden se zgradi. Ukvarjam se z arhitekturnim projektiranjem, pišem eseje o prostoru in spominu, občasno pa oblikujem tudi vizualne identitete za manjše biroje in razstave.",
        "Zanima me predvsem, kako stavbe nosijo čas — kako material stara, kako tišina postane del načrta. To radovednost prenašam med disciplinami: iz skice v stavek in nazaj.",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any,
      education: EDUCATION,
      skills: SKILLS.map((skill) => ({ skill })),
    },
  });

  console.log("Seeding Settings global...");
  await payload.updateGlobal({
    slug: "settings",
    data: {
      name: "Ime Priimek",
      email: "ime.priimek@email.com",
    },
  });

  console.log("Done.");
}

try {
  await seed();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
