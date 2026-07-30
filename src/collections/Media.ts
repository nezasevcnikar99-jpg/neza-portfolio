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
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    // Payload's server-side type sniffing can't inspect real file bytes when a file is
    // uploaded directly to Vercel Blob (clientUploads), so it falls back to a hardcoded
    // extension map that doesn't know jpg/png/pdf and misidentifies them as text/plain,
    // rejecting every upload (https://github.com/payloadcms/payload/issues/16485).
    // The mimeTypes list above still drives the picker's file filter; this only disables
    // the broken server-side re-check, which is an acceptable tradeoff for a single-admin site.
    allowRestrictedFileTypes: true,
  },
};
