import type { Metadata } from "next";
import ArchiveView from "@/views/ArchiveView";

export const metadata: Metadata = {
  title: "Arhiv",
  alternates: { canonical: "/archive", languages: { sl: "/archive", en: "/en/archive" } },
  description: "Vsa dela Neže Sevčnikar po letih in vrstah dela.",
};

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ vrsta?: string }> }) {
  return <ArchiveView vrsta={(await searchParams).vrsta} lang="sl" />;
}
