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
      label: "Naslov (navadni del)",
      required: true,
    },
    {
      name: "heroAccent",
      type: "text",
      label: "Naslov (poudarjeni, ležeči del)",
      required: true,
    },
    {
      name: "heroDescription",
      type: "textarea",
      label: "Opis pod naslovom",
      required: true,
    },
  ],
};
