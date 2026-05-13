import { ModelProviderType } from "@prisma/client";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { decryptText } from "@/lib/crypto";

type ProviderRecord = {
  provider: ModelProviderType;
  encryptedKey: string;
  baseUrl: string | null;
};

export const DEFAULT_MODEL_BY_PROVIDER: Record<ModelProviderType, string> = {
  OPENAI: "gpt-4.1-mini",
  ANTHROPIC: "claude-3-5-haiku-latest",
  GOOGLE: "gemini-2.5-flash",
  CUSTOM: "gpt-4.1-mini",
};

const PRICE_PER_1K_USD: Partial<Record<string, { input: number; output: number }>> = {
  "gpt-4.1-mini": { input: 0.0004, output: 0.0016 },
  "gpt-4.1-nano": { input: 0.0001, output: 0.0004 },
  "claude-3-5-haiku-latest": { input: 0.0008, output: 0.004 },
  "gemini-2.5-flash": { input: 0.00035, output: 0.00105 },
};

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const pricing = PRICE_PER_1K_USD[model];
  if (!pricing) {
    return 0;
  }

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}

export function createLanguageModel(config: ProviderRecord, modelId: string) {
  const apiKey = decryptText(config.encryptedKey);

  switch (config.provider) {
    case "OPENAI":
    case "CUSTOM": {
      const provider = createOpenAI({
        apiKey,
        baseURL: config.baseUrl ?? undefined,
      });
      return provider(modelId);
    }
    case "ANTHROPIC": {
      const provider = createAnthropic({
        apiKey,
        baseURL: config.baseUrl ?? undefined,
      });
      return provider(modelId);
    }
    case "GOOGLE": {
      const provider = createGoogleGenerativeAI({
        apiKey,
        baseURL: config.baseUrl ?? undefined,
      });
      return provider(modelId);
    }
    default:
      throw new Error("暂不支持的模型提供商");
  }
}
