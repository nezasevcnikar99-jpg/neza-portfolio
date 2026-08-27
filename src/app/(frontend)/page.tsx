import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndexGrid from "@/components/IndexGrid";
import Landing from "@/components/Landing";
import { getAllProjects } from "@/lib/projects-data";
import { getHome } from "@/lib/settings";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [home, projects] = await Promise.all([getHome(), getAllProjects()]);

  const media = typeof home.landingMedia === "object" ? (home.landingMedia as Media | null) : null;
  const poster = typeof home.landingPoster === "object" ? (home.landingPoster as Media | null) : null;

  return (
    <>
      <Landing media={media} poster={poster} lead={home.heroLead} accent={home.heroAccent} />

      <div className="sheet after-landing">
        <Header title="Projekti" />
        <IndexGrid projects={projects} />
        <Footer />
      </div>
    </>
  );
}
