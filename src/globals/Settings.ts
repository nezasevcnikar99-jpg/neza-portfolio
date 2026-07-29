import type { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Nastavitve strani",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Ime, prikazano v glavi in nogi strani",
      required: true,
    },
    {
      name: "email",
      type: "text",
      label: "Kontaktni e-poštni naslov",
      required: true,
    },
  ],
};
