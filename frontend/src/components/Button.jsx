export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900",
    secondary:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100 focus:ring-slate-400",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
    >
      {children}
    </button>
  );
}

