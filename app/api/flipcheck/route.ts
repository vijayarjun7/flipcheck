import { NextRequest } from "next/server";
import { generateVariants, collectAnswer } from "@/lib/agents";
import { judgePairContradiction } from "@/lib/judge";
import { DEFAULT_MODEL } from "@/lib/types";
import type { AnswerItem, Category, FlipCheckEvent, PairScore, RunMetrics, WorstOffender } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeMetrics(answers: AnswerItem[], pairs: PairScore[]): RunMetrics {
  const totalPairs = pairs.length;
  const contradictoryPairs = pairs.filter((p) => p.judge.classification === "contradiction").length;
  const contradictionRate = totalPairs > 0 ? Math.round((contradictoryPairs / totalPairs) * 100) : 0;

  let worstOffender: WorstOffender | null = null;
  let worstScore = -1;
  for (const p of pairs) {
    if (p.judge.score > worstScore) {
      worstScore = p.judge.score;
      worstOffender = {
        a: answers.find((a) => a.index === p.aIndex)!,
        b: answers.find((a) => a.index === p.bIndex)!,
        judge: p.judge,
      };
    }
  }

  return {
    overallClassification: worstOffender ? worstOffender.judge.classification : "legitimate_variance",
    contradictionRate,
    totalPairs,
    contradictoryPairs,
    worstOffender,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const question: string = (body.question ?? "").trim();
  const category: Category = body.category ?? "custom";
  const variantCount: number = Math.min(Math.max(Number(body.variantCount) || 6, 2), 10);
  const model: string = body.model || DEFAULT_MODEL;
  const runId: string = body.runId || crypto.randomUUID();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: FlipCheckEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        if (!question) {
          send({ type: "error", message: "No question provided." });
          controller.close();
          return;
        }

        send({ type: "meta", runId, question, category, model });

        // ---- Query Variation Agent ----
        send({ type: "stage", stage: "variants", status: "start" });
        const variantTexts = await generateVariants(question, variantCount, model);
        if (variantTexts.length === 0) {
          send({ type: "error", message: "Query Variation Agent failed to produce any paraphrases (JSON parse failed)." });
          controller.close();
          return;
        }
        for (let i = 0; i < variantTexts.length; i++) {
          send({ type: "variant", index: i + 1, text: variantTexts[i] });
          await sleep(120);
        }
        send({ type: "stage", stage: "variants", status: "done" });

        // ---- Response Collector Agent ----
        send({ type: "stage", stage: "collect", status: "start" });
        const answers: AnswerItem[] = [];
        await Promise.all(
          variantTexts.map(async (text, i) => {
            const answer = await collectAnswer(text, model);
            const item: AnswerItem = { index: i + 1, question: text, answer };
            answers.push(item);
            send({ type: "answer", answer: item });
          })
        );
        answers.sort((a, b) => a.index - b.index);
        send({ type: "stage", stage: "collect", status: "done" });

        // ---- Pairwise scoring (shared judge) ----
        send({ type: "stage", stage: "score", status: "start" });
        const pairs: PairScore[] = [];
        const pairIndices: [number, number][] = [];
        for (let i = 0; i < answers.length; i++) {
          for (let j = i + 1; j < answers.length; j++) {
            pairIndices.push([i, j]);
          }
        }

        await Promise.all(
          pairIndices.map(async ([i, j]) => {
            const a = answers[i];
            const b = answers[j];
            const judge = await judgePairContradiction(a.answer, b.answer, `Variant ${a.index}`, `Variant ${b.index}`, model);
            const pair: PairScore = { aIndex: a.index, bIndex: b.index, judge };
            pairs.push(pair);
            send({ type: "pair", pair });
          })
        );
        send({ type: "stage", stage: "score", status: "done" });

        // ---- Metrics ----
        const metrics = computeMetrics(answers, pairs);
        send({ type: "metrics", metrics });

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
