export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  name,
  autoComplete,
  className = "",
}) {
  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/20 ${
          error ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

