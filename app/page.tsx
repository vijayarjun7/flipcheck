"use client";

import { useState } from "react";
import { ModeTabs, type Mode } from "@/components/ModeTabs";
import { FlipCheckDashboard } from "@/components/FlipCheckDashboard";
import { SycophancyDashboard } from "@/components/SycophancyDashboard";
import { DEFAULT_MODEL } from "@/lib/types";

export default function Home() {
  const [mode, setMode] = useState<Mode>("flipcheck");
  const [model, setModel] = useState(DEFAULT_MODEL);

  return (
    <div className="flex h-screen flex-col bg-[#08090b]">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0b0d10] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#3987e5]" />
          <h1 className="text-sm font-bold tracking-wide text-[#f4f5f6]">FLIPCHECK</h1>
          <span className="fc-mono text-[10px] text-[#5c6570]">LLM self-consistency dashboard</span>
        </div>
        <ModeTabs mode={mode} setMode={setMode} />
      </div>

      {mode === "flipcheck" ? (
        <FlipCheckDashboard model={model} setModel={setModel} />
      ) : (
        <SycophancyDashboard model={model} setModel={setModel} />
      )}
    </div>
  );
}
