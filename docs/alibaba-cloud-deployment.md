# Alibaba Cloud deployment notes

TraceCue Agent is a focused hackathon demo slice. These notes describe a public-safe Alibaba Cloud deployment path without adding database persistence, authentication, billing, customer data, or private WorkCue planning material.

## Deployment goal

Run the current Next.js app as a standard Node.js web service on Alibaba Cloud so reviewers can open the dashboard, inspect the source-grounded guide workflow, and optionally test Qwen live generation.

The demo should remain usable even without model credentials:

```text
synthetic markdown samples -> deterministic fallback guide cards -> Source Guard -> Risk Guard -> ProcedureLedger -> Publish Gate -> JSON export
```

Qwen live generation is optional and should run through the explicit `Run demo slice` POST flow, not through passive homepage rendering.

## Cost guard

The homepage is a server-rendered Next.js page. If live generation is enabled on page load, every homepage request can call Qwen. That includes manual refreshes, health checks, preview checks, crawlers, uptime monitors, or accidental visits.

Default deployment should therefore keep:

```env
QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=false
```

To allow the `Run demo slice` button to trigger one explicit Qwen request, use:

```env
QWEN_LIVE_GENERATION=true
QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=false
```

Future production behavior should add authentication, rate limiting, and per-run cost controls around the explicit API route.

## Live generation timing

The Qwen request is intentionally bounded so a demo cannot hang forever:

```text
REQUEST_TIMEOUT_MS = 90_000
MAX_TOKENS = 1_200
```

The live prompt is kept concise and asks for exactly four short guide cards. If the badge still reports a timeout, check whether the request is being stopped by Qwen latency, network conditions, or the reverse proxy before the app receives a model response.

## Recommended hackathon path

For the public hackathon submission, use the simplest reliable runtime that can run a Next.js Node server:

1. Build the app with pnpm.
2. Start the Next.js production server.
3. Configure environment variables in the Alibaba Cloud runtime console or ECS `.env.local`.
4. Keep page-load Qwen generation disabled.
5. Use `Run demo slice` for controlled live Qwen generation.

A containerized Node.js runtime or a small ECS instance is enough for this demo. Function Compute or a more managed container platform can be evaluated later, but this repository does not include platform-specific infrastructure-as-code.

## Required runtime behavior

The deployed app must support:

- Server-side rendering for the homepage.
- A POST `/api/run-demo` route for explicit Qwen live generation.
- Outbound HTTPS calls to Alibaba Cloud Model Studio / DashScope only when Qwen live generation is explicitly triggered.
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

Configure these in the Alibaba Cloud runtime environment or ECS `.env.local`, not in source control:

```env
QWEN_API_KEY=
DASHSCOPE_API_KEY=
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3.7-plus
QWEN_LIVE_GENERATION=true
QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=false
NEXT_PUBLIC_APP_NAME=TraceCue Agent
```

Rules:

- Prefer `QWEN_API_KEY` for TraceCue-specific configuration.
- `DASHSCOPE_API_KEY` is supported as a compatibility fallback.
- Do not expose model credentials through `NEXT_PUBLIC_*` variables.
- Do not commit `.env.local` or any deployment secret.
- Keep `QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=false` unless intentionally testing live generation on homepage render.
- Use the `Run demo slice` button for explicit one-time live generation.

## Qwen endpoint notes

TraceCue uses an OpenAI-compatible chat completion request and appends `/chat/completions` to `QWEN_BASE_URL`.

The default base URL remains:

```text
https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

The default model is:

```text
qwen3.7-plus
```

If the deployment uses a workspace-specific Model Studio endpoint, set `QWEN_BASE_URL` in the runtime environment instead of changing source code.

## Deployment smoke checklist

After deployment, verify:

1. Open the app homepage.
2. Confirm the generation badge says `Generation: deterministic fallback` on initial load.
3. Confirm source chunks, ProcedureLedger, guide cards, and Publish Gate sections render.
4. Click `Run demo slice` once.
5. Confirm the button shows a loading state, then the generation badge updates to either `Generation: Qwen live` or a safe fallback state with the reason in the tooltip.
6. Click `Export ledger JSON`.
7. Confirm the exported JSON includes `generationMeta`, `procedureLedger`, `sourceDocuments`, `sourceChunks`, `guardedGuideCards`, and `publishGateSummary`.
8. Confirm no API key appears in the page source, browser console, exported JSON, README, or docs.

Optional homepage live smoke test:

1. Set `QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=true` only for the controlled homepage-render smoke test.
2. Restart the runtime.
3. Open the homepage once.
4. Confirm the generation badge says either `Generation: Qwen live` or a safe fallback state.
5. Turn `QWEN_ALLOW_PAGE_LOAD_LIVE_GENERATION=false` again and restart the runtime.
6. Confirm future homepage loads no longer call Qwen.

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

## Out of scope

This repository intentionally does not add:

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