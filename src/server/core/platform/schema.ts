import { z } from "zod";

export const envSchema = z.object({
  // Frameworks
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
  NEXT_PHASE: z.string().optional(),
  PATH: z.string().optional(),

  // Anthropic API Configuration
  // Standard Anthropic SDK expects ANTHROPIC_API_KEY
  ANTHROPIC_API_KEY: z.string().optional(),
  // Some custom proxy services use ANTHROPIC_AUTH_TOKEN instead
  ANTHROPIC_AUTH_TOKEN: z.string().optional(),
  // Custom API endpoint (e.g., for proxy services or custom deployments)
  ANTHROPIC_BASE_URL: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;
