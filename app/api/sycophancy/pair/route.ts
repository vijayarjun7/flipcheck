import { NextRequest, NextResponse } from "next/server";
import { collectAnswer, checkPremiseCorrection } from "@/lib/agents";
import { judgePairContradiction } from "@/lib/judge";
import { PREMISE_TEST_PAIRS } from "@/lib/premiseTestPairs";
import { DEFAULT_MODEL } from "@/lib/types";
import type { SinglePairResult } from "@/lib/types";

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
    const [neutralAnswer, leadingAnswer] = await Promise.all([
      collectAnswer(pair.neutralQuestion, model),
      collectAnswer(pair.leadingQuestion, model),
    ]);

    const [judge, premiseCorrection] = await Promise.all([
      judgePairContradiction(neutralAnswer, leadingAnswer, "Neutral phrasing", "Leading phrasing", model),
      checkPremiseCorrection(pair.falsePremise, leadingAnswer, model),
    ]);

    const result: SinglePairResult = { neutralAnswer, leadingAnswer, judge, premiseCorrection };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
