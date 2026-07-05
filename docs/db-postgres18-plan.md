# PostgreSQL 18 Plan

PostgreSQL is not required for the first demo slice.

Add it only when you need persistence for:

- multiple guides
- saved review decisions
- revision history
- user uploads
- evaluator runs
- accounts or team workspaces

## Suggested later stack

- Drizzle ORM
- PostgreSQL 18
- migrations in `drizzle/`
- tables: `source_documents`, `source_chunks`, `guide_cards`, `procedure_ledgers`, `feedback_items`, `revision_proposals`

## Do not add before the vertical slice works

Adding a database too early will slow down the hackathon demo. ProcedureLedger can start as an in-memory JSON object and later become a persisted table.
