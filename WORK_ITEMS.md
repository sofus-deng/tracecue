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
| NT003 | done | P0 | Replace Client Handoff as primary scenario | App copy, demo name, source pack, and exports use equipment after-sales QR guide as the main scenario |
| NT004 | done | P0 | Create synthetic equipment after-sales source pack | Source documents cover maintenance, filter replacement, fault triage, support escalation, safety limits, and warranty boundaries |
| NT005 | done | P0 | Update Qwen prompt for after-sales guide cards | Manual Qwen run generates concise, source-grounded equipment guide cards with valid source refs |
| NT006 | done | P0 | Add QR guide preview | UI shows a mobile-style guide preview that could be reached from a QR code |
| NT007 | done | P0 | Add explicit review actions | Cards support approved, needs expert review, and blocked states in the UI |
| NT008 | done | P1 | Add exportable guide artifact | Export Markdown or HTML guide in addition to ProcedureLedger JSON |
| NT009 | done | P1 | Improve quota-state messaging | UI clearly distinguishes Qwen live, fallback, unconfigured, failed, and quota paused states |
| NT010 | done | P1 | Add visual QA checklist | README or docs include desktop/mobile screenshots to capture before submission |
| NT011 | done | P1 | Update public README for new TraceCue | README explains WorkCue Open, new after-sales scenario, Qwen model chain, cost guard, and deployment proof |
| NT012 | done | P1 | Final new TraceCue validation | `pnpm typecheck`, `pnpm build`, `pnpm lint`, browser check, export check, Qwen manual-run check |
| NT013 | done | P0 | Refresh demo video script | Demo video script presents TraceCue as the public WorkCue Open competition edition and focuses on Qwen generation, source traceability, human review, Publish Gate, ProcedureLedger, QR Preview, and exports in under 3 minutes |
| NT014 | done | P0 | Prepare Devpost submission copy | Devpost text explains the Track 4 fit, Qwen Cloud usage, technical architecture, problem value, impact, deployment proof, and public-safe WorkCue relationship |
| NT015 | done | P0 | Create architecture diagram asset | Submission includes a clear architecture diagram showing frontend, Next.js backend, Qwen Cloud API, Source Guard, Risk Guard, ProcedureLedger, Publish Gate, QR Preview, and exports |
| NT016 | in_progress | P0 | Capture Qwen live proof and export proof | Submission evidence includes Run Qwen pass, qwen_live/model metadata when safely configured, source refs, Publish Gate, QR Preview, ledger JSON export, and Markdown guide export |
| NT016A | todo | P0 | Simplify customer-facing UX and information hierarchy | Default workspace is task-first for SMB operators: Overview shows status and next action; Review uses a focused queue or master-detail layout; Publish Gate stays inspectable; Customer Guide presents the QR/mobile outcome; Sources, ProcedureLedger, generation metadata, and exports move into Evidence; standby never implies a live model was used; export copy explicitly identifies JSON/evidence ledger; desktop and mobile visual QA pass without changing Qwen runtime, guard, or export semantics |
| NT017 | todo | P0 | Final submission package review | Final review confirms public repo, OSI license, working deployment, video link, architecture diagram, Devpost copy, eligibility, and no secrets |

## Current Priority

NT001 through NT015 are complete. NT016 evidence preparation is in progress, but final capture should pause until the customer-facing information hierarchy is simplified.

Recommended next coding task:

```text
Implement NT016A: make the default workspace task-first for SMB operators, move technical detail into an Evidence tab, clarify standby and export wording, and complete desktop/mobile visual QA before resuming NT016 evidence capture.
```

Recommended sequence:

```text
NT016 preparation
-> NT016A customer-first UX refinement
-> resume and complete NT016 evidence capture
-> NT017 final submission review
```

## Automation Tasks

| ID | Status | Priority | Work Item | Exit Criteria |
|---|---|---:|---|---|
| AUTO001 | done | P0 | Add local check script | `scripts/check.sh` runs typecheck, build, and lint; `pnpm check` uses the same validation order |
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
