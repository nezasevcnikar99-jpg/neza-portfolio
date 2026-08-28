import type { GlobalConfig } from "payload";

export const Home: GlobalConfig = {
  slug: "home",
  label: "Domov",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "landingMedia",
      type: "upload",
      relationTo: "media",
      label: "Uvodna slika ali video",
      admin: {
        description:
          "Zapolni prvi zaslon. Video naj bo kratek in brez zvoka — brskalniki drugače ne predvajajo samodejno.",
      },
    },
    {
      name: "landingPoster",
      type: "upload",
      relationTo: "media",
      label: "Nadomestna slika za video",
      admin: {
        description: "Prikaže se na telefonih in dokler se video ne naloži. Pri sliki zgoraj je ne rabiš.",
      },
    },
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
