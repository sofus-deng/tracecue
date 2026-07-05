import { TraceCueDashboard } from '@/src/components/TraceCueDashboard';
import { baseGuideCards, sourceChunks, sourceDocuments } from '@/src/lib/demo-data';
import { buildProcedureLedger, guardCards } from '@/src/lib/guards';
import { resolveGuideCardsWithFallback } from '@/src/lib/qwen';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { guideCards, generationMeta } = await resolveGuideCardsWithFallback({
    deterministicCards: baseGuideCards,
    sourceDocuments,
    sourceChunks,
  });
  const guardedCards = guardCards(guideCards);
  const ledger = buildProcedureLedger(guardedCards);

  return (
    <TraceCueDashboard
      generationMeta={generationMeta}
      guardedCards={guardedCards}
      ledger={ledger}
      sourceChunks={sourceChunks}
      sourceDocuments={sourceDocuments}
    />
  );
}
