import type { Metadata } from "next";
import AboutView from "@/views/AboutView";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/en/about", languages: { sl: "/about", en: "/en/about" } },
  description: "Neža Sevčnikar – education, experience and skills.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <AboutView lang="en" />;
}
