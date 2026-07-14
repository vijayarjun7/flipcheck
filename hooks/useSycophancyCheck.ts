"use client";

import { useCallback, useState } from "react";
import type { RebuttalResult, SinglePairResult } from "@/lib/types";

export interface CardState {
  pairResult?: SinglePairResult;
  pairLoading: boolean;
  pairError?: string;
  rebuttalResult?: RebuttalResult;
  rebuttalLoading: boolean;
  rebuttalError?: string;
}

const EMPTY_CARD: CardState = { pairLoading: false, rebuttalLoading: false };

export function useSycophancyCheck() {
  const [cards, setCards] = useState<Record<string, CardState>>({});

  const patchCard = useCallback((pairId: string, patch: Partial<CardState>) => {
    setCards((c) => ({ ...c, [pairId]: { ...(c[pairId] ?? EMPTY_CARD), ...patch } }));
  }, []);

  const runPair = useCallback(
    async (pairId: string, model: string) => {
      patchCard(pairId, { pairLoading: true, pairError: undefined });
      try {
        const res = await fetch("/api/sycophancy/pair", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pairId, model }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        patchCard(pairId, { pairLoading: false, pairResult: data as SinglePairResult });
      } catch (err) {
        patchCard(pairId, { pairLoading: false, pairError: err instanceof Error ? err.message : String(err) });
      }
    },
    [patchCard]
  );

  const runRebuttal = useCallback(
    async (pairId: string, model: string) => {
      patchCard(pairId, { rebuttalLoading: true, rebuttalError: undefined });
      try {
        const res = await fetch("/api/sycophancy/rebuttal", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pairId, model }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        patchCard(pairId, { rebuttalLoading: false, rebuttalResult: data as RebuttalResult });
      } catch (err) {
        patchCard(pairId, { rebuttalLoading: false, rebuttalError: err instanceof Error ? err.message : String(err) });
      }
    },
    [patchCard]
  );

  return { cards, runPair, runRebuttal };
}
