"use client";

import { useState } from "react";
import { MODEL_OPTIONS } from "@/lib/types";

export function Header({
  onRun,
  onStressTest,
  running,
  stressRunning,
  currentQuestion,
  model,
  setModel,
}: {
  onRun: (question: string) => void;
  onStressTest: () => void;
  running: boolean;
  stressRunning: boolean;
  currentQuestion: string;
  model: string;
  setModel: (m: string) => void;
}) {
  const [question, setQuestion] = useState("Is a hot dog a sandwich?");

  return (
    <div className="flex flex-col gap-2 border-b border-white/[0.08] bg-[#0b0d10] px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a base question…"
          className="fc-mono min-w-[280px] flex-1 rounded border border-white/[0.12] bg-[#151920] px-3 py-1.5 text-[13px] text-[#f4f5f6] outline-none placeholder:text-[#5c6570] focus:border-[#3987e5]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !running && question.trim()) onRun(question.trim());
          }}
        />

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

        <button
          disabled={running || !question.trim()}
          onClick={() => onRun(question.trim())}
          className="rounded bg-[#3987e5] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? "Running…" : "Run Test"}
        </button>

        <button
          disabled={running}
          onClick={onStressTest}
          className="rounded border border-white/[0.16] bg-transparent px-3 py-1.5 text-[12px] font-semibold text-[#d5d9dd] transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Stress Test
        </button>
      </div>

      {stressRunning && (
        <div className="fc-mono flex items-center gap-1.5 text-[11px] text-[#9aa4af]">
          <span className="fc-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#fab219]" />
          Stress test running — currently testing: <span className="text-[#d5d9dd]">{currentQuestion}</span>
        </div>
      )}
    </div>
  );
}
