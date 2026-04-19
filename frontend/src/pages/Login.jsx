import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Spinner from "../components/Spinner.jsx";
import { login } from "../services/api.js";
import { isLoggedIn } from "../services/authStorage.js";

function validate({ email, password }) {
  const errors = {};
  if (!email) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/app/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (isLoggedIn()) navigate(from, { replace: true });
  }, [from, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setWarning("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      const res = await login(form);
      if (res?.warning) setWarning(res.warning);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-600">
        Sign in to upload images, view results, and track your history.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
        />

        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}
        {warning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {warning}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner label="Signing in..." /> : "Login"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-slate-900 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

