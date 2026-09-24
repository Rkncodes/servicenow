import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}

export function PageTitle({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

// Source tags — keep "who said this" unambiguous.
export function SourceTag({ kind }: { kind: "ai" | "advisor" | "student" }) {
  const map = {
    ai: { label: "AI suggestion", cls: "border-slate-300 bg-slate-50 text-slate-600", icon: "✦" },
    advisor: { label: "Advisor suggestion", cls: "border-sky-200 bg-sky-50 text-sky-800", icon: "●" },
    student: { label: "Student choice", cls: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "✓" },
  }[kind];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${map.cls}`}>
      <span aria-hidden>{map.icon}</span>
      {map.label}
    </span>
  );
}

export function ServiceNowNote({ children }: { children: ReactNode }) {
  return (
    <details className="mt-8 text-xs text-slate-500">
      <summary className="cursor-pointer select-none font-medium text-slate-500 hover:text-navy-800">
        In ServiceNow ›
      </summary>
      <div className="mt-2 max-w-3xl leading-relaxed">{children}</div>
    </details>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-slate-300",
    secondary: "border border-slate-300 bg-white text-navy-800 hover:bg-slate-50 disabled:text-slate-400",
    ghost: "text-slate-500 hover:text-navy-900",
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
