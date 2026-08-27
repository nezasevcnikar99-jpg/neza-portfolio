import Link from "next/link";
import { getSettings } from "@/lib/settings";

type NavKey = "projects" | "about" | "contact";

/**
 * The masthead is the grid's first band: four ruled cells, one item each, the
 * way the reference sets it. The page title, when there is one, hangs from the
 * bottom of the second cell.
 */
export default async function Header({ active, title }: { active?: NavKey; title?: string }) {
  const settings = await getSettings();

  return (
    <header className="ruled head">
      <div className="cell head-cell">
        <Link href="/" className="head-name">
          {settings.name}
        </Link>
      </div>
      <div className="cell head-cell">
        <Link href="/" className={`head-link${active === "projects" ? " is-active" : ""}`}>
          Projects
        </Link>
        {title && <h1 className="head-title">{title}</h1>}
      </div>
      <div className="cell head-cell">
        <Link href="/about" className={`head-link${active === "about" ? " is-active" : ""}`}>
          About
        </Link>
      </div>
      <div className="cell head-cell head-end">
        <a href={`mailto:${settings.email}`} className="head-link">
          Contact
        </a>
      </div>
    </header>
  );
}
