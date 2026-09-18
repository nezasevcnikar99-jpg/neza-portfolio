/**
 * What kind of work a project is. Shown above a project's title and in the
 * archive, where it is also a filter. The order here is the order of the
 * filter. Kept outside the collection so the site and the admin share it.
 */
export const CATEGORIES = ["Idejna zasnova", "Seminarski projekt", "Raziskava", "Natečaj", "Esej", "Grafično oblikovanje"] as const;

export type Category = (typeof CATEGORIES)[number];
