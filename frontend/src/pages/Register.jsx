import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Spinner from "../components/Spinner.jsx";
import { register } from "../services/api.js";

function validate({ name, email, password }) {
  const errors = {};
  if (!name) errors.name = "Name is required";
  if (!email) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [warning, setWarning] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setWarning("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      const res = await register(form);
      if (res?.warning) setWarning(res.warning);
      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Create account</h2>
      <p className="mt-2 text-sm text-slate-600">
        Register to start analyzing structural images for cracks.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Your name"
          error={errors.name}
          autoComplete="name"
        />
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
          placeholder="At least 6 characters"
          error={errors.password}
          autoComplete="new-password"
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
            {loading ? <Spinner label="Creating account..." /> : "Register"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

