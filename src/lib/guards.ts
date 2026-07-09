import type { GuardedGuideCard, GuideCard, ProcedureLedger, PublishGateStatus, RiskFlag } from './types';

const riskRules: Array<{ type: RiskFlag['type']; severity: RiskFlag['severity']; terms: string[] }> = [
  { type: 'warranty', severity: 'high', terms: ['support window', 'covered', 'bug fixes', 'guarantee', 'warranty'] },
  { type: 'finance', severity: 'high', terms: ['payment', 'refund', 'billing', 'quote'] },
  { type: 'responsibility', severity: 'medium', terms: ['do not', 'requires', 'should', 'must', 'stop using'] },
  { type: 'access', severity: 'high', terms: ['dns', 'plugin', 'dashboard', 'domain'] },
  { type: 'data', severity: 'high', terms: ['client data', 'screenshot', 'browser', 'device', 'serial label', 'customer contact'] },
  { type: 'legal_like', severity: 'high', terms: ['agreement', 'dispute', 'signed'] },
  { type: 'unsupported_claim', severity: 'high', terms: ['sealed electrical', 'motor housing', 'sensor module', 'promise warranty approval'] },
];

export function detectRiskFlags(card: GuideCard): RiskFlag[] {
  const text = [card.title, card.purpose, ...card.instructions, card.completionCheck].join(' ').toLowerCase();

  return riskRules
    .filter((rule) => rule.terms.some((term) => text.includes(term.toLowerCase())))
    .map((rule) => ({
      type: rule.type,
      severity: rule.severity,
      reason: `Matched ${rule.terms.filter((term) => text.includes(term.toLowerCase())).join(', ')}`,
    }));
}

export function resolvePublishGate(card: GuideCard, riskFlags: RiskFlag[]): { status: PublishGateStatus; reason: string } {
  if (card.reviewStatus === 'rejected') {
    return { status: 'blocked', reason: 'Rejected cards cannot be published.' };
  }

  if (card.sourceRefs.length === 0) {
    return { status: 'blocked', reason: 'No source references. Add sources or keep this step out of the published guide.' };
  }

  if (riskFlags.some((flag) => flag.severity === 'high') && card.reviewStatus !== 'approved') {
    return { status: 'needs_review', reason: 'High-risk language requires human approval before publishing.' };
  }

  if (card.reviewStatus !== 'approved' && riskFlags.length > 0) {
    return { status: 'needs_review', reason: 'Risk flags are present and review is not complete.' };
  }

  if (card.reviewStatus !== 'approved') {
    return { status: 'needs_review', reason: 'Card is still pending review.' };
  }

  return { status: 'publishable', reason: 'Grounded, reviewed, and clear to publish.' };
}

export function guardCards(cards: GuideCard[]): GuardedGuideCard[] {
  return cards.map((card) => {
    const riskFlags = detectRiskFlags(card);
    const publishGate = resolvePublishGate(card, riskFlags);

    return {
      ...card,
      riskFlags,
      sourceGuardStatus: card.sourceRefs.length > 0 ? 'grounded' : 'needs_review',
      publishGateStatus: publishGate.status,
      publishGateReason: publishGate.reason,
    };
  });
}

export function buildProcedureLedger(cards: GuardedGuideCard[]): ProcedureLedger {
  const missingSourceStepIds = cards.filter((card) => card.sourceRefs.length === 0).map((card) => card.id);
  const coveredCards = cards.length - missingSourceStepIds.length;
  const sourceCoverage = Math.round((coveredCards / cards.length) * 100);
  const riskFlagCount = cards.reduce((sum, card) => sum + card.riskFlags.length, 0);
  const approvedCount = cards.filter((card) => card.reviewStatus === 'approved').length;
  const needsReviewCount = cards.filter((card) => card.publishGateStatus !== 'publishable').length;

  return {
    guideId: 'equipment-after-sales-qr-guide',
    version: 'v1.0',
    sourceCoverage,
    missingSourceStepIds,
    riskFlagCount,
    reviewSummary: `${approvedCount} approved / ${needsReviewCount} require attention`,
    publishStatus: needsReviewCount === 0 ? 'approved' : 'draft',
    feedbackCount: 1,
    revisionProposal: 'v1.1 should clarify the filter reset confirmation and keep the source reference to the synthetic filter replacement procedure.',
  };
}
