import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndexGrid from "@/components/IndexGrid";
import { getAllProjects } from "@/lib/projects-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getAllProjects();

  return (
    <div className="sheet">
      <Header title="Projekti" />
      <IndexGrid projects={projects} />
      <Footer />
    </div>
  );
}
