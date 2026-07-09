# TraceCue Agent — Codex Instructions

This repository is the public WorkCue Open implementation of TraceCue Agent.

Use these instructions for every coding pass in this repository.

## Product Direction

New TraceCue is not the old Client Handoff demo.

New TraceCue is a public, synthetic, source-grounded work-instruction agent for equipment after-sales and frontline procedure guidance.

Primary scenario:

```text
Equipment after-sales QR guide
```

Core product promise:

> TraceCue turns messy operational source material into reviewable guide cards, proves where each instruction came from, and blocks unsupported or risky steps before a QR guide reaches a frontline user.

## Relationship To WorkCue

- WorkCue is the commercial product line.
- TraceCue is the public WorkCue Open / Qwen Cloud reference implementation.
- Do not expose internal WorkCue strategy, pricing, sales notes, customer lists, customer materials, private prompts, or engine-vault content in this repository.
- All repo content must remain synthetic, generic, and safe for public review.

## Current Build Target

Build a polished new TraceCue slice around:

```text
synthetic after-sales source pack
-> source chunks
-> Qwen guide generation
-> source guard
-> risk guard
-> human review state
-> QR guide preview
-> ProcedureLedger
-> Publish Gate
-> exportable proof
```

The old Client Handoff content can remain only as legacy reference until replaced. Do not make it the main product narrative for new work.

## Qwen Runtime Rules

- Qwen live generation must only run from an explicit user action such as `Run Qwen pass`.
- Do not auto-call Qwen on page load.
- Preserve the model-chain quota strategy.
- If free quota is exhausted, show a paused state instead of silently pretending generation succeeded.
- Deterministic fallback is allowed as a safety path, but UI and exports must clearly state when fallback was used.
- Never commit `.env.local` or API keys.

## UI Direction

TraceCue should not look like a generic AI SaaS landing page.

Design target:

- evidence console
- source ledger
- QR guide workbench
- professional but distinctive
- readable under demo pressure
- strong visual hierarchy without decorative AI gradients
- clear proof trail from source to publish decision

Avoid:

- generic purple AI gradients
- vague chat UI
- decorative prompt boxes
- marketing-only hero sections
- dark glassmorphism that hides the actual product

## Work Items

Read `WORK_ITEMS.md` before starting each coding pass.

Update `WORK_ITEMS.md` when starting or completing a meaningful task.

Use these status values:

- `todo`
- `in_progress`
- `done`
- `blocked`

Work on only the current priority item unless the user explicitly asks for a broader pass.

## Technical Choices

- Use Next.js App Router.
- Use Mantine components and existing project patterns.
- Keep TypeScript strict.
- Keep demo data synthetic.
- Keep the app inspectable for public reviewers.
- Keep edits scoped; do not introduce auth, billing, database persistence, or multi-tenant SaaS behavior unless explicitly requested.

## Validation

For UI, TypeScript, or runtime changes, run:

```bash
pnpm typecheck
pnpm build
pnpm lint
```

If one command fails, fix the failure before continuing to unrelated work.

For Qwen runtime changes, also verify:

- page load does not call Qwen automatically
- manual run can reach `qwen_live` when quota and config are valid
- quota exhaustion reaches `qwen_quota_paused`
- exported ledger records the generation mode and model

## Completion Report

When a coding pass finishes, report:

- files changed
- validation commands and results
- visual paths to check
- remaining risks
- next recommended task
