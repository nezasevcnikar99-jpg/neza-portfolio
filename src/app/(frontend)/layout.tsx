import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const DESCRIPTION = "Portfolio Neže Sevčnikar – izbrani arhitekturni projekti, raziskave in besedila.";
const TITLE = "Neža Sevčnikar – Portfolio";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nezasevcnikar.eu";

export const metadata: Metadata = {
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
        <Analytics />
      </body>
    </html>
  );
}
