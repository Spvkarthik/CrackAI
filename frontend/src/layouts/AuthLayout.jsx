import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
          <div className="hidden bg-slate-900 p-10 text-white lg:block">
            <div className="text-sm font-semibold">CrackAI</div>
            <h1 className="mt-6 text-3xl font-semibold leading-tight">
              Structural Crack Detection & Analysis
            </h1>
            <p className="mt-3 text-sm text-slate-200">
              Upload structural images, detect crack patterns, and track results over time.
            </p>

            <div className="mt-10 rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold">What you can do</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                <li>• Upload and analyze images</li>
                <li>• View severity, confidence, and overlays</li>
                <li>• Track upload history</li>
              </ul>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-sm font-semibold text-slate-900">
                CrackAI
              </Link>
              <a
                href="#"
                className="text-xs text-slate-500"
                onClick={(e) => e.preventDefault()}
              >
                v1.0
              </a>
            </div>
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

