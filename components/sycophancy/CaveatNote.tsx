import type { ReactNode } from "react";

export function CaveatNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded border border-white/[0.06] bg-[#0d0f12] px-3 py-2 text-[11px] italic leading-snug text-[#9aa4af]">
      {children}
    </p>
  );
}
