import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndexGrid from "@/components/IndexGrid";
import Landing from "@/components/Landing";
import LandingPass from "@/components/LandingPass";
import { getAllProjects } from "@/lib/projects-data";
import { getHome, getSettings } from "@/lib/settings";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [home, projects, settings] = await Promise.all([getHome(), getAllProjects(), getSettings()]);

  const media = typeof home.landingMedia === "object" ? (home.landingMedia as Media | null) : null;
  const poster = typeof home.landingPoster === "object" ? (home.landingPoster as Media | null) : null;

  return (
    <>
      {/* Runs while the page is still being read, before anything is painted, so a
          visitor who already passed the landing never sees it flash. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(sessionStorage.getItem('landing-passed'))document.documentElement.classList.add('landing-passed')}catch(e){}",
        }}
      />
      <LandingPass />
      <Landing
        media={media}
        poster={poster}
        quote={home.heroLead}
        source={home.heroAccent ?? ""}
        label={home.heroDescription ?? ""}
        name={settings.name}
        light={home.landingLight === true}
      />

      <div className="sheet after-landing">
        <Header title="Projekti" />
        <IndexGrid projects={projects} />
        <Footer />
      </div>
    </>
  );
}
