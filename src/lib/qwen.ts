import { z } from 'zod';

import type { GuideCard, GuideGenerationMeta, ReviewStatus, SourceChunk, SourceDocument } from './types';

const DEFAULT_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL_CHAIN = [
  'qwen3.7-max',
  'qwen3.7-plus',
  'qwen3.6-plus',
  'qwen3.6-flash',
  'qwen3.5-plus',
  'qwen3.5-flash',
] as const;
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_TOKENS = 1_200;
const FREE_TIER_EXHAUSTED_CODE = 'AllocationQuota.FreeTierOnly';

const reviewStatuses = ['pending', 'approved', 'edited', 'rejected'] as const satisfies readonly ReviewStatus[];

const qwenCardSchema = z.object({
  id: z.string().min(1).optional(),
  order: z.number().int().positive().optional(),
  title: z.string().min(1),
  purpose: z.string().min(1),
  instructions: z.array(z.string().min(1)).min(1),
  completionCheck: z.string().min(1),
  sourceRefs: z.array(z.string().min(1)).min(1),
  reviewStatus: z.enum(reviewStatuses),
});

const qwenResponseSchema = z.object({
  cards: z.array(qwenCardSchema).min(1),
});

type ResolveGuideCardsInput = {
  deterministicCards: GuideCard[];
  sourceDocuments: SourceDocument[];
  sourceChunks: SourceChunk[];
  allowLiveGeneration?: boolean;
};

type ResolveGuideCardsResult = {
  guideCards: GuideCard[];
  generationMeta: GuideGenerationMeta;
};

type QwenConfig = {
  apiKey: string;
  baseUrl: string;
  modelChain: string[];
};

class QwenQuotaExhaustedError extends Error {
  constructor(readonly model: string, message: string) {
    super(message);
    this.name = 'QwenQuotaExhaustedError';
  }
}

function generationMeta(mode: GuideGenerationMeta['mode'], model: string, reason: string): GuideGenerationMeta {
  return {
    mode,
    model,
    reason,
    generatedAt: new Date().toISOString(),
  };
}

function deterministicFallback(
  deterministicCards: GuideCard[],
  mode: GuideGenerationMeta['mode'],
  model: string,
  reason: string,
): ResolveGuideCardsResult {
  return {
    guideCards: deterministicCards,
    generationMeta: generationMeta(mode, model, reason),
  };
}

function readModelChain(): string[] {
  const rawChain = process.env.QWEN_MODEL_CHAIN?.trim();
  const chain = rawChain
    ? rawChain.split(',').map((model) => model.trim()).filter(Boolean)
    : [...DEFAULT_MODEL_CHAIN];

  return [...new Set(chain)];
}

function readQwenConfig(): QwenConfig | null {
  const apiKey = process.env.QWEN_API_KEY?.trim() || process.env.DASHSCOPE_API_KEY?.trim();

  if (process.env.QWEN_LIVE_GENERATION !== 'true') {
    return null;
  }

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseUrl: process.env.QWEN_BASE_URL?.trim() || DEFAULT_BASE_URL,
    modelChain: readModelChain(),
  };
}

function buildPrompt(sourceDocuments: SourceDocument[], sourceChunks: SourceChunk[]): string {
  const sourceTitles = sourceDocuments
    .map((sourceDocument) => `${sourceDocument.id}: ${sourceDocument.title}`)
    .join('; ');
  const allowedSourceRefs = sourceChunks.map((chunk) => chunk.id);
  const sourcePack = sourceChunks
    .map((chunk) => `${chunk.id} | ${chunk.label}: ${chunk.text}`)
    .join('\n');

  return [
    'Task: Generate a concise Client Handoff Guide for a public-safe synthetic demo.',
    'Return JSON only. No markdown. No prose outside JSON.',
    'Return exactly 4 cards. Each card should have 1-2 short instructions.',
    'Use only the provided source chunks. Do not invent facts, policies, dates, names, prices, or commitments.',
    `Allowed sourceRefs: ${JSON.stringify(allowedSourceRefs)}`,
    'Every card must include one or more sourceRefs copied exactly from the allowed sourceRefs list.',
    'Allowed reviewStatus values: pending, approved, edited, rejected.',
    'Required JSON shape: {"cards":[{"title":"...","purpose":"...","instructions":["..."],"completionCheck":"...","sourceRefs":["handoff-notes#01"],"reviewStatus":"approved"}]}',
    `Source documents: ${sourceTitles}`,
    'Source chunks:',
    sourcePack,
  ].join('\n');
}

