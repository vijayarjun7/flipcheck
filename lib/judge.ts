import { callClaude, safeParseJson } from "./anthropic";
import type { Classification, JudgeResult } from "./types";

const JUDGE_SYSTEM = `You are a strict contradiction judge. You will be given two labeled answers. Decide whether they genuinely contradict each other on a factual claim, or whether any difference between them is legitimate variance (e.g. the underlying question is subjective/opinion-based, or the two answers simply add different but compatible detail).

Do not treat all disagreement as failure — only classify as "contradiction" if the two answers are actually incompatible on a factual/logical claim. If they agree on the substance and just differ in wording, emphasis, or add non-conflicting detail, classify as "legitimate_variance".

Respond with ONLY a single valid JSON object — no markdown code fences, no commentary, no text before or after it. Use exactly this shape:
{"classification": "contradiction" | "legitimate_variance", "score": <integer 0-100, 0 = no tension, 100 = flat factual yes-vs-no contradiction>, "explanation": "<one clear sentence>", "evidence_a": "<short verbatim quote (<=15 words) from answer A marking the crux of the disagreement>", "evidence_b": "<short verbatim quote (<=15 words) from answer B marking the crux of the disagreement>"}`;

interface RawJudgeJson {
  classification?: string;
  score?: number;
  explanation?: string;
  evidence_a?: string;
  evidence_b?: string;
}

const SAFE_DEFAULT: JudgeResult = {
  classification: "legitimate_variance",
  score: 0,
  explanation: "Could not parse a judgment from the model — defaulting to legitimate variance.",
  evidenceA: "",
  evidenceB: "",
};

/**
 * Shared judge used by both FlipCheck modes: does answerA genuinely
 * contradict answerB on a factual claim, or is any difference legitimate
 * variance? Always strips markdown fences before parsing, and falls back to
 * a safe default if parsing fails for any reason.
 */
export async function judgePairContradiction(
  answerA: string,
  answerB: string,
  labelA: string,
  labelB: string,
  model: string
): Promise<JudgeResult> {
  const userText = `${labelA}: "${answerA}"

${labelB}: "${answerB}"`;

  const raw = await callClaude({ model, system: JUDGE_SYSTEM, userText, maxTokens: 512 });
  const parsed = safeParseJson<RawJudgeJson>(raw, {});

  if (
    (parsed.classification !== "contradiction" && parsed.classification !== "legitimate_variance") ||
    typeof parsed.score !== "number"
  ) {
    return SAFE_DEFAULT;
  }

  return {
    classification: parsed.classification as Classification,
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    explanation: parsed.explanation ?? "",
    evidenceA: parsed.evidence_a ?? "",
    evidenceB: parsed.evidence_b ?? "",
  };
}
