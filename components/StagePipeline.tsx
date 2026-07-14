import type { StageKey, StageStatus } from "@/hooks/useFlipCheck";
import { Dot } from "./ui";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "variants", label: "Generating paraphrases…" },
  { key: "collect", label: "Collecting answers…" },
  { key: "score", label: "Scoring pairwise consistency…" },
];

export function StagePipeline({ stages }: { stages: Record<StageKey, StageStatus> }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-md border border-white/[0.08] bg-[#101317] px-3 py-2">
      {STAGES.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Dot status={stages[s.key]} />
            <span className={`text-[11px] font-medium ${stages[s.key] === "idle" ? "text-[#5c6570]" : "text-[#f4f5f6]"}`}>
              {s.label}
            </span>
          </div>
          {i < STAGES.length - 1 && <span className="mx-1 text-[#383835]">→</span>}
        </div>
      ))}
    </div>
  );
}
