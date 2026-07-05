# TraceCue Architecture

## P0 flow

```mermaid
flowchart LR
  A[Synthetic sources] --> B[Source chunks]
  B --> C[Deterministic guide cards]
  C --> D[Source Guard]
  C --> E[Risk Guard]
  D --> F[Publish Gate]
  E --> F
  F --> G[ProcedureLedger]
  G --> H[Revision proposal]
```

## Why this is enough for the first demo

The demo must prove that TraceCue is not a generic AI document generator. It must prove that every step has source and governance metadata.

## Later Qwen integration

After the deterministic demo is stable, use Qwen for:

1. procedure graph generation
2. guide card drafting
3. revision proposal drafting

Keep deterministic checks for Source Guard, Risk Guard, Publish Gate, and ProcedureLedger.
