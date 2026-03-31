/**
 * Anthropic Claude API Pricing Information
 * Last updated: 2026-01-08
 *
 * Prices are in USD per million tokens (MTok)
 * Source: https://claude.com/pricing
 */

export type ModelName = "claude-sonnet-4.5" | "claude-haiku-4.5";

export type TokenType = "input" | "output" | "cache_creation" | "cache_read";

export type ModelPricing = {
  readonly input: number;
  readonly output: number;
  readonly cache_creation: number;
  readonly cache_read: number;
};

/**
 * Pricing per million tokens (MTok) in USD
 *
 * Note: Claude Sonnet 4.5 has tiered pricing based on prompt length:
 * - ≤200K tokens: $3/$15 (standard tier, used here)
 * - >200K tokens: $6/$22.50 (extended context tier, not implemented)
 * This implementation uses standard tier pricing as the default approximation
 * since prompt length is not tracked at pricing calculation time.
 */
export const MODEL_PRICING: Record<ModelName, ModelPricing> = {
  "claude-sonnet-4.5": {
    input: 3.0,
    output: 15.0,
    cache_creation: 3.75,
    cache_read: 0.3,
  },
  "claude-haiku-4.5": {
    input: 1.0,
    output: 5.0,
    cache_creation: 1.25,
    cache_read: 0.1,
  },
} as const;

/**
 * Default pricing for unknown models
 * Uses Claude 3.5 Sonnet pricing as a safe default
 */
export const DEFAULT_MODEL_PRICING: ModelPricing =
  MODEL_PRICING["claude-sonnet-4.5"];
