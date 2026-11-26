import type { Metadata } from "next";
import SiteAnalytics from "@/components/SiteAnalytics";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const DESCRIPTION = "Portfolio Neže Sevčnikar – izbrani arhitekturni projekti, raziskave in besedila.";
const TITLE = "Neža Sevčnikar – Portfolio";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nezasevcnikar.eu";

const BASE: Metadata = {
  // Without a base, Open Graph image paths stay relative and no service can
  // resolve them, so the link preview comes out bare.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s – Neža Sevčnikar",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "sl_SI",
    siteName: "Neža Sevčnikar",
    title: TITLE,
    description: DESCRIPTION,
  },
  // Search Console's HTML-tag check, when the code is set in Vercel's
  // environment; verification through DNS needs nothing here.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * The site's metadata, with one switch from the admin: when the site is hidden
 * from search engines, every page says noindex. robots.txt still lets crawlers
 * in on purpose, because a crawler that is kept out never reads the noindex and
 * keeps the old listing.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const hidden = settings?.searchVisible === false;
  return hidden ? { ...BASE, robots: { index: false, follow: false } } : BASE;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl">
      <body>
        {children}
        {/* Vercel Web Analytics: page views without cookies, so no consent banner
            is needed. Only the site's pages carry it, not the admin. */}
        <SiteAnalytics />
      </body>
    </html>
  );
}
