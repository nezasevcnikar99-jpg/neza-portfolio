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
      // A switch, not a deletion: the site stays reachable by its link either
      // way, and turning it back on is all it takes to be found again.
      name: "searchVisible",
      type: "checkbox",
      label: "Prikaži stran v iskalnikih (Google)",
      defaultValue: true,
      admin: {
        description:
          "Ko je izklopljeno, Google strani ne prikazuje v zadetkih; dostopna je le prek povezave. Za hitrejšo odstranitev uporabi še »Odstranitve« v Google Search Console.",
      },
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
