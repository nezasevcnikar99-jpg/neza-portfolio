import type { GlobalConfig } from "payload";

export const About: GlobalConfig = {
  slug: "about",
  label: "O meni",
  access: {
    read: () => true,
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
      label: "Izobrazba",
      labels: { singular: "Vrstica", plural: "Vrstice" },
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
