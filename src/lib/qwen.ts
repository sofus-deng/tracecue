import { z } from 'zod';

import type { GuideCard, GuideGenerationMeta, ReviewStatus, SourceChunk, SourceDocument } from './types';

const DEFAULT_MODEL = 'qwen3.7-plus';
const DEFAULT_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const REQUEST_TIMEOUT_MS = 45_000;

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
};

type ResolveGuideCardsResult = {
  guideCards: GuideCard[];
  generationMeta: GuideGenerationMeta;
};

type QwenConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

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

function readQwenConfig(): QwenConfig | null {
  const model = process.env.QWEN_MODEL?.trim() || DEFAULT_MODEL;
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
    model,
  };
}

function buildPrompt(sourceDocuments: SourceDocument[], sourceChunks: SourceChunk[]): string {
  const sourcePack = sourceChunks
    .map((chunk) => {
      const document = sourceDocuments.find((sourceDocument) => sourceDocument.id === chunk.documentId);

      return [
        `Chunk ID: ${chunk.id}`,
        `Document: ${document?.title ?? chunk.documentId}`,
        `Kind: ${document?.kind ?? 'unknown'}`,
        `Label: ${chunk.label}`,
        `Text: ${chunk.text}`,
      ].join('\n');
    })
    .join('\n\n');

  return [
    'Generate a Client Handoff Guide for a public-safe synthetic demo.',
    'Use only the provided synthetic source chunks.',
    'Each card must include sourceRefs that exactly match one or more provided Chunk ID values.',
    'Do not invent customer facts, private details, policies, dates, names, prices, or commitments.',
    'Return strict JSON only. Do not include markdown, comments, or prose outside the JSON object.',
    'Use reviewStatus values compatible with the app: pending, approved, edited, rejected.',
    'Return this shape: {"cards":[{"title":"Open the client handoff guide","purpose":"Give the client a single place to begin after delivery.","instructions":["Open the shared handoff link."],"completionCheck":"Client can find the guide and understand where to begin.","sourceRefs":["delivery-checklist#01"],"reviewStatus":"approved"}]}',
    '',
    'Synthetic source chunks:',
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

async function requestQwenGuideCards(config: QwenConfig, prompt: string): Promise<string> {
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
        model: config.model,
        messages: [
          {
            role: 'system',
            content:
              'You generate source-grounded procedure guide cards for a public-safe synthetic demo. Return strict JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Qwen request failed with HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Qwen response did not include message content.');
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function resolveGuideCardsWithFallback({
  deterministicCards,
  sourceDocuments,
  sourceChunks,
}: ResolveGuideCardsInput): Promise<ResolveGuideCardsResult> {
  const model = process.env.QWEN_MODEL?.trim() || DEFAULT_MODEL;

  if (process.env.QWEN_LIVE_GENERATION !== 'true') {
    return deterministicFallback(
      deterministicCards,
      'deterministic_fallback',
      model,
      'Qwen live generation is disabled; using deterministic demo cards.',
    );
  }

  if (process.env.QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION !== 'true') {
    return deterministicFallback(
      deterministicCards,
      'deterministic_fallback',
      model,
      'Qwen live generation is enabled, but automatic page-load model calls are disabled. Set QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=true only during controlled demos.',
    );
  }

  const config = readQwenConfig();

  if (!config) {
    return deterministicFallback(
      deterministicCards,
      'qwen_unconfigured_fallback',
      model,
      'Qwen live generation is enabled but no server-side API key is configured.',
    );
  }

  try {
    const rawContent = await requestQwenGuideCards(config, buildPrompt(sourceDocuments, sourceChunks));
    const guideCards = validateGeneratedCards(rawContent, sourceChunks);

    return {
      guideCards,
      generationMeta: generationMeta('qwen_live', config.model, 'Qwen live generation succeeded.'),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Qwen generation failed for an unknown reason.';

    return deterministicFallback(deterministicCards, 'qwen_failed_fallback', config.model, reason);
  }
}
