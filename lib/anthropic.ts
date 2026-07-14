// Thin wrapper around the Anthropic Messages API using raw fetch, per the
// project's requirement to call https://api.anthropic.com/v1/messages directly
// (no SDK). The API key is read from the server environment only.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

interface ContentBlockText {
  type: "text";
  text: string;
}

type ContentBlock = ContentBlockText | { type: string; [k: string]: unknown };

interface AnthropicMessageResponse {
  content: ContentBlock[];
  stop_reason?: string;
  [k: string]: unknown;
}

interface CallClaudeParams {
  model: string;
  system: string;
  /** Single-turn convenience — becomes a one-item user message. Mutually exclusive with `messages`. */
  userText?: string;
  /** Full conversation history for multi-turn calls (e.g. the sycophancy rebuttal flow). */
  messages?: MessageParam[];
  maxTokens?: number;
}

export class AnthropicApiError extends Error {}

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new AnthropicApiError(
      "ANTHROPIC_API_KEY is not set in the server environment. Add it to .env.local and restart the dev server."
    );
  }
  return key;
}

export async function callClaude(params: CallClaudeParams): Promise<string> {
  const { model, system, userText, messages, maxTokens = 1024 } = params;

  if (!userText && !messages) {
    throw new AnthropicApiError("callClaude requires either `userText` or `messages`.");
  }

  const body = {
    model,
    max_tokens: maxTokens,
    system,
    messages: messages ?? [{ role: "user", content: userText }],
  };

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new AnthropicApiError(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as AnthropicMessageResponse;
  return data.content
    .filter((b): b is ContentBlockText => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Strips ```json ... ``` / ``` ... ``` fences (and any leading/trailing prose
 * a model might still emit despite instructions) so JSON.parse gets clean input. */
export function stripCodeFences(text: string): string {
  let t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    t = fenced[1].trim();
  }
  // If there's still leading/trailing prose around a JSON object/array, slice to it.
  const firstBrace = Math.min(
    ...[t.indexOf("{"), t.indexOf("[")].filter((i) => i !== -1).concat([Infinity])
  );
  const lastBrace = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (firstBrace !== Infinity && lastBrace !== -1 && lastBrace >= firstBrace) {
    t = t.slice(firstBrace, lastBrace + 1);
  }
  return t.trim();
}

/** Parses JSON defensively: strips markdown fences first, and falls back to a
 * safe default rather than throwing if parsing fails for any reason. */
export function safeParseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(stripCodeFences(text)) as T;
  } catch {
    return fallback;
  }
}
