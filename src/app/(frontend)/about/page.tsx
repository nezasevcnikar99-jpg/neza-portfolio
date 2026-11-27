import type { Metadata } from "next";
import AboutView from "@/views/AboutView";

export const metadata: Metadata = {
  title: "O meni",
  alternates: { canonical: "/about", languages: { sl: "/about", en: "/en/about" } },
  description: "Neža Sevčnikar – izobrazba, izkušnje in veščine.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <AboutView lang="sl" />;
}
