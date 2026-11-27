import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { href, T, type Lang } from "@/lib/i18n";

export type NavKey = "arhiv" | "about" | "kontakt";

const NAV: { key: NavKey; path: string }[] = [
  { key: "arhiv", path: "/archive" },
  { key: "about", path: "/about" },
  { key: "kontakt", path: "/kontakt" },
];

/**
 * The masthead is the grid's first band: four ruled cells, the name and the
 * three subpages one to a cell. The page's own title hangs from the bottom of
 * the second, where the reference sets it — so the same slot always says where
 * you are. The language switch sits beside the last link.
 */
export default async function Header({
  active,
  title,
  lang = "sl",
  other,
}: {
  active?: NavKey;
  title: string;
  lang?: Lang;
  /** This page in the other language, for the switch. */
  other?: string;
}) {
  const settings = await getSettings();
  const t = T[lang];
  const label = { arhiv: t.archive, about: t.about, kontakt: t.contact };

  return (
    <header className="ruled head">
      <div className="cell head-cell">
        <Link href={href(lang, "/")} className="head-name">
          {settings.name}
        </Link>
      </div>

      {NAV.map((item, i) => (
        <div key={item.key} className={`cell head-cell${i === NAV.length - 1 ? " head-end" : ""}`}>
          <span className="head-links">
            <Link href={href(lang, item.path)} className={`head-link${active === item.key ? " is-active" : ""}`}>
              {label[item.key]}
            </Link>
            {i === NAV.length - 1 && other && (
              <Link href={other} className="head-link head-lang" hrefLang={lang === "sl" ? "en" : "sl"} aria-label={t.switchLabel}>
                {t.switchTo}
              </Link>
            )}
          </span>
          {i === 0 && <h1 className="head-title">{title}</h1>}
        </div>
      ))}
    </header>
  );
}
