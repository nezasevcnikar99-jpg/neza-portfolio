import type { Metadata } from "next";
import { Spectral, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ime Priimek — Arhitektura, eseji, grafika",
  description:
    "Zbirka arhitekturnih projektov, esejev o prostoru in vizualnih del — od zasnove do izvedbe, od misli do stavka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl" className={`${spectral.variable} ${ibmPlexSans.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