function stripJsonFence(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function normalizeCards(rawCards: z.infer<typeof qwenCardSchema>[], validSourceRefs: Set<string>): GuideCard[] {
  return rawCards.map((card, index) => {
    const sourceRefs = card.sourceRefs.filter((ref) => validSourceRefs.has(ref));

    return {
      id: card.id?.trim() || `qwen-step-${String(index + 1).padStart(2, '0')}`,
      order: card.order ?? index + 1,
      title: card.title.trim(),
      purpose: card.purpose.trim(),
      instructions: card.instructions.map((instruction) => instruction.trim()).filter(Boolean),
      completionCheck: card.completionCheck.trim(),
      sourceRefs,
      reviewStatus: card.reviewStatus,
    };
  });
}

function validateGeneratedCards(rawContent: string, sourceChunks: SourceChunk[]): GuideCard[] {
  const parsedJson = JSON.parse(stripJsonFence(rawContent)) as unknown;
  const parsedResponse = qwenResponseSchema.parse(parsedJson);
  const validSourceRefs = new Set(sourceChunks.map((chunk) => chunk.id));
  const cards = normalizeCards(parsedResponse.cards, validSourceRefs);

  if (cards.some((card) => card.sourceRefs.length === 0)) {
    throw new Error('Qwen returned one or more cards without valid source references.');
  }

  if (cards.some((card) => card.instructions.length === 0)) {
    throw new Error('Qwen returned one or more cards without instructions.');
  }

  return cards.sort((a, b) => a.order - b.order).map((card, index) => ({
    ...card,
    order: index + 1,
  }));
}

function isFreeTierExhausted(status: number, body: string): boolean {
  return status === 403 && body.includes(FREE_TIER_EXHAUSTED_CODE);
}

async function requestQwenGuideCards(config: QwenConfig, model: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You generate concise, source-grounded procedure guide cards. Return strict JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: MAX_TOKENS,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();

      if (isFreeTierExhausted(response.status, errorBody)) {
        throw new QwenQuotaExhaustedError(
          model,
          `${model} free quota is exhausted; trying the next configured model.`,
        );
      }

      throw new Error(`Qwen request failed for ${model} with HTTP ${response.status}. ${errorBody}`.trim());
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error(`Qwen response from ${model} did not include message content.`);
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Qwen request for ${model} timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)} seconds.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function resolveGuideCardsWithFallback({
  deterministicCards,
  sourceDocuments,
  sourceChunks,
  allowLiveGeneration = false,
}: ResolveGuideCardsInput): Promise<ResolveGuideCardsResult> {
  const modelChain = readModelChain();
  const primaryModel = modelChain[0] ?? 'unconfigured';

  if (process.env.QWEN_LIVE_GENERATION !== 'true') {
    return deterministicFallback(
      deterministicCards,
      'deterministic_fallback',
      primaryModel,
      'Qwen live generation is disabled; using deterministic demo cards.',
    );
  }

  if (!allowLiveGeneration && process.env.QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION !== 'true') {
    return deterministicFallback(
      deterministicCards,
      'deterministic_fallback',
      primaryModel,
      'Qwen live generation is enabled, but automatic page-load model calls are disabled. Use Run demo slice for an explicit one-time live generation request.',
    );
  }

  const config = readQwenConfig();

  if (!config) {
    return deterministicFallback(
      deterministicCards,
      'qwen_unconfigured_fallback',
      primaryModel,
      'Qwen live generation is enabled but no server-side API key is configured.',
    );
  }

  const prompt = buildPrompt(sourceDocuments, sourceChunks);
  const exhaustedModels: string[] = [];

  for (const model of config.modelChain) {
    try {
      const rawContent = await requestQwenGuideCards(config, model, prompt);
      const guideCards = validateGeneratedCards(rawContent, sourceChunks);
      const skippedModels = exhaustedModels.length > 0 ? ` Skipped exhausted models: ${exhaustedModels.join(', ')}.` : '';

      return {
        guideCards,
        generationMeta: generationMeta('qwen_live', model, `Qwen live generation succeeded with ${model}.${skippedModels}`),
      };
    } catch (error) {
      if (error instanceof QwenQuotaExhaustedError) {
        exhaustedModels.push(error.model);
        continue;
      }

      const reason = error instanceof Error ? error.message : 'Qwen generation failed for an unknown reason.';

      return deterministicFallback(deterministicCards, 'qwen_failed_fallback', model, reason);
    }
  }

  return deterministicFallback(
    deterministicCards,
    'qwen_quota_paused',
    config.modelChain.join(' > '),
    `暫停運作：configured Qwen free-tier quota is exhausted for all models in order: ${config.modelChain.join(' > ')}.`,
  );
}
