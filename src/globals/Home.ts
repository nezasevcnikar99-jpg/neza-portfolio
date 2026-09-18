import type { GlobalConfig } from "payload";
import { refreshMediaUsage } from "../lib/media-usage";

export const Home: GlobalConfig = {
  slug: "home",
  label: "Domov",
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
      name: "landingMedia",
      type: "upload",
      relationTo: "media",
      label: "Uvodna slika ali video",
      admin: {
        description:
          "Zapolni prvi zaslon. Video naj bo kratek in brez zvoka – brskalniki drugače ne predvajajo samodejno.",
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
      name: "landingLight",
      type: "checkbox",
      label: "Svetla slika – temno besedilo",
      defaultValue: false,
      admin: {
        description:
          "Za skico na belem papirju. Besedilo postane temno in stoji spodaj levo, pod sliko, zato se je nikoli ne dotakne. Slika se ne obreže, poravnana je spodaj desno. Na pokončnih zaslonih leva tretjina lista izteče čez rob, zato naj bo risba na desni.",
      },
    },
    {
      name: "heroLead",
      type: "text",
      label: "Citat na naslovnici",
      required: true,
    },
    {
      name: "heroAccent",
      type: "text",
      label: "Vir citata",
      required: true,
    },
    {
      name: "heroDescription",
      type: "textarea",
      label: "Oznaka na naslovnici (npr. Portfolio)",
      required: true,
    },
  ],
};
