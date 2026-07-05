# TraceCue Agent — Codex Instructions

This repository is a local-first starter for building TraceCue Agent with Codex on macOS.

## Product focus

TraceCue should win attention with two excellent capabilities, not many weak features:

1. ProcedureLedger
2. Publish Gate

Core promise:

> Every generated guide card must either prove where it came from or be blocked / marked for review before publishing.

## Current scope

Build one excellent demo slice:

```text
synthetic source documents
-> source chunks
-> guide cards
-> source guard
-> risk guard
-> ProcedureLedger
-> Publish Gate
-> revision proposal
```

## Do not build yet

- authentication
- billing
- multi-tenant SaaS
- PDF/OCR upload
- multi-scenario template library
- full benchmark UI
- database persistence before the demo slice is visually excellent

## Technical choices

- Use Next.js 16.2.x App Router.
- Use Mantine components instead of hand-building UI primitives.
- Keep TypeScript strict.
- Keep demo data synthetic.
- Keep all code readable enough for a hackathon judge or reviewer to inspect.

## UI direction

Top AI startup feel:

- dark graphite / warm amber tone
- glass panels
- strong hierarchy
- dense but readable dashboard
- clear evidence trail
- no generic SaaS template look

## Validation

Run these before committing meaningful changes:

```bash
pnpm typecheck
pnpm build
```

## Completion report

When Codex finishes a pass, report:

- files changed
- validation commands and results
- visual paths to check
- remaining risks
- next recommended task
