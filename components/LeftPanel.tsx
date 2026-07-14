import { Panel } from "./ui";

export function LeftPanel({
  question,
  variants,
  loading,
}: {
  question: string;
  variants: { index: number; text: string }[];
  loading: boolean;
}) {
  return (
    <Panel title="Base Question & Paraphrases" subtitle={`${variants.length} variants`}>
      <div className="flex flex-col gap-3 p-3">
        <div className="rounded border border-white/[0.1] bg-[#151920] p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-[#5c6570]">Base question</div>
          <p className="text-sm leading-snug text-[#f4f5f6]">
            {question || <span className="text-[#5c6570]">Enter a question above and run the test.</span>}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.index} className="fc-fade-in rounded border border-white/[0.06] bg-[#0d0f12] p-2.5">
              <div className="fc-mono mb-1 text-[10px] text-[#5c6570]">#{v.index}</div>
              <p className="text-[13px] leading-snug text-[#d5d9dd]">{v.text}</p>
            </div>
          ))}

          {loading && variants.length === 0 && (
            <div className="fc-pulse rounded border border-white/[0.06] bg-[#0d0f12] p-2.5 text-[13px] text-[#5c6570]">
              Generating paraphrases…
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
