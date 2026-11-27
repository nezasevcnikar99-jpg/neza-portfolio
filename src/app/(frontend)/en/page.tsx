import type { Metadata } from "next";
import HomeView from "@/views/HomeView";

// One address per language: the www one, whatever a visitor typed.
export const metadata: Metadata = {
  alternates: { canonical: "/en", languages: { sl: "/", en: "/en" } },
  description: "The portfolio of Neža Sevčnikar – selected architecture projects, research and writing.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <HomeView lang="en" />;
}
