import Link from "next/link";
import { getSettings } from "@/lib/settings";

export type NavKey = "arhiv" | "about" | "kontakt";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "arhiv", label: "Arhiv", href: "/archive" },
  { key: "about", label: "O meni", href: "/about" },
  { key: "kontakt", label: "Kontakt", href: "/kontakt" },
];

/**
 * The masthead is the grid's first band: four ruled cells, the name and the
 * three subpages one to a cell. The page's own title hangs from the bottom of
 * the second, where the reference sets it — so the same slot always says where
 * you are.
 */
export default async function Header({ active, title }: { active?: NavKey; title: string }) {
  const settings = await getSettings();

  return (
    <header className="ruled head">
      <div className="cell head-cell">
        <Link href="/" className="head-name">
          {settings.name}
        </Link>
      </div>

      {NAV.map((item, i) => (
        <div key={item.key} className={`cell head-cell${i === NAV.length - 1 ? " head-end" : ""}`}>
          <Link href={item.href} className={`head-link${active === item.key ? " is-active" : ""}`}>
            {item.label}
          </Link>
          {i === 0 && <h1 className="head-title">{title}</h1>}
        </div>
      ))}
    </header>
  );
}
