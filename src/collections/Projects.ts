import type { CollectionConfig } from "payload";
import { CATEGORIES } from "../lib/categories";
import { refreshMediaUsage } from "../lib/media-usage";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "year"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Keeps the "used on the site" mark on every picture current.
    afterChange: [
      async ({ doc, req }) => {
        await refreshMediaUsage(req);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await refreshMediaUsage(req);
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "subtitle",
      type: "text",
      label: "Podnaslov",
      admin: {
        description: "Prikazan pod naslovom na strani projekta.",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value;
            if (data?.title) return slugify(data.title);
            return value;
          },
        ],
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Vrstni red v mreži na Domov (manjše število = prej).",
      },
    },
    {
      name: "gridSize",
      type: "select",
      label: "Dimenzija na prvi strani",
      defaultValue: "auto",
      // The grid has two shapes, a square cell and a wide one two cells across.
      // The stored values are kept from an earlier grid because this column is a
      // Postgres enum; the two shapes that no longer exist are reset to "auto"
      // before each build, in scripts/apply-schema.mjs.
      options: [
        { label: "Samodejno", value: "auto" },
        { label: "Kvadrat", value: "1x1" },
        { label: "Ležeče", value: "2x1" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Oblika naslovne slike v mreži na prvi strani. Projekti se v mrežo razporedijo po kompoziciji, ne po vrstnem redu. Pri »Samodejno« obliko določi naslovna slika: ležeča dobi široko mesto, pokončna ali kvadratna kvadrat.",
      },
    },
    {
      name: "asText",
      type: "checkbox",
      label: "Postavi kot besedilo",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Za eseje in druga pisna dela: besedilo teče čez srednja dva stolpca za branje, slike in galerija stojijo ob strani. Ni vezano na kategorijo.",
      },
    },
    {
      name: "category",
      type: "select",
      label: "Vrsta dela",
      required: true,
      options: CATEGORIES.map((value) => ({ label: value, value })),
      admin: {
        description: "Izpiše se nad naslovom projekta in v arhivu, kjer je tudi filter.",
      },
    },
    {
      name: "year",
      type: "number",
      required: true,
      min: 1900,
      max: 2100,
    },
    {
      name: "quote",
      type: "text",
      admin: {
        description: "Kratek citat, prikazan ob prehodu miške čez projekt na Domov.",
      },
    },
    {
      name: "indexFocal",
      type: "group",
      label: "Izrez naslovne slike na prvi strani",
      admin: {
        // Replaced by a crosshair on the picture itself — the two numbers below
        // are still what gets stored, this only fills them in by clicking.
        components: {
          Field: "/components/admin/IndexFocalField#IndexFocalField",
        },
      },
      fields: [
        { name: "x", type: "number", min: 0, max: 100, label: "Vodoravno (%)" },
        { name: "y", type: "number", min: 0, max: 100, label: "Navpično (%)" },
      ],
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "imgLabel",
      type: "text",
      label: "Oznaka manjkajoče slike",
      admin: {
        description: 'Prikazano dokler glavna fotografija ni naložena (npr. "fotografija objekta", "vizualizacija").',
      },
    },
    {
      name: "intro",
      type: "textarea",
      admin: {
        description: "Uvodni odstavek na strani projekta.",
      },
    },
    {
      name: "stranka",
      type: "text",
      label: "Stranka",
    },
    {
      name: "vloga",
      type: "text",
      label: "Vloga",
    },
    {
      name: "concept",
      type: "richText",
      label: "Koncept",
    },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      label: "Dokument za prenos (PDF)",
      filterOptions: { mimeType: { equals: "application/pdf" } },
      admin: {
        description:
          "Celotna knjižica, plakat ali poročilo. Na strani projekta se pokaže povezava za prenos. PDF naloži tu, v adminu — uvoz iz datotek večjih PDF-jev ne prenese.",
      },
    },
    {
      name: "documentLabel",
      type: "text",
      label: "Ime dokumenta",
      admin: {
        description: "Kako se povezava imenuje, npr. »Celotna knjižica«. Če ostane prazno, piše »Celoten dokument«.",
        condition: (data) => Boolean(data?.document),
      },
    },
    {
      name: "gallery",
      type: "array",
      labels: { singular: "Slika", plural: "Galerija" },
      admin: {
        description:
          "Naslovna slika je na strani projekta vedno prva. Tu odkljukaj še tiste, ki naj se vidijo poleg nje — mest so štiri, torej naslovna in največ tri od tu, po vrstnem redu od zgoraj. Vse ostalo se pokaže šele, ko obiskovalec odpre galerijo.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "caption",
          type: "text",
        },
        {
          name: "onPage",
          type: "checkbox",
          label: "Pokaži na strani projekta",
          defaultValue: true,
          admin: {
            description:
              "Odkljukane slike se vidijo na strani projekta, dokler so mesta prosta (poleg naslovne so tri). Neodkljukane so samo v galeriji.",
          },
        },
      ],
    },
  ],
};
