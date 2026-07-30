import type { CollectionConfig } from "payload";

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
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Arhitektura", value: "Arhitektura" },
        { label: "Literarni esej", value: "Literarni esej" },
        { label: "Grafika", value: "Grafika" },
      ],
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
      name: "gallery",
      type: "array",
      labels: { singular: "Slika", plural: "Galerija" },
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
      ],
    },
  ],
};
