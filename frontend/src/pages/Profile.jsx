import { useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { clearAuth } from "../services/authStorage.js";
import { getMe } from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const me = useMemo(() => getMe(), []);

  const initial = {
    name: me?.name || "",
    email: me?.email || "",
    organization: me?.organization || "",
  };
  const [form, setForm] = useState(initial);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6">
      <Card title="Profile" subtitle="Edit details (UI only)">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
          />
          <Input
            label="Organization"
            value={form.organization}
            onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
            placeholder="Company / Lab"
            className="md:col-span-2"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Saving is not implemented (front-end UI only).
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setForm(initial)}>
              Reset
            </Button>
            <Button onClick={() => {}}>
              Save
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Session">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            You are currently signed in as <span className="font-semibold">{me?.email || "—"}</span>.
          </div>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}

