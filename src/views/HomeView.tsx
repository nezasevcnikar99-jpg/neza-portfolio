import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndexGrid from "@/components/IndexGrid";
import Landing from "@/components/Landing";
import LandingPass from "@/components/LandingPass";
import { getAllProjects } from "@/lib/projects-data";
import { getHome, getSettings } from "@/lib/settings";
import type { Media } from "@/payload-types";
import { counterpart, href, T, type Lang } from "@/lib/i18n";

/** The front page, in either language: the landing, then the grid of work. */
export default async function HomeView({ lang }: { lang: Lang }) {
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
        label={(lang === "en" ? home.heroDescriptionEn?.trim() || "Portfolio" : home.heroDescription) ?? ""}
        name={settings.name}
        light={home.landingLight === true}
      />

      <div className="sheet after-landing" lang={lang}>
        <Header title={T[lang].projects} lang={lang} other={counterpart(lang, href(lang, "/"))} />
        <IndexGrid projects={projects} lang={lang} />
        <Footer />
      </div>
    </>
  );
}
