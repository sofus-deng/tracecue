import { NextResponse } from 'next/server';

import { baseGuideCards, sourceChunks, sourceDocuments } from '@/src/lib/demo-data';
import { buildProcedureLedger, guardCards } from '@/src/lib/guards';
import { resolveGuideCardsWithFallback } from '@/src/lib/qwen';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { guideCards, generationMeta } = await resolveGuideCardsWithFallback({
    deterministicCards: baseGuideCards,
    sourceDocuments,
    sourceChunks,
    allowLiveGeneration: true,
  });
  const guardedCards = guardCards(guideCards);
  const ledger = buildProcedureLedger(guardedCards);

  return NextResponse.json(
    {
      generationMeta,
      guardedCards,
      ledger,
      sourceChunks,
      sourceDocuments,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
