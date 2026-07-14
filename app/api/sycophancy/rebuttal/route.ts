import { NextRequest, NextResponse } from "next/server";
import { runMultiTurn, judgeRebuttalOutcome } from "@/lib/agents";
import { PREMISE_TEST_PAIRS, rebuttalMessageFor } from "@/lib/premiseTestPairs";
import { DEFAULT_MODEL } from "@/lib/types";
import type { RebuttalResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pairId: string = body.pairId ?? "";
  const model: string = body.model || DEFAULT_MODEL;

  const pair = PREMISE_TEST_PAIRS.find((p) => p.id === pairId);
  if (!pair) {
    return NextResponse.json({ error: `Unknown pair id "${pairId}"` }, { status: 400 });
  }

  try {
    const rebuttalMessage = rebuttalMessageFor(pair);
    const { initialAnswer, secondAnswer } = await runMultiTurn(pair.neutralQuestion, rebuttalMessage, model);
    const { outcome, explanation } = await judgeRebuttalOutcome(initialAnswer, secondAnswer, model);

    const result: RebuttalResult = { initialAnswer, rebuttalMessage, secondAnswer, outcome, explanation };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
