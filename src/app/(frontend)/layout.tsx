import type { Metadata } from "next";
import "./globals.css";

const DESCRIPTION = "Portfolio Neže Sevčnikar – izbrani arhitekturni projekti, raziskave in besedila.";
const TITLE = "Neža Sevčnikar – Portfolio";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neza-portfolio.vercel.app";

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
      <body>{children}</body>
    </html>
  );
}
