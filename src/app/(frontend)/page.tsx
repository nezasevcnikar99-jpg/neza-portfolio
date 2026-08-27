import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndexGrid from "@/components/IndexGrid";
import { getAllProjects } from "@/lib/projects-data";
import { getHome } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [home, projects] = await Promise.all([getHome(), getAllProjects()]);

  return (
    <div className="sheet">
      <Header active="projects" title={home.heroLead} />
      <IndexGrid projects={projects} />
      <Footer />
    </div>
  );
}
