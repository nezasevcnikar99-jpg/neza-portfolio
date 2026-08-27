import type { GlobalConfig } from "payload";

export const Home: GlobalConfig = {
  slug: "home",
  label: "Domov",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "heroLead",
      type: "text",
      label: "Uvodni stavek (prvi del)",
      required: true,
    },
    {
      name: "heroAccent",
      type: "text",
      label: "Uvodni stavek (drugi del)",
      required: true,
    },
    {
      name: "heroDescription",
      type: "textarea",
      label: "Opis pod stavkom",
      required: true,
    },
  ],
};
