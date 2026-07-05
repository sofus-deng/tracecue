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
- optional Qwen live generation behind deterministic fallback
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
- **Deterministic guide cards:** stable fallback cards for a reliable hackathon walkthrough.
- **Synthetic markdown samples:** public-safe source documents under `samples/`, parsed into source documents and source chunks.
- **Qwen live generation:** optional server-side generation behind `QWEN_LIVE_GENERATION=true`.
- **JSON export:** the dashboard can export `tracecue-ledger-client-handoff-v1.json` with the ProcedureLedger, source trail, guarded cards, generation metadata, and Publish Gate summary.

The current slice intentionally does not include authentication, billing, multi-tenant SaaS behavior, PDF upload, or database persistence.

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

The demo runs deterministically without API credentials. Qwen live generation is opt-in and only runs when `QWEN_LIVE_GENERATION=true`.

For live generation, configure `QWEN_API_KEY` or `DASHSCOPE_API_KEY`, plus `QWEN_BASE_URL` and `QWEN_MODEL` in `.env.local`. Do not commit local environment files.

Generated cards still pass through Source Guard, Risk Guard, ProcedureLedger, and Publish Gate. If Qwen is disabled, unconfigured, unavailable, or returns invalid cards, TraceCue falls back to the deterministic demo cards.

## Alibaba Cloud deployment

See [`docs/alibaba-cloud-deployment.md`](docs/alibaba-cloud-deployment.md) for public-safe deployment notes.

The recommended hackathon path is to run TraceCue as a standard Next.js Node service on Alibaba Cloud, keep deterministic fallback enabled by default, and enable Qwen live generation only when server-side credentials are configured in the deployment runtime.

## Suggested Codex next task

Ask Codex to follow the current priority in `WORK_ITEMS.md`:

```text
Read AGENTS.md, CODEX.md, WORK_ITEMS.md, and README.md before starting.

Complete only the current priority item. Keep additions public-safe and run the requested validation for that item.
```

## Key files

```text
app/layout.tsx
app/page.tsx
src/components/TraceCueDashboard.tsx
src/lib/demo-data.ts
src/lib/guards.ts
src/lib/qwen.ts
src/lib/source-parser.ts
src/lib/source-samples.ts
src/lib/types.ts
samples/
docs/alibaba-cloud-deployment.md
docs/architecture.md
docs/db-postgres18-plan.md
```
