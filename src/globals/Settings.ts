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
    {
      name: "phone",
      type: "text",
      label: "Telefon",
      admin: { description: "Prikazan na straneh Kontakt in O meni. Pusti prazno, če ga ne želiš objaviti." },
    },
    {
      name: "linkedin",
      type: "text",
      label: "LinkedIn (celoten naslov profila)",
      admin: { description: "Npr. https://www.linkedin.com/in/… – pusti prazno, če ga ni." },
    },
  ],
};
