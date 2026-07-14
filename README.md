# FlipCheck

A real-time dashboard that tests LLM self-consistency: it rephrases one question
N ways, collects independent answers, semantically clusters them, and judges
whether divergence is a genuine contradiction or legitimate variance.

## Setup

```bash
cp .env.local.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

Four agents (`lib/agents.ts`), orchestrated by `app/api/flipcheck/route.ts` and
streamed to the client as newline-delimited JSON events:

1. **Query Variation Agent** — generates paraphrases (negation, reordering,
   framing, synonym, emphasis) of the base question.
2. **Response Collector Agent** — answers each paraphrase independently.
3. **Semantic Clustering Agent** — groups answers by meaning, not wording.
4. **Contradiction Scorer Agent** — for each pair of clusters, judges genuine
   contradiction vs. legitimate variance, and flags confidence mismatches.

The dashboard (`app/page.tsx`) renders four live panels: paraphrase list,
force-directed answer graph (`d3-force`), contradiction metrics, and a
category × run contradiction-rate heatmap. Use **Run Test** for a single
question or **Stress Test** for the preloaded factual/subjective/multi-hop
batch (`lib/stressTestQuestions.ts`).
