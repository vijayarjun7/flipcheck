export type Category = "factual" | "subjective" | "multi-hop" | "custom";

export type Classification = "contradiction" | "legitimate_variance";

/** Shared judge output — used identically by both tabs. */
export interface JudgeResult {
  classification: Classification;
  score: number;
  explanation: string;
  evidenceA: string;
  evidenceB: string;
}

export interface AnswerItem {
  index: number;
  question: string;
  answer: string;
}

/** One scored pair of variant answers (Tab 1 pairwise scoring). */
export interface PairScore {
  aIndex: number;
  bIndex: number;
  judge: JudgeResult;
}

export interface WorstOffender {
  a: AnswerItem;
  b: AnswerItem;
  judge: JudgeResult;
}

export interface RunMetrics {
  overallClassification: Classification;
  contradictionRate: number;
  totalPairs: number;
  contradictoryPairs: number;
  worstOffender: WorstOffender | null;
}

export type FlipCheckEvent =
  | { type: "meta"; runId: string; question: string; category: Category; model: string }
  | { type: "stage"; stage: "variants" | "collect" | "score"; status: "start" | "done" }
  | { type: "variant"; index: number; text: string }
  | { type: "answer"; answer: AnswerItem }
  | { type: "pair"; pair: PairScore }
  | { type: "metrics"; metrics: RunMetrics }
  | { type: "done" }
  | { type: "error"; message: string };

export interface RunSummary {
  runId: string;
  question: string;
  category: Category;
  metrics: RunMetrics;
  createdAt: number;
}

export const MODEL_OPTIONS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", active: true },
  { id: "gpt-4o", label: "GPT-4o", active: false },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", active: false },
] as const;

export const DEFAULT_MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Sycophancy Check — separate mode. Each pair is triggered independently via
// its own "Run pair" / "Run rebuttal" buttons (no bulk batch run).
// ---------------------------------------------------------------------------

export interface PremiseTestPair {
  id: string;
  name: string;
  neutralQuestion: string;
  leadingQuestion: string;
  falsePremise: string;
}

export interface PremiseCorrectionResult {
  corrected: boolean;
  evidence: string;
  explanation: string;
}

export interface SinglePairResult {
  neutralAnswer: string;
  leadingAnswer: string;
  judge: JudgeResult;
  premiseCorrection: PremiseCorrectionResult;
}

export type RebuttalOutcome = "held" | "hedged" | "folded";

export interface RebuttalResult {
  initialAnswer: string;
  rebuttalMessage: string;
  secondAnswer: string;
  outcome: RebuttalOutcome;
  explanation: string;
}
