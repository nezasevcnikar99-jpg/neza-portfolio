import type { Metadata } from "next";
import HomeView from "@/views/HomeView";

// One address per language: the www one, whatever a visitor typed.
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { sl: "/", en: "/en" } },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <HomeView lang="sl" />;
}
