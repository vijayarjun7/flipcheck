import type { CardState } from "@/hooks/useSycophancyCheck";
import type { PremiseTestPair } from "@/lib/types";
import { STATUS } from "@/lib/palette";
import { Badge } from "@/components/ui";
import { HighlightText } from "@/components/HighlightText";
import { CaveatNote } from "./CaveatNote";

const OUTCOME_COLOR: Record<string, string> = {
  held: STATUS.legitimateVariance,
  hedged: STATUS.hedged,
  folded: STATUS.contradiction,
};

const OUTCOME_LABEL: Record<string, string> = { held: "Held", hedged: "Hedged", folded: "Folded" };

export function PremiseCard({
  pair,
  card,
  onRunPair,
  onRunRebuttal,
}: {
  pair: PremiseTestPair;
  card: CardState;
  onRunPair: () => void;
  onRunRebuttal: () => void;
}) {
  const { pairResult, pairLoading, pairError, rebuttalResult, rebuttalLoading, rebuttalError } = card;

  return (
    <div className="flex flex-col gap-3 rounded border border-white/[0.08] bg-[#151920] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-[#f4f5f6]">{pair.name}</span>
        <div className="flex gap-2">
          <button
            disabled={pairLoading}
            onClick={onRunPair}
            className="rounded bg-[#3987e5] px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pairLoading ? "Running…" : "Run pair"}
          </button>
          <button
            disabled={rebuttalLoading}
            onClick={onRunRebuttal}
            className="rounded border border-white/[0.16] bg-transparent px-2.5 py-1 text-[11px] font-semibold text-[#d5d9dd] transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {rebuttalLoading ? "Running…" : "Run rebuttal"}
          </button>
        </div>
      </div>

      {pairError && <p className="text-[11px] text-[#e6564f]">{pairError}</p>}

      {pairResult && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded border border-white/[0.06] bg-[#0d0f12] p-2">
              <div className="fc-mono mb-1 text-[10px] text-[#5c6570]">NEUTRAL</div>
              <p className="mb-1.5 text-[11px] font-medium text-[#9aa4af]">{pair.neutralQuestion}</p>
              <p className="text-[12px] leading-snug text-[#d5d9dd]">
                <HighlightText text={pairResult.neutralAnswer} fragment={pairResult.judge.evidenceA} />
              </p>
            </div>
            <div className="rounded border border-white/[0.06] bg-[#0d0f12] p-2">
              <div className="fc-mono mb-1 text-[10px] text-[#5c6570]">LEADING</div>
              <p className="mb-1.5 text-[11px] font-medium text-[#9aa4af]">{pair.leadingQuestion}</p>
              <p className="text-[12px] leading-snug text-[#d5d9dd]">
                <HighlightText text={pairResult.leadingAnswer} fragment={pairResult.judge.evidenceB} />
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge color={pairResult.judge.classification === "contradiction" ? STATUS.contradiction : STATUS.legitimateVariance}>
              {pairResult.judge.classification === "contradiction" ? "Contradiction" : "Consistent"}
            </Badge>
            <Badge color={pairResult.premiseCorrection.corrected ? STATUS.legitimateVariance : STATUS.contradiction}>
              {pairResult.premiseCorrection.corrected ? "Corrected false premise" : "Accepted false premise"}
            </Badge>
            <span className="fc-mono text-[10px] text-[#5c6570]">score {pairResult.judge.score}/100</span>
          </div>

          <p className="text-[11px] italic leading-snug text-[#9aa4af]">
            {pairResult.judge.explanation}
            {pairResult.premiseCorrection.evidence && (
              <>
                {" "}
                — <span className="not-italic text-[#d5d9dd]">&ldquo;{pairResult.premiseCorrection.evidence}&rdquo;</span>
              </>
            )}
          </p>

          <CaveatNote>
            A single-turn correct answer here doesn&rsquo;t rule out sycophancy under sustained pressure, a different
            model, or subtler premises than the one tested.
          </CaveatNote>
        </div>
      )}

      {rebuttalError && <p className="text-[11px] text-[#e6564f]">{rebuttalError}</p>}

      {rebuttalResult && (
        <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded border border-white/[0.06] bg-[#0d0f12] p-2">
              <div className="mb-1 text-[10px] text-[#5c6570]">STEP 1 · INITIAL ANSWER</div>
              <p className="text-[12px] leading-snug text-[#d5d9dd]">{rebuttalResult.initialAnswer}</p>
            </div>
            <div className="flex items-center text-[#383835]">→</div>
            <div
              className="flex-1 rounded border p-2"
              style={{ borderColor: `${OUTCOME_COLOR[rebuttalResult.outcome]}66`, backgroundColor: "#0d0f12" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-[#5c6570]">STEP 2 · AFTER REBUTTAL</span>
                <Badge color={OUTCOME_COLOR[rebuttalResult.outcome]}>{OUTCOME_LABEL[rebuttalResult.outcome]}</Badge>
              </div>
              <p className="mb-1 text-[11px] italic text-[#5c6570]">&ldquo;{rebuttalResult.rebuttalMessage}&rdquo;</p>
              <p className="text-[12px] leading-snug text-[#d5d9dd]">{rebuttalResult.secondAnswer}</p>
            </div>
          </div>
          <p className="text-[11px] italic leading-snug text-[#9aa4af]">{rebuttalResult.explanation}</p>
        </div>
      )}
    </div>
  );
}
