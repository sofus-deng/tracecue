# Alibaba Cloud deployment notes

TraceCue Agent is a focused hackathon demo slice. These notes describe a public-safe Alibaba Cloud deployment path without adding database persistence, authentication, billing, customer data, or private WorkCue planning material.

## Deployment goal

Run the current Next.js app as a standard Node.js web service on Alibaba Cloud so reviewers can open the dashboard, inspect the source-grounded guide workflow, and optionally test Qwen live generation.

The demo should remain usable even without model credentials:

```text
synthetic markdown samples -> deterministic fallback guide cards -> Source Guard -> Risk Guard -> ProcedureLedger -> Publish Gate -> JSON export
```

Qwen live generation is optional and must stay behind `QWEN_LIVE_GENERATION=true`.

## Recommended hackathon path

For the public hackathon submission, use the simplest reliable runtime that can run a Next.js Node server:

1. Build the app with pnpm.
2. Start the Next.js production server.
3. Configure environment variables in the Alibaba Cloud runtime console.
4. Keep `QWEN_LIVE_GENERATION=false` unless a server-side Qwen API key is configured.

A containerized Node.js runtime or a small ECS instance is enough for this demo. Function Compute or a more managed container platform can be evaluated later, but T007 does not add platform-specific infrastructure-as-code.

## Required runtime behavior

The deployed app must support:

- Server-side rendering for the homepage.
- Outbound HTTPS calls to Alibaba Cloud Model Studio / DashScope only when Qwen live generation is enabled.
- Static access to the synthetic markdown samples bundled in the repo.
- JSON export from the browser.
- No database dependency.

## Build commands

Use the same validation path as local development:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

Production start command:

```bash
pnpm start
```

The app uses the Next.js default port unless the hosting runtime provides a `PORT` environment variable.

## Environment variables

Configure these in the Alibaba Cloud runtime environment, not in source control:

```env
QWEN_API_KEY=
DASHSCOPE_API_KEY=
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
QWEN_LIVE_GENERATION=false
NEXT_PUBLIC_APP_NAME=TraceCue Agent
```

Rules:

- Prefer `QWEN_API_KEY` for TraceCue-specific configuration.
- `DASHSCOPE_API_KEY` is supported as a compatibility fallback.
- Do not expose model credentials through `NEXT_PUBLIC_*` variables.
- Do not commit `.env.local` or any deployment secret.
- Keep `QWEN_LIVE_GENERATION=false` for a stable recorded demo unless live model credentials are available.

## Qwen endpoint notes

TraceCue uses an OpenAI-compatible chat completion request and appends `/chat/completions` to `QWEN_BASE_URL`.

The default base URL remains:

```text
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

If the deployment uses a workspace-specific Model Studio endpoint, set `QWEN_BASE_URL` in the runtime environment instead of changing source code.

## Deployment smoke checklist

After deployment, verify:

1. Open the app homepage.
2. Confirm the generation badge says `Generation: deterministic fallback` when live generation is disabled.
3. Confirm source chunks, ProcedureLedger, guide cards, and Publish Gate sections render.
4. Click `Export ledger JSON`.
5. Confirm the exported JSON includes `generationMeta`, `procedureLedger`, `sourceDocuments`, `sourceChunks`, `guardedGuideCards`, and `publishGateSummary`.
6. Confirm no API key appears in the page source, browser console, exported JSON, README, or docs.

Optional Qwen live smoke test:

1. Set a server-side `QWEN_API_KEY` or `DASHSCOPE_API_KEY`.
2. Set `QWEN_LIVE_GENERATION=true`.
3. Restart the runtime.
4. Open the homepage.
5. Confirm the generation badge says either `Generation: Qwen live` or a safe fallback state.
6. If Qwen returns invalid output, confirm the app still renders deterministic fallback cards.

## Public repo boundary

This repository may include deployment notes, environment variable names, public-safe architecture descriptions, and synthetic samples.

This repository must not include:

- Alibaba Cloud account credentials.
- API keys.
- Workspace IDs tied to private accounts.
- Private WorkCue strategy.
- Pricing or sales playbooks.
- Customer data or customer documents.
- Private prompt chains.
- Internal roadmap content.

## Out of scope for T007

T007 intentionally does not add:

- Infrastructure-as-code.
- Dockerfile.
- CI deployment automation.
- Domain binding.
- TLS certificate automation.
- Database persistence.
- Authentication.
- Billing.
- PDF upload.
- Multi-tenant SaaS behavior.

Those can be considered only after the hackathon demo slice is stable and the submission materials are ready.
