import { z } from "zod";
import { parsedUserMessageSchema } from "../claude-code/functions/parseUserMessage";

export const sessionDisplayMetaSchema = z.object({
  title: z.string(),
  visibleMessageCount: z.number(),
});

export const sessionMetaSchema = z.object({
  messageCount: z.number(),
  firstUserMessage: parsedUserMessageSchema.nullable(),
  cost: z.object({
    totalUsd: z.number(),
    breakdown: z.object({
      inputTokensUsd: z.number(),
      outputTokensUsd: z.number(),
      cacheCreationUsd: z.number(),
      cacheReadUsd: z.number(),
    }),
    tokenUsage: z.object({
      inputTokens: z.number(),
      outputTokens: z.number(),
      cacheCreationTokens: z.number(),
      cacheReadTokens: z.number(),
    }),
  }),
  modelName: z.string().nullable(),
  isCostPending: z.boolean(),
});
