import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
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
