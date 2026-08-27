import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndexGrid from "@/components/IndexGrid";
import Landing from "@/components/Landing";
import { getAllProjects } from "@/lib/projects-data";
import { getHome } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [home, projects] = await Promise.all([getHome(), getAllProjects()]);

  return (
    <>
      <Landing media={null} poster={null} lead={home.heroLead} accent={home.heroAccent} />

      <div className="sheet after-landing">
        <Header title="Projekti" />
        <IndexGrid projects={projects} />
        <Footer />
      </div>
    </>
  );
}
