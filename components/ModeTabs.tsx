export type Mode = "flipcheck" | "sycophancy";

const TABS: { key: Mode; label: string }[] = [
  { key: "flipcheck", label: "Paraphrase Consistency" },
  { key: "sycophancy", label: "Sycophancy Check" },
];

export function ModeTabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded border border-white/[0.1] bg-[#0d0f12] p-0.5">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setMode(t.key)}
          className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            mode === t.key ? "bg-[#3987e5] text-white" : "text-[#9aa4af] hover:bg-white/[0.06]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
