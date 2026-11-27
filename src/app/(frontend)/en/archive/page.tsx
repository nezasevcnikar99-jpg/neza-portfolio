import type { Metadata } from "next";
import ArchiveView from "@/views/ArchiveView";

export const metadata: Metadata = {
  title: "Archive",
  alternates: { canonical: "/en/archive", languages: { sl: "/archive", en: "/en/archive" } },
  description: "All the work of Neža Sevčnikar by year and kind.",
};

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ vrsta?: string }> }) {
  return <ArchiveView vrsta={(await searchParams).vrsta} lang="en" />;
}
