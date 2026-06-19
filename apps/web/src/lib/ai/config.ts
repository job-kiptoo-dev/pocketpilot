/** AI Gateway config. The model is a gateway "creator/model" string. */
export const AI_MODEL = process.env.POCKETPILOT_AI_MODEL ?? "anthropic/claude-sonnet-4-6";

/**
 * True when the LLM can be reached: a gateway key locally, or Vercel OIDC in
 * production. Without it the assistant falls back to the local rule engine.
 */
export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}
