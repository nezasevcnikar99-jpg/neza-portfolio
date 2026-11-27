import type { Metadata } from "next";
import ProjectView, { projectMetadata } from "@/views/ProjectView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return projectMetadata((await params).slug, "en");
}

export default async function Page({ params }: Props) {
  return <ProjectView slug={(await params).slug} lang="en" />;
}
