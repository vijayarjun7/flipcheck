import type { Category } from "@/lib/types";
import { heatColor } from "@/lib/palette";
import { Panel } from "./ui";

const ROWS: { key: Category; label: string }[] = [
  { key: "subjective", label: "Subjective" },
  { key: "factual", label: "Factual" },
  { key: "multi-hop", label: "Multi-hop" },
];

export function BottomHeatmap({ stats }: { stats: Partial<Record<Category, number>> | null }) {
  return (
    <Panel title="Category Contradiction Heatmap" subtitle="from last stress test" bodyClassName="p-3">
      {!stats ? (
        <p className="text-[12px] text-[#5c6570]">Run Stress Test to populate this heatmap.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {ROWS.map((row) => {
            const rate = stats[row.key];
            return (
              <div key={row.key} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-[11px] font-medium text-[#9aa4af]">{row.label}</div>
                {rate === undefined ? (
                  <div className="h-7 w-16 rounded-sm border border-white/[0.05] bg-white/[0.02]" />
                ) : (
                  <div
                    className="fc-mono flex h-7 w-16 items-center justify-center rounded-sm border border-white/[0.1] text-[12px] font-semibold text-white/90"
                    style={{ backgroundColor: heatColor(rate) }}
                  >
                    {rate}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
