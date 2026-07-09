# TraceCue Work Items

This file is the shared progress board for the new TraceCue build.

Read this before starting each coding pass. Update it when starting or completing a meaningful task.

## Current Product Direction

New TraceCue is the public WorkCue Open / Qwen Cloud reference implementation.

Primary scenario:

```text
Equipment after-sales QR guide
```

Core promise:

> Generate reviewable work instructions from synthetic source material, prove where every instruction came from, and block unsupported or risky steps before publishing a QR guide.

## Status Legend

| Status | Meaning |
|---|---|
| todo | Not started |
| in_progress | Actively being worked on |
| done | Implemented and checked |
| blocked | Requires a decision, credential, external service, or human review |

## New TraceCue Build Plan

| ID | Status | Priority | Work Item | Exit Criteria |
|---|---|---:|---|---|
| NT001 | done | P0 | Align repo instructions with new TraceCue direction | `AGENTS.md` defines new TraceCue, Qwen runtime rules, validation, and UI direction |
| NT002 | done | P0 | Add shared work item board | `WORK_ITEMS.md` tracks new TraceCue tasks and current priority |
| NT003 | todo | P0 | Replace Client Handoff as primary scenario | App copy, demo name, source pack, and exports use equipment after-sales QR guide as the main scenario |
| NT004 | todo | P0 | Create synthetic equipment after-sales source pack | Source documents cover maintenance, filter replacement, fault triage, support escalation, safety limits, and warranty boundaries |
| NT005 | todo | P0 | Update Qwen prompt for after-sales guide cards | Manual Qwen run generates concise, source-grounded equipment guide cards with valid source refs |
| NT006 | todo | P0 | Add QR guide preview | UI shows a mobile-style guide preview that could be reached from a QR code |
| NT007 | todo | P0 | Add explicit review actions | Cards support approved, needs expert review, and blocked states in the UI |
| NT008 | todo | P1 | Add exportable guide artifact | Export Markdown or HTML guide in addition to ProcedureLedger JSON |
| NT009 | todo | P1 | Improve quota-state messaging | UI clearly distinguishes Qwen live, fallback, unconfigured, failed, and quota paused states |
| NT010 | todo | P1 | Add visual QA checklist | README or docs include desktop/mobile screenshots to capture before submission |
| NT011 | todo | P1 | Update public README for new TraceCue | README explains WorkCue Open, new after-sales scenario, Qwen model chain, cost guard, and deployment proof |
| NT012 | todo | P1 | Final new TraceCue validation | `pnpm typecheck`, `pnpm build`, `pnpm lint`, browser check, export check, Qwen manual-run check |

## Current Priority

Start with `NT003` and `NT004` together only if the user asks for an implementation pass.

Recommended next coding task:

```text
Replace the old Client Handoff scenario with a synthetic Equipment After-sales QR Guide scenario, including source documents, chunks, demo copy, and export names.
```

## Automation Tasks

| ID | Status | Priority | Work Item | Exit Criteria |
|---|---|---:|---|---|
| AUTO001 | todo | P0 | Add local check script | `scripts/check.sh` runs typecheck, build, and lint |
| AUTO002 | todo | P1 | Add ECS deploy helper | Optional script documents pull, install, check, build, restart, and status commands |
| AUTO003 | todo | P1 | Add GitHub Actions CI | Pull requests run typecheck, build, and lint before merge |

## Archived Demo Baseline

These items were completed for the original hackathon demo and should be treated as baseline, not the active product direction.

| ID | Status | Task | Check |
|---|---|---|---|
| T001 | done | Fix current Mantine and TypeScript errors | `pnpm typecheck`, `pnpm build` |
| T002 | done | Make Export ledger JSON download the current ledger and guarded cards | `pnpm typecheck`, `pnpm build`, browser check |
| T003 | done | Add synthetic markdown sample files under samples | `pnpm typecheck`, manual review |
| T004 | done | Add parser from sample markdown to source documents and source chunks | `pnpm typecheck`, browser check |
| T005 | done | Add README section for demo data and open-source boundary | manual review |
| T006 | done | Add Qwen integration behind deterministic fallback | `pnpm typecheck`, `pnpm build` |
| T007 | done | Add Alibaba Cloud deployment notes | manual review |
| T008 | done | Add demo video script and screenshot checklist | manual review |
| T009 | done | Polish Devpost-ready README | manual review |
| T010 | done | Final validation before first submission pass | `pnpm typecheck`, `pnpm build`, browser recording check |
