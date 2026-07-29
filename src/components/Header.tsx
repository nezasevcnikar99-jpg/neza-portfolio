import Link from "next/link";

type NavKey = "delo" | "about" | "arhiv";

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: "delo", label: "Delo", href: "/" },
  { key: "about", label: "O meni", href: "/about" },
  { key: "arhiv", label: "Arhiv", href: "/archive" },
];

export default function Header({ active }: { active: NavKey }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "26px 48px",
        background: "#ffffffee",
        backdropFilter: "blur(6px)",
        borderBottom: "1px solid oklch(20% 0.01 260 / 0.08)",
      }}
    >
      <Link
        href="/"
        className="font-serif"
        style={{ fontSize: 20, letterSpacing: "0.02em", textDecoration: "none", color: "oklch(20% 0.01 260)" }}
      >
        Ime Priimek
      </Link>
      <nav style={{ display: "flex", gap: 36, fontSize: 13 }}>
        {NAV.map((item) =>
          item.key === active ? (
            <span key={item.key} style={{ borderBottom: "1px solid currentColor", paddingBottom: 2 }}>
              {item.label}
            </span>
          ) : (
            <Link key={item.key} href={item.href} className="nav-link">
              {item.label}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
