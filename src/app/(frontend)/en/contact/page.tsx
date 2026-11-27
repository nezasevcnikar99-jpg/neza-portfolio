import type { Metadata } from "next";
import ContactView from "@/views/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/en/contact", languages: { sl: "/kontakt", en: "/en/contact" } },
  description: "Contact for enquiries about projects, collaborations and writing.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <ContactView lang="en" />;
}
