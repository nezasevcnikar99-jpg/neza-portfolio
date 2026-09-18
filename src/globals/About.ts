import type { GlobalConfig } from "payload";
import { refreshMediaUsage } from "../lib/media-usage";

export const About: GlobalConfig = {
  slug: "about",
  label: "O meni",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await refreshMediaUsage(req);
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "portrait",
      type: "upload",
      relationTo: "media",
      label: "Portret",
    },
    {
      name: "bio",
      type: "richText",
      label: "Predstavitev",
    },
    {
      name: "education",
      type: "array",
      label: "Izobrazba in delovne izkušnje",
      labels: { singular: "Vrstica", plural: "Vrstice" },
      admin: {
        description:
          "Vrstica, ki se začne z »Delovne izkušnje - «, se na strani pokaže pod naslovom Delovne izkušnje (brez te predpone).",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "dateRange",
          type: "text",
          label: "Obdobje",
          required: true,
        },
      ],
    },
    {
      name: "skills",
      type: "array",
      label: "Veščine in orodja",
      labels: { singular: "Veščina", plural: "Veščine" },
      fields: [
        {
          name: "skill",
          type: "text",
          required: true,
        },
      ],
    },
  ],
};
