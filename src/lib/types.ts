export type SourceDocument = {
  id: string;
  title: string;
  kind: 'handoff' | 'faq' | 'checklist' | 'transcript' | 'policy';
  excerpt: string;
};

export type SourceChunk = {
  id: string;
  documentId: string;
  label: string;
  text: string;
};

export type RiskFlagType = 'warranty' | 'finance' | 'responsibility' | 'access' | 'data' | 'legal_like' | 'unsupported_claim';

export type RiskFlag = {
  type: RiskFlagType;
  severity: 'low' | 'medium' | 'high';
  reason: string;
};

export type ReviewStatus = 'pending' | 'approved' | 'edited' | 'rejected';
export type PublishGateStatus = 'publishable' | 'needs_review' | 'blocked';

export type GuideCard = {
  id: string;
  order: number;
  title: string;
  purpose: string;
  instructions: string[];
  completionCheck: string;
  sourceRefs: string[];
  reviewStatus: ReviewStatus;
};

export type GuideGenerationMode =
  | 'deterministic_fallback'
  | 'qwen_live'
  | 'qwen_unconfigured_fallback'
  | 'qwen_failed_fallback'
  | 'qwen_quota_paused';

export type GuideGenerationMeta = {
  mode: GuideGenerationMode;
  model: string;
  reason: string;
  generatedAt: string;
};

export type GuardedGuideCard = GuideCard & {
  riskFlags: RiskFlag[];
  sourceGuardStatus: 'grounded' | 'needs_review';
  publishGateStatus: PublishGateStatus;
  publishGateReason: string;
};

export type ProcedureLedger = {
  guideId: string;
  version: string;
  sourceCoverage: number;
  missingSourceStepIds: string[];
  riskFlagCount: number;
  reviewSummary: string;
  publishStatus: 'draft' | 'approved' | 'published' | 'deprecated';
  feedbackCount: number;
  revisionProposal: string;
};