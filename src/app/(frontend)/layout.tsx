import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neža Sevčnikar — Arhitektura, eseji, grafika",
  description:
    "Zbirka arhitekturnih projektov, esejev o prostoru in vizualnih del — od zasnove do izvedbe, od misli do stavka.",
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
