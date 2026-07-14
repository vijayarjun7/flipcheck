"use client";

import { useCallback, useRef, useState } from "react";
import type { AnswerItem, Category, FlipCheckEvent, PairScore, RunMetrics } from "@/lib/types";

export type StageKey = "variants" | "collect" | "score";
export type StageStatus = "idle" | "start" | "done";

export interface FlipCheckState {
  running: boolean;
  error: string | null;
  question: string;
  category: Category;
  variants: { index: number; text: string }[];
  answers: AnswerItem[];
  pairs: PairScore[];
  metrics: RunMetrics | null;
  stages: Record<StageKey, StageStatus>;
}

const EMPTY_STAGES: Record<StageKey, StageStatus> = { variants: "idle", collect: "idle", score: "idle" };

function initialState(): FlipCheckState {
  return {
    running: false,
    error: null,
    question: "",
    category: "custom",
    variants: [],
    answers: [],
    pairs: [],
    metrics: null,
    stages: { ...EMPTY_STAGES },
  };
}

export function useFlipCheck() {
  const [state, setState] = useState<FlipCheckState>(initialState());
  const abortRef = useRef<AbortController | null>(null);

  const runOne = useCallback(
    (question: string, category: Category, model: string, variantCount = 6): Promise<RunMetrics | null> => {
      return new Promise((resolve, reject) => {
        let latestMetrics: RunMetrics | null = null;

        (async () => {
          abortRef.current?.abort();
          const controller = new AbortController();
          abortRef.current = controller;

          setState({ ...initialState(), running: true, question, category });

          try {
            const res = await fetch("/api/flipcheck", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ question, category, model, variantCount }),
              signal: controller.signal,
            });

            if (!res.body) throw new Error("No response body from /api/flipcheck");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                if (!line.trim()) continue;
                const event = JSON.parse(line) as FlipCheckEvent;
                applyEvent(event);
              }
            }

            setState((s) => ({ ...s, running: false }));
            resolve(latestMetrics);
          } catch (err) {
            if ((err as Error).name === "AbortError") {
              resolve(null);
              return;
            }
            const message = err instanceof Error ? err.message : String(err);
            setState((s) => ({ ...s, running: false, error: message }));
            reject(err);
          }
        })();

        function applyEvent(event: FlipCheckEvent) {
          switch (event.type) {
            case "meta":
              break;
            case "stage":
              setState((s) => ({ ...s, stages: { ...s.stages, [event.stage]: event.status } }));
              break;
            case "variant":
              setState((s) => ({ ...s, variants: [...s.variants, { index: event.index, text: event.text }] }));
              break;
            case "answer":
              setState((s) => ({ ...s, answers: [...s.answers, event.answer] }));
              break;
            case "pair":
              setState((s) => ({ ...s, pairs: [...s.pairs, event.pair] }));
              break;
            case "metrics":
              latestMetrics = event.metrics;
              setState((s) => ({ ...s, metrics: event.metrics }));
              break;
            case "error":
              setState((s) => ({ ...s, error: event.message }));
              break;
            case "done":
              break;
          }
        }
      });
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState());
  }, []);

  return { state, runOne, reset };
}
