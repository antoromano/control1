import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Oggi", end: true },
  { to: "/nutrizione", label: "Nutrizione" },
  { to: "/allenamento", label: "Allenamento" },
  { to: "/abitudini", label: "Abitudini" },
  { to: "/media", label: "Media" },
  { to: "/report", label: "Report" },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-4 py-3">
          <span className="mr-4 shrink-0 font-semibold">Diario Intelligente</span>
          <nav className="flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-3 py-1.5 text-sm ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-100"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
