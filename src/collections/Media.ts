import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    defaultColumns: ["filename", "inUse", "usedIn", "alt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      // Set by the site, never by hand: every save of a project, the home page or
      // the about page recomputes it (src/lib/media-usage.ts). Stored rather than
      // computed on read so the list can be filtered to the unused ones.
      name: "inUse",
      type: "checkbox",
      label: "Uporabljena na strani",
      defaultValue: false,
      admin: {
        readOnly: true,
        position: "sidebar",
        description:
          "Neobkljukane slike ne uporablja noben projekt, naslovnica ali stran O meni. V seznamu medijev jih najdeš s filtrom »Uporabljena na strani« je enako »false«.",
      },
    },
    {
      name: "usedIn",
      type: "text",
      label: "Kje",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "showWhole",
      type: "checkbox",
      label: "Pokaži celo sliko",
      defaultValue: false,
      admin: {
        description:
          "Za tlorise, prereze in sheme. Slika se v vsakem okvirju pokaže vsa, na svetli podlagi, namesto da bi okvir zapolnila in se obrezala.",
      },
    },
    {
      // Shows the picture with every frame the site cuts it to, and writes the
      // point that decides the cut.
      name: "cropPreview",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/MediaFocalField#MediaFocalField",
        },
      },
    },
  ],
  upload: {
    // Shows the crosshair in the admin so the part of a picture that matters can
    // be chosen. Payload hides it unless asked, because no image sizes are
    // defined here. The focalX/focalY it writes are what every <img> on the site
    // already reads for object-position, so one setting governs the crop
    // wherever that picture appears.
    focalPoint: true,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4", "video/webm"],
    // Payload's server-side type sniffing can't inspect real file bytes when a file is
    // uploaded directly to Vercel Blob (clientUploads), so it falls back to a hardcoded
    // extension map that doesn't know jpg/png/pdf and misidentifies them as text/plain,
    // rejecting every upload (https://github.com/payloadcms/payload/issues/16485).
    // The mimeTypes list above still drives the picker's file filter; this only disables
    // the broken server-side re-check, which is an acceptable tradeoff for a single-admin site.
    allowRestrictedFileTypes: true,
  },
};
