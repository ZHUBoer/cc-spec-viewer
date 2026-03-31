import {
  DEFAULT_MODEL_PRICING,
  MODEL_PRICING,
  type ModelName,
  type ModelPricing,
} from "../constants/pricing";

/**
 * Token usage information extracted from assistant messages
 */
export type TokenUsage = {
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly cache_creation_input_tokens: number | undefined;
  readonly cache_read_input_tokens: number | undefined;
};

/**
 * Cost breakdown by token type in USD
 */
export type CostBreakdown = {
  readonly inputTokensUsd: number;
  readonly outputTokensUsd: number;
  readonly cacheCreationUsd: number;
  readonly cacheReadUsd: number;
};

/**
 * Token usage summary
 */
export type TokenUsageSummary = {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly cacheCreationTokens: number;
  readonly cacheReadTokens: number;
};

/**
 * Cost calculation result
 */
export type CostCalculationResult = {
  readonly totalUsd: number;
  readonly breakdown: CostBreakdown;
  readonly tokenUsage: TokenUsageSummary;
};

/**
 * Normalizes Claude API model names to standard model identifiers
 *
 * Examples:
 * - "claude-sonnet-4-5-20250929" -> "claude-sonnet-4.5"
 * - "claude-haiku-4-5-20251001" -> "claude-haiku-4.5"
 *
 * @param modelName Raw model name from API
 * @returns Normalized model name or default model name if unknown
 */
export function normalizeModelName(modelName: string): ModelName {
  const normalized = modelName.toLowerCase();

  // Claude Sonnet 4.5 patterns
  if (
    normalized.includes("sonnet-4-5") ||
    normalized.includes("sonnet-4.5") ||
    normalized.includes("sonnet-4")
  ) {
    return "claude-sonnet-4.5";
  }

  // Claude Haiku 4.5 patterns
  if (
    normalized.includes("haiku-4-5") ||
    normalized.includes("haiku-4.5") ||
    normalized.includes("haiku-4")
  ) {
    return "claude-haiku-4.5";
  }

  // Unknown model - return default
  return "claude-sonnet-4.5";
}

/**
 * Gets pricing for a model, with fallback to default pricing
 */
function getModelPricing(modelName: string): ModelPricing {
  const normalized = normalizeModelName(modelName);
  return MODEL_PRICING[normalized] ?? DEFAULT_MODEL_PRICING;
}

/**
 * Calculates the cost in USD for token usage
 *
 * @param usage Token usage information
 * @param modelName Model name (will be normalized)
 * @returns Cost calculation result with breakdown
 */
export function calculateTokenCost(
  usage: TokenUsage,
  modelName: string,
): CostCalculationResult {
  const pricing = getModelPricing(modelName);

  // Convert tokens to millions for cost calculation
  const inputMTok = usage.input_tokens / 1_000_000;
  const outputMTok = usage.output_tokens / 1_000_000;
  const cacheCreationMTok =
    (usage.cache_creation_input_tokens ?? 0) / 1_000_000;
  const cacheReadMTok = (usage.cache_read_input_tokens ?? 0) / 1_000_000;

  // Calculate costs
  const inputTokensUsd = inputMTok * pricing.input;
  const outputTokensUsd = outputMTok * pricing.output;
  const cacheCreationUsd = cacheCreationMTok * pricing.cache_creation;
  const cacheReadUsd = cacheReadMTok * pricing.cache_read;

  const totalUsd =
    inputTokensUsd + outputTokensUsd + cacheCreationUsd + cacheReadUsd;

  return {
    totalUsd,
    breakdown: {
      inputTokensUsd,
      outputTokensUsd,
      cacheCreationUsd,
      cacheReadUsd,
    },
    tokenUsage: {
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    },
  };
}
