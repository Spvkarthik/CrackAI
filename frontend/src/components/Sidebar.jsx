import { NavLink } from "react-router-dom";

const links = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/upload", label: "Upload" },
  { to: "/app/history", label: "History" },
  { to: "/app/profile", label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-72 border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            CrackAI
          </div>
          <button
            className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <nav className="mt-6 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
              onClick={onClose}
              end
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Tips</p>
          <p className="mt-1 text-xs text-slate-600">
            Best results come from sharp, well-lit photos of the surface.
          </p>
        </div>
      </aside>
    </>
  );
}

