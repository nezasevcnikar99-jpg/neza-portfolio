import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeIntro from "@/components/HomeIntro";
import ProjectScatter from "@/components/ProjectScatter";
import { getAllProjects } from "@/lib/projects-data";
import { getHome } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [home, projects] = await Promise.all([getHome(), getAllProjects()]);

  return (
    <>
      <Header active="delo" />

      <HomeIntro lead={home.heroLead} accent={home.heroAccent} description={home.heroDescription}>
        <ProjectScatter projects={projects} />
      </HomeIntro>

      <Footer />
    </>
  );
}
