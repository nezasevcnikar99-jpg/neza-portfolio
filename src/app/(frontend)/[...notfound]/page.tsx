import { notFound } from "next/navigation";

/**
 * The site has two root layouts, one per route group, so Next has no single
 * root not-found to fall back on and served its own default for unmatched
 * addresses. This catches them and hands them to the frontend's not-found,
 * which renders inside the site's own layout. Concrete routes — the admin and
 * the API among them — still win over a catch-all.
 */
export default function NotFoundCatchAll() {
  notFound();
}
