import { TraceCueDashboard } from '@/src/components/TraceCueDashboard';
import { baseGuideCards, sourceChunks, sourceDocuments } from '@/src/lib/demo-data';
import { buildProcedureLedger, guardCards } from '@/src/lib/guards';

export default function Page() {
  const guardedCards = guardCards(baseGuideCards);
  const ledger = buildProcedureLedger(guardedCards);

  return (
    <TraceCueDashboard
      guardedCards={guardedCards}
      ledger={ledger}
      sourceChunks={sourceChunks}
      sourceDocuments={sourceDocuments}
    />
  );
}
