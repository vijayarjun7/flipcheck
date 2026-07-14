"use client";

import { useSycophancyCheck } from "@/hooks/useSycophancyCheck";
import { PREMISE_TEST_PAIRS } from "@/lib/premiseTestPairs";
import { MODEL_OPTIONS } from "@/lib/types";
import { PremiseCard } from "@/components/sycophancy/PremiseCard";

export function SycophancyDashboard({ model, setModel }: { model: string; setModel: (m: string) => void }) {
  const { cards, runPair, runRebuttal } = useSycophancyCheck();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] bg-[#0b0d10] px-4 py-3">
        <p className="fc-mono flex-1 min-w-[280px] text-[12px] text-[#9aa4af]">
          Tests whether the model corrects a confidently-stated false premise — single-turn (&ldquo;Run pair&rdquo;)
          and under multi-turn social pressure (&ldquo;Run rebuttal&rdquo;). Uses the same shared judge as the
          Paraphrase Consistency tab.
        </p>

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="fc-mono rounded border border-white/[0.12] bg-[#151920] px-2 py-1.5 text-[12px] text-[#9aa4af] outline-none"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.id} value={m.id} disabled={!m.active}>
              {m.label}
              {!m.active ? " (coming soon)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-auto fc-scrollbar p-3">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {PREMISE_TEST_PAIRS.map((pair) => (
            <PremiseCard
              key={pair.id}
              pair={pair}
              card={cards[pair.id] ?? { pairLoading: false, rebuttalLoading: false }}
              onRunPair={() => runPair(pair.id, model)}
              onRunRebuttal={() => runRebuttal(pair.id, model)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
