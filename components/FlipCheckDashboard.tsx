"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { StagePipeline } from "@/components/StagePipeline";
import { LeftPanel } from "@/components/LeftPanel";
import { RightPanel } from "@/components/RightPanel";
import { BottomHeatmap } from "@/components/BottomHeatmap";
import { useFlipCheck } from "@/hooks/useFlipCheck";
import { STRESS_TEST_QUESTIONS } from "@/lib/stressTestQuestions";
import type { Category } from "@/lib/types";

export function FlipCheckDashboard({ model, setModel }: { model: string; setModel: (m: string) => void }) {
  const { state, runOne } = useFlipCheck();
  const [stressRunning, setStressRunning] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Partial<Record<Category, number>> | null>(null);

  const running = state.running || stressRunning;

  async function handleRun(question: string) {
    try {
      await runOne(question, "custom", model);
    } catch {
      // error surfaced via state.error
    }
  }

  async function handleStressTest() {
    setStressRunning(true);
    const byCategory = new Map<Category, number[]>();
    try {
      for (const q of STRESS_TEST_QUESTIONS) {
        const metrics = await runOne(q.question, q.category, model);
        if (metrics) {
          const list = byCategory.get(q.category) ?? [];
          list.push(metrics.contradictionRate);
          byCategory.set(q.category, list);
        }
      }
      const stats: Partial<Record<Category, number>> = {};
      for (const [category, rates] of Array.from(byCategory.entries())) {
        stats[category] = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
      }
      setCategoryStats(stats);
    } finally {
      setStressRunning(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        onRun={handleRun}
        onStressTest={handleStressTest}
        running={running}
        stressRunning={stressRunning}
        currentQuestion={state.question}
        model={model}
        setModel={setModel}
      />

      <div className="flex flex-1 flex-col gap-2 overflow-auto fc-scrollbar p-2">
        <StagePipeline stages={state.stages} />

        {state.error && (
          <div className="rounded border border-[#e6564f]/40 bg-[#e6564f]/10 px-3 py-2 text-[12px] text-[#e6564f]">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <div className="min-h-[320px]">
            <LeftPanel question={state.question} variants={state.variants} loading={state.running} />
          </div>
          <div className="min-h-[320px]">
            <RightPanel metrics={state.metrics} running={state.running} />
          </div>
        </div>

        <div className="h-40 shrink-0">
          <BottomHeatmap stats={categoryStats} />
        </div>
      </div>
    </div>
  );
}
