import Button from "./Button.jsx";
import { clearAuth } from "../services/authStorage.js";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user, onOpenSidebar }) {
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 lg:hidden"
            onClick={onOpenSidebar}
          >
            Menu
          </button>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Structural Crack Detection
            </div>
            <div className="text-xs text-slate-500">Upload • Analyze • Track</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold text-slate-900">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-slate-500">{user?.email || ""}</div>
          </div>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

