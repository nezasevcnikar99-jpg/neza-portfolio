import type { Metadata } from "next";
import ContactView from "@/views/ContactView";

export const metadata: Metadata = {
  title: "Kontakt",
  alternates: { canonical: "/kontakt", languages: { sl: "/kontakt", en: "/en/contact" } },
  description: "Kontakt za povpraševanja o projektih, sodelovanjih in besedilih.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <ContactView lang="sl" />;
}
