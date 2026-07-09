import type { GuardedGuideCard, GuideGenerationMeta, ProcedureLedger, SourceChunk, SourceDocument } from './types';

export type GuideExportReviewDecision = {
  action: string;
  label: string;
  reason: string;
  decidedAt: string;
  sessionOnly: true;
};

export type BuildGuideMarkdownInput = {
  exportedAt: string;
  generationMeta: GuideGenerationMeta;
  guardedCards: GuardedGuideCard[];
  ledger: ProcedureLedger;
  reviewDecisions: Record<string, GuideExportReviewDecision>;
  sourceChunks: SourceChunk[];
  sourceDocuments: SourceDocument[];
};

function escapeMarkdown(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('|', '\\|');
}

function formatStatus(value: string): string {
  return value.replaceAll('_', ' ');
}

function bulletList(items: string[], empty = 'None recorded.'): string[] {
  if (items.length === 0) {
    return [`- ${empty}`];
  }

  return items.map((item) => `- ${item}`);
}

function sourceProofLines(card: GuardedGuideCard, sourceChunks: SourceChunk[], sourceDocuments: SourceDocument[]): string[] {
  if (card.sourceRefs.length === 0) {
    return ['- No source references attached.'];
  }

  return card.sourceRefs.map((ref) => {
    const chunk = sourceChunks.find((candidate) => candidate.id === ref);
    const document = chunk ? sourceDocuments.find((candidate) => candidate.id === chunk.documentId) : undefined;

    if (!chunk) {
      return `- ${ref}: source chunk not found in current source snapshot.`;
    }

    return `- ${ref}: ${chunk.label} from ${document?.title ?? chunk.documentId} — ${chunk.text}`;
  });
}

function cardRiskSummary(card: GuardedGuideCard): string {
  if (card.riskFlags.length === 0) {
    return 'No risk flags.';
  }

  return card.riskFlags.map((flag) => `${flag.severity} ${flag.type}: ${flag.reason}`).join('; ');
}

function reviewDecisionLines(reviewDecisions: Record<string, GuideExportReviewDecision>): string[] {
  const entries = Object.entries(reviewDecisions);

  if (entries.length === 0) {
    return ['- No demo-local review decisions recorded in this browser session.'];
  }

  return entries.map(
    ([cardId, decision]) =>
      `- ${cardId}: ${decision.label} at ${decision.decidedAt}; sessionOnly=${String(decision.sessionOnly)}; reason: ${decision.reason}`,
  );
}

