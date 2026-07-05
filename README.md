# TraceCue Agent

TraceCue Agent is a focused hackathon starter for **source-grounded, human-reviewed, replayable procedure guides**.

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

## Suggested Codex first task

Ask Codex to keep the existing design direction and implement real source parsing plus JSON export:

```text
Read AGENTS.md, README.md, src/lib/types.ts, src/lib/demo-data.ts, src/lib/guards.ts, and src/components/TraceCueDashboard.tsx.

Keep the existing Mantine-based visual direction.

Implement the next vertical slice:
1. Move source documents into markdown files under samples/.
2. Add a parser that converts those markdown files into SourceDocument and SourceChunk records.
3. Keep deterministic fallback guide cards.
4. Add a Download Ledger JSON button that exports the ProcedureLedger and guarded cards.
5. Run pnpm typecheck and pnpm build.
```

## Key files

```text
app/layout.tsx
app/page.tsx
src/components/TraceCueDashboard.tsx
src/lib/demo-data.ts
src/lib/guards.ts
src/lib/types.ts
docs/architecture.md
docs/db-postgres18-plan.md
```
