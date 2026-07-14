import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-md border border-white/[0.08] bg-[#101317] ${className}`}
    >
      <div className="flex items-baseline justify-between border-b border-white/[0.08] px-3 py-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#9aa4af]">
          {title}
        </h2>
        {subtitle && <span className="fc-mono text-[10px] text-[#5c6570]">{subtitle}</span>}
      </div>
      <div className={`flex-1 overflow-auto fc-scrollbar ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export function Badge({
  children,
  color = "#3987e5",
  variant = "solid",
}: {
  children: ReactNode;
  color?: string;
  variant?: "solid" | "outline";
}) {
  if (variant === "outline") {
    return (
      <span
        className="fc-mono inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium"
        style={{ borderColor: `${color}66`, color }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="fc-mono inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-black/80"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="rounded border border-white/[0.08] bg-[#151920] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[#5c6570]">{label}</div>
      <div className="fc-mono mt-1 text-2xl font-bold" style={{ color: accent ?? "#f4f5f6" }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-[#5c6570]">{sub}</div>}
    </div>
  );
}

export function Dot({ status }: { status: "idle" | "start" | "done" }) {
  const color = status === "done" ? "#1baf7a" : status === "start" ? "#fab219" : "#383835";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${status === "start" ? "fc-pulse" : ""}`}
      style={{ backgroundColor: color }}
    />
  );
}
