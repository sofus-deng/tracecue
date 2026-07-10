# TraceCue submission proof checklist

## Purpose

This document tracks the public-safe evidence needed for Devpost and demo recording:

- Qwen live proof
- export proof
- source traceability proof
- Publish Gate proof
- QR Preview proof
- public-safety checks

## Safety rules

- Do not show `.env.local`.
- Do not show API keys.
- Do not show cloud account IDs.
- Do not show private browser tabs.
- Do not show real customer data.
- Do not show private WorkCue strategy.
- Do not show engine-vault material.
- Do not show private prompts or internal prompt chains.
- Use synthetic equipment after-sales samples only.
- Inspect exported files before recording or uploading them.

## Environment record

- Local or deployed URL:
- Date captured:
- Browser:
- Viewport:
- Qwen live tested: yes/no
- Qwen model shown:
- Generation mode shown:
- Export artifacts inspected: yes/no
- Secrets check passed: yes/no

## Required evidence checklist

- [ ] Initial page load shows deterministic standby.
- [ ] No automatic Qwen call on passive page load.
- [ ] Run Qwen pass button visible.
- [ ] Run Qwen pass clicked only as explicit user action.
- [ ] `qwen_live` shown if safely configured.
- [ ] Model metadata shown if safely configured.
- [ ] `qwen_quota_paused` or Free quota exhausted captured only if naturally reproducible.
- [ ] Guide cards show `sourceRefs` from equipment after-sales samples.
- [ ] Source Guard visible.
- [ ] Risk Guard visible.
- [ ] Human review actions visible.
- [ ] Approval cannot bypass missing source evidence or high-severity risk.
- [ ] Publish Gate shows publishable, needs review, and blocked categories.
- [ ] QR Preview shows allowed cards.
- [ ] QR Preview withholds blocked or review-only cards.
- [ ] ProcedureLedger proof trail visible.
- [ ] Ledger JSON exported.
- [ ] Guide Markdown exported.
- [ ] Exported JSON inspected for expected fields and no secrets.
- [ ] Exported Markdown inspected for source references, withheld-card notes, generation metadata, and no secrets.
- [ ] Architecture diagram available.
- [ ] Demo video script available.
- [ ] Devpost submission copy available.

## Screenshot and recording shot list

- [ ] Desktop deterministic standby page.
- [ ] Desktop Run Qwen pass result.
- [ ] `qwen_live` and model metadata, only if safely configured.
- [ ] `qwen_quota_paused` / Free quota exhausted, only if naturally reproducible.
- [ ] Guide cards with source references.
- [ ] Source Guard and Risk Guard badges.
- [ ] Human review actions.
- [ ] Publish Gate.
- [ ] QR Preview.
- [ ] ProcedureLedger.
- [ ] Export ledger action.
- [ ] Export guide Markdown action.
- [ ] Opened ledger JSON proof after local inspection.
- [ ] Opened guide Markdown proof after local inspection.
- [ ] Architecture diagram.
- [ ] Public repo README.
- [ ] Deployment proof, if public-safe.

## Export artifact inspection checklist

### Ledger JSON

Verify the ledger JSON includes:

- [ ] `generatedAt`.
- [ ] `generationMeta`.
- [ ] `procedureLedger`.
- [ ] `sourceDocuments`.
- [ ] `sourceChunks`.
- [ ] `guardedGuideCards`.
- [ ] `publishGateSummary`.
- [ ] Review session or review decisions if available.
- [ ] Feedback or revision proposal if available.
- [ ] No secrets.
- [ ] No API keys.
- [ ] No `.env.local`.
- [ ] No real customer data.

### Guide Markdown

Verify the guide Markdown includes:

- [ ] Generation mode.
- [ ] Model metadata if available.
- [ ] Publish gate summary.
- [ ] Publishable guide cards.
- [ ] Source references.
- [ ] Withheld cards or withheld-card notes if present.
- [ ] Review decisions if present.
- [ ] No secrets.
- [ ] No API keys.
- [ ] No `.env.local`.
- [ ] No real customer data.

## Manual capture log

| Evidence item | Status | File name or location | Notes | Safe to upload yes/no |
|---|---|---|---|---|
| Deterministic standby page load | pending | `tracecue-01-deterministic-standby.png` | Capture before any explicit Qwen action. | no |
| Run Qwen pass result | pending | `tracecue-02-run-qwen-pass-qwen-live.png` | Capture `qwen_live` only if safely configured; otherwise record fallback or unavailable state honestly. | no |
| Free quota exhausted state | pending | optional screenshot | Capture only if naturally reproducible as `qwen_quota_paused` / Free quota exhausted. | no |
| Guide cards with source refs | pending | `tracecue-03-guide-cards-source-refs.png` | Show equipment after-sales source references. | no |
| Source Guard and Risk Guard | pending | screenshot or recording segment | Show guard badges and any risk flags. | no |
| Human review actions | pending | screenshot or recording segment | Show approved, needs expert review, and blocked controls. | no |
| Publish Gate | pending | `tracecue-04-publish-gate.png` | Show publishable, needs review, and blocked categories. | no |
| QR Preview | pending | `tracecue-05-qr-preview.png` | Show allowed cards and withheld notice. | no |
| ProcedureLedger | pending | `tracecue-06-procedure-ledger.png` | Show generation state, source snapshot, guard results, review state, publish state, and revision target. | no |
| Ledger JSON export | pending | `tracecue-07-ledger-json-export.json` | Inspect locally before upload. | no |
| Guide Markdown export | pending | `tracecue-08-guide-markdown-export.md` | Inspect locally before upload. | no |
| Architecture diagram | pending | `tracecue-09-architecture-diagram.png` | Capture from public-safe diagram asset. | no |
| README proof | pending | public repository URL or screenshot | Confirm public-safe repository overview. | no |
| Deployment proof | pending | public-safe URL or screenshot | Include only if no private cloud identifiers or secrets are visible. | no |

## Completion decision

NT016 can be marked done only when Qwen live proof, export proof, and visual proof are captured or explicitly documented as unavailable with safe fallback evidence.

If Qwen live proof is unavailable due to credentials or quota, do not fake it.

If Qwen live proof is unavailable but deterministic standby, `qwen_quota_paused`, exports, and full pipeline proof are documented, record that limitation clearly.

## Public-safe file naming suggestions

- `tracecue-01-deterministic-standby.png`
- `tracecue-02-run-qwen-pass-qwen-live.png`
- `tracecue-03-guide-cards-source-refs.png`
- `tracecue-04-publish-gate.png`
- `tracecue-05-qr-preview.png`
- `tracecue-06-procedure-ledger.png`
- `tracecue-07-ledger-json-export.json`
- `tracecue-08-guide-markdown-export.md`
- `tracecue-09-architecture-diagram.png`
