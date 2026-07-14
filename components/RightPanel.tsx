import type { RunMetrics } from "@/lib/types";
import { STATUS } from "@/lib/palette";
import { Badge, Panel } from "./ui";
import { HighlightText } from "./HighlightText";

export function RightPanel({ metrics, running }: { metrics: RunMetrics | null; running: boolean }) {
  const worst = metrics?.worstOffender;

  return (
    <Panel title="Worst Offender" subtitle={metrics ? `${metrics.contradictionRate}% contradiction rate` : undefined}>
      <div className="flex flex-col gap-3 p-3">
        {!metrics && (
          <p className="text-[12px] text-[#5c6570]">
            {running ? "Waiting for pairwise scoring to complete…" : "Run a test to see results here."}
          </p>
        )}

        {metrics && (
          <>
            <div className="flex items-center justify-between">
              <Badge color={metrics.overallClassification === "contradiction" ? STATUS.contradiction : STATUS.legitimateVariance}>
                {metrics.overallClassification === "contradiction" ? "Contradiction" : "Legitimate variance"}
              </Badge>
              <span className="fc-mono text-[10px] text-[#5c6570]">
                {metrics.contradictoryPairs}/{metrics.totalPairs} pairs contradictory
              </span>
            </div>

            {worst ? (
              <div className="flex flex-col gap-2">
                <div className="rounded border border-white/[0.06] bg-[#0d0f12] p-2">
                  <div className="fc-mono mb-1 text-[10px] text-[#5c6570]">#{worst.a.index}</div>
                  <p className="text-[12px] leading-snug text-[#d5d9dd]">
                    <HighlightText text={worst.a.answer} fragment={worst.judge.evidenceA} />
                  </p>
                </div>
                <div className="flex justify-center text-[#5c6570]">vs</div>
                <div className="rounded border border-white/[0.06] bg-[#0d0f12] p-2">
                  <div className="fc-mono mb-1 text-[10px] text-[#5c6570]">#{worst.b.index}</div>
                  <p className="text-[12px] leading-snug text-[#d5d9dd]">
                    <HighlightText text={worst.b.answer} fragment={worst.judge.evidenceB} />
                  </p>
                </div>
                <div className="fc-mono mt-1 flex items-center gap-2 text-[11px]">
                  <span className="text-[#5c6570]">score</span>
                  <span
                    className="font-bold"
                    style={{ color: worst.judge.classification === "contradiction" ? STATUS.contradiction : STATUS.legitimateVariance }}
                  >
                    {worst.judge.score}/100
                  </span>
                </div>
                <p className="text-[11px] italic leading-snug text-[#9aa4af]">{worst.judge.explanation}</p>
              </div>
            ) : (
              <p className="text-[12px] text-[#5c6570]">Not enough variants to form a pair.</p>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