export function buildGuideMarkdown({
  exportedAt,
  generationMeta,
  guardedCards,
  ledger,
  reviewDecisions,
  sourceChunks,
  sourceDocuments,
}: BuildGuideMarkdownInput): string {
  const publishable = guardedCards.filter((card) => card.publishGateStatus === 'publishable');
  const needsReview = guardedCards.filter((card) => card.publishGateStatus === 'needs_review');
  const blocked = guardedCards.filter((card) => card.publishGateStatus === 'blocked');
  const withheld = [...needsReview, ...blocked];

  const lines: string[] = [
    '# TraceCue Equipment After-sales QR Guide',
    '',
    '## Artifact metadata',
    '',
    `- Guide ID: ${ledger.guideId}`,
    `- Version: ${ledger.version}`,
    `- Exported timestamp: ${exportedAt}`,
    `- Publish status: ${ledger.publishStatus}`,
    `- Generation mode: ${generationMeta.mode}`,
    `- Model: ${generationMeta.model}`,
    `- Generation reason: ${generationMeta.reason}`,
    '',
    '## Safety notice',
    '',
    'Only publishable cards are actionable frontline steps. Withheld cards are review-only and are not approved QR instructions. Needs-review and blocked cards appear only in the appendix below.',
    '',
    '## Publish summary',
    '',
    `- Publishable count: ${publishable.length}`,
    `- Needs-review count: ${needsReview.length}`,
    `- Blocked count: ${blocked.length}`,
    `- Source coverage: ${ledger.sourceCoverage}%`,
    `- Risk flag count: ${ledger.riskFlagCount}`,
    `- Review summary: ${ledger.reviewSummary}`,
    `- Revision proposal: ${ledger.revisionProposal}`,
    '',
    '## Frontline guide steps',
    '',
  ];

  if (publishable.length === 0) {
    lines.push('No publishable steps are currently cleared for the frontline QR guide.', '');
  } else {
    publishable.forEach((card) => {
      lines.push(
        `### Step ${card.order}: ${card.title}`,
        '',
        `- Purpose: ${card.purpose}`,
        '- Instructions:',
        ...card.instructions.map((instruction, index) => `  ${index + 1}. ${instruction}`),
        `- Completion check: ${card.completionCheck}`,
        `- Source refs: ${card.sourceRefs.join(', ')}`,
        `- Review status: ${formatStatus(card.reviewStatus)}`,
        `- Publish gate reason: ${card.publishGateReason}`,
        '',
        '#### Source and proof',
        '',
        ...sourceProofLines(card, sourceChunks, sourceDocuments),
        `- Source Guard: ${formatStatus(card.sourceGuardStatus)}`,
        `- Risk Guard: ${cardRiskSummary(card)}`,
        '',
      );
    });
  }

  lines.push('## Completion checks summary', '', ...bulletList(publishable.map((card) => `${card.id}: ${card.completionCheck}`)), '');

  lines.push(
    '## Demo-local review session notes',
    '',
    '- Scope: demo_local_browser_session',
    '- persistentStorage: false',
    '- Decisions keyed by card ID:',
    ...reviewDecisionLines(reviewDecisions).map((line) => `  ${line}`),
    '- Safety policy: approvals do not override Source Guard, high-severity Risk Guard, or explicit blocked decisions.',
    '',
    '## ProcedureLedger summary',
    '',
    `- Guide ID: ${ledger.guideId}`,
    `- Version: ${ledger.version}`,
    `- Source coverage: ${ledger.sourceCoverage}%`,
    `- Missing source step IDs: ${ledger.missingSourceStepIds.length > 0 ? ledger.missingSourceStepIds.join(', ') : 'none'}`,
    `- Risk flag count: ${ledger.riskFlagCount}`,
    `- Review summary: ${ledger.reviewSummary}`,
    `- Publish status: ${ledger.publishStatus}`,
    `- Feedback count: ${ledger.feedbackCount}`,
    `- Revision proposal: ${ledger.revisionProposal}`,
    '',
    '## Review and blocked appendix - not frontline instructions',
    '',
    'The following cards are withheld from the QR guide. They are customer-reviewable proof records only, not actionable frontline instructions.',
    '',
  );

  if (withheld.length === 0) {
    lines.push('No needs-review or blocked cards are currently withheld.', '');
  } else {
    withheld.forEach((card) => {
      lines.push(
        `### Withheld card ${card.order}: ${card.title}`,
        '',
        `- Card ID: ${card.id}`,
        `- Status: ${formatStatus(card.publishGateStatus)}`,
        `- Purpose: ${card.purpose}`,
        `- Instruction summary for review only: ${card.instructions.join(' / ')}`,
        `- Completion check under review: ${card.completionCheck}`,
        `- Source refs: ${card.sourceRefs.length > 0 ? card.sourceRefs.join(', ') : 'none'}`,
        `- Review status: ${formatStatus(card.reviewStatus)}`,
        `- Source Guard: ${formatStatus(card.sourceGuardStatus)}`,
        `- Risk Guard: ${cardRiskSummary(card)}`,
        `- Publish gate reason: ${card.publishGateReason}`,
        '- Source/proof notes:',
        ...sourceProofLines(card, sourceChunks, sourceDocuments).map((line) => `  ${line}`),
        '',
      );
    });
  }

  lines.push('## Source snapshot', '', '| Source chunk | Document | Proof text |', '|---|---|---|');

  sourceChunks.forEach((chunk) => {
    const document = sourceDocuments.find((candidate) => candidate.id === chunk.documentId);
    lines.push(`| ${escapeMarkdown(chunk.id)} | ${escapeMarkdown(document?.title ?? chunk.documentId)} | ${escapeMarkdown(chunk.text)} |`);
  });

  lines.push('');

  return `${lines.join('\n')}\n`;
}
