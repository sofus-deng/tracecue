# TraceCue Agent

TraceCue Agent is a focused hackathon starter for **source-grounded, human-reviewed, replayable procedure guides**.

TraceCue Agent is a source-grounded procedure guide autopilot for small teams. It helps turn source notes, support policies, checklists, and meeting excerpts into guide cards that can be reviewed before publishing.

This starter is optimized for fast local development on macOS with Codex:

- Next.js `16.2.10`
- App Router
- TypeScript
- Mantine component framework
- deterministic demo data
- ProcedureLedger panel
- Publish Gate states
- no database required for the first vertical slice

## Why this starter avoids a database at P0

TraceCue's first winning demo should prove the workflow, not database plumbing:

```text
synthetic sources -> guide cards -> source guard -> risk guard -> ProcedureLedger -> Publish Gate -> revision proposal
```

PostgreSQL 18 can be added after this slice works. A DB is useful for persistence, accounts, real upload history, or multi-guide versioning, but it is not required to record the first 2-3 minute demo.

## Demo data and public repo boundary

This repository is public and open source for a hackathon submission. Everything included here should be safe for external judges, developers, and reviewers to inspect.

All sample documents in `samples/` are synthetic. They are designed to simulate a small client handoff scenario without using real customer material.

This repository does **not** include real customer data, private WorkCue strategy, private prompts, internal planning material, pricing, sales playbooks, customer documents, or private roadmap content.

High-level product language, public-safe architecture notes, synthetic sample data, and demo implementation code are allowed. Internal WorkCue planning and private product strategy are intentionally kept outside this repository.

## What this demo proves

- **Source trail:** each guide card can point back to the source chunks that support it.
- **ProcedureLedger:** the demo records source coverage, guard results, publish status, and a revision proposal in one replayable ledger object.
- **Publish Gate:** guide cards can be marked as publishable, review-required, or blocked before publishing.
- **Review-required and blocked states:** risky or unsupported guidance is made visible instead of silently published.

## Current demo scope

- **Client Handoff Guide:** one focused procedure scenario for a small-team client handoff.
- **Deterministic guide cards:** stable generated cards for a reliable hackathon walkthrough.
- **Synthetic markdown samples:** public-safe source documents under `samples/`, parsed into source documents and source chunks.
- **JSON export:** the dashboard can export `tracecue-ledger-client-handoff-v1.json` with the ProcedureLedger, source trail, guarded cards, and Publish Gate summary.

The current slice intentionally does not include authentication, billing, multi-tenant SaaS behavior, PDF upload, Qwen integration, or database persistence.

## Install

```bash
corepack enable
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Runtime config

```bash
cp runtime.example .env.local
```

The current starter uses deterministic data first so the demo always runs. Add Qwen calls after the UI and guardrail flow are stable.

## Suggested Codex next task

Ask Codex to keep the existing design direction and add Qwen integration only behind the deterministic fallback:

```text
Read AGENTS.md, CODEX.md, WORK_ITEMS.md, README.md, src/lib/types.ts, src/lib/demo-data.ts, src/lib/guards.ts, src/lib/source-parser.ts, src/lib/source-samples.ts, and src/components/TraceCueDashboard.tsx.

Keep the existing Mantine-based dark graphite / warm amber dashboard direction.

Implement the next vertical slice:
1. Add Qwen integration behind the deterministic fallback.
2. Keep the current synthetic markdown samples and parser working.
3. Keep deterministic guide cards available for reliable demo playback.
4. Do not add a database, authentication, billing, or multi-tenant behavior.
5. Run pnpm typecheck and pnpm build.
```

## Key files

```text
app/layout.tsx
app/page.tsx
src/components/TraceCueDashboard.tsx
src/lib/demo-data.ts
src/lib/guards.ts
src/lib/source-parser.ts
src/lib/source-samples.ts
src/lib/types.ts
samples/
docs/architecture.md
docs/db-postgres18-plan.md
```
