# Demo video script and screenshot checklist

TraceCue Agent is being submitted as a public hackathon demo for the Qwen Cloud Global AI Hackathon.

Recommended track: **Track 4 — Autopilot Agent**.

The main video should be about three minutes and should focus on the product promise:

> Every generated procedure guide card must either show its source trail or be blocked / marked for review before publishing.

Keep the recording public-safe. Do not show private repositories, API keys, `.env.local`, terminal history containing secrets, internal WorkCue strategy, customer data, pricing, sales playbooks, or private roadmap material.

## Submission video goals

The video should prove four things quickly:

1. TraceCue turns source notes into procedure guide cards.
2. Every guide card is tied to source chunks or stopped by the Publish Gate.
3. Qwen live generation is integrated safely behind deterministic fallback.
4. The demo is inspectable, replayable, and suitable for small-team operational workflows.

## Suggested recording setup

Use a clean browser window with only these tabs open:

1. Local or deployed TraceCue app.
2. GitHub repository README.
3. Optional: Alibaba Cloud deployment proof page or clip if ready.

Suggested app URL for local recording:

```text
http://localhost:3000
```

Suggested browser size:

```text
1440 x 900 or 1512 x 982
```

Use a readable zoom level. Avoid showing personal bookmarks, browser extensions with private data, or local filesystem paths that are not needed for the demo.

## Three-minute demo script

### 0:00–0:20 — Opening problem

**Screen:** TraceCue homepage hero.

**Narration:**

> Small teams often have scattered handoff notes, support policies, meeting excerpts, and checklists. A normal AI document generator can turn those into text, but it may also publish unsupported or risky instructions. TraceCue Agent is a source-grounded procedure guide autopilot: every guide card must prove where it came from, or it is held for review before publishing.

**Visual cue:** Hover or point to the hero, source coverage, and generation badge.

### 0:20–0:45 — Synthetic input pack

**Screen:** Input pack panel.

**Narration:**

> This public demo uses only synthetic markdown samples. The input pack simulates a client handoff scenario: handoff notes, a support FAQ, a delivery checklist, a meeting transcript excerpt, and a support policy draft. These are parsed into source documents and source chunks.

**Visual cue:** Expand one or two source documents. Show chunk-based provenance without showing any private data.

### 0:45–1:20 — Guide cards and source trail

**Screen:** Guide cards tab.

**Narration:**

> TraceCue creates a Client Handoff Guide from the source pack. Each card has a purpose, instructions, a completion check, and source references. The source trail makes the guide inspectable: reviewers can see which source chunk supports each instruction before it becomes client-facing guidance.

**Visual cue:** Show cards with `sourceRefs`, especially `delivery-checklist#01`, `handoff-notes#01`, and `meeting-transcript#01`.

### 1:20–1:55 — Publish Gate and review states

**Screen:** Publish Gate tab.

**Narration:**

> The Publish Gate separates cards into publishable, needs review, and blocked states. Cards with risk language or pending review do not silently ship. Cards with no source reference are blocked. This is the core safety loop: source grounding, risk detection, human review, and explicit publish status.

**Visual cue:** Show the three Publish Gate columns and explain why blocked / review-required states matter.

### 1:55–2:20 — ProcedureLedger and replayability

**Screen:** ProcedureLedger panel.

**Narration:**

> TraceCue records the workflow into a ProcedureLedger. The ledger captures source coverage, missing-source steps, risk flags, review summary, publish status, feedback count, and a revision proposal. This makes the guide workflow replayable instead of being a one-time AI text output.

**Visual cue:** Show the timeline and revision target.

### 2:20–2:40 — Qwen integration behind fallback

**Screen:** Generation badge and README runtime config section if useful.

**Narration:**

> Qwen live generation is integrated server-side, but the demo remains stable without credentials. By default, it uses deterministic fallback cards. When `QWEN_LIVE_GENERATION=true` and a server-side Qwen or DashScope API key is configured, TraceCue can ask Qwen to generate cards from the same source chunks. Invalid or unavailable model responses fall back safely.

**Visual cue:** Show the generation badge. If live Qwen is enabled and working, show `Generation: Qwen live`; otherwise show `Generation: deterministic fallback` and explain that this is intentional for reproducible judging.

### 2:40–2:55 — JSON export

**Screen:** Export ledger JSON button.

**Narration:**

> Finally, the ledger can be exported as JSON, including generation metadata, source documents, source chunks, guarded guide cards, and the Publish Gate summary. This gives reviewers and developers a concrete artifact to inspect.

**Visual cue:** Click export and briefly show the downloaded JSON if it does not reveal local private paths.

### 2:55–3:05 — Closing

**Screen:** Hero or Publish Gate.

**Narration:**

> TraceCue Agent shows how an autopilot agent can support real business procedures without skipping evidence or human review. It is a focused open-source reference implementation under WorkCue Open, built for the Qwen Cloud Autopilot Agent track.

## Optional shorter version

Use this if the final recording must be tighter:

> TraceCue Agent turns synthetic handoff notes, policies, checklists, and meeting excerpts into source-grounded procedure guide cards. Each card carries source references, passes through Source Guard and Risk Guard, and is then classified by the Publish Gate as publishable, needs review, or blocked. The ProcedureLedger records source coverage, risk flags, review state, publish state, and a revision proposal. Qwen live generation is available server-side, but deterministic fallback keeps the public demo stable without credentials. The exported ledger JSON makes the workflow replayable and inspectable.

## Screenshot checklist

Capture these screenshots for README polish, Devpost submission, and final QA.

### Product screenshots

1. **Hero and source coverage**
   - Path: `http://localhost:3000`
   - Must show: TraceCue title, WorkCue Open badge, generation status badge, source coverage ring.

2. **Input pack**
   - Must show: synthetic source documents and at least one expanded source excerpt.
   - Must not show: real customer data or private documents.

3. **Guide cards with sourceRefs**
   - Must show: at least two guide cards with visible source references.
   - Prefer cards that show `handoff-notes#01`, `meeting-transcript#01`, or `support-faq#01`.

4. **Publish Gate**
   - Must show: Publishable, Needs Review, and Blocked columns.
   - Must show: a blocked or review-required card so the safety mechanism is visible.

5. **ProcedureLedger**
   - Must show: source snapshot, guard results, review state, publish state, and revision target.

6. **Exported ledger JSON**
   - Must show: `generationMeta`, `procedureLedger`, and `publishGateSummary`.
   - Must not show: API keys, `.env.local`, or local secrets.

### Repository / documentation screenshots

7. **GitHub README top section**
   - Must show: product positioning and current demo scope.

8. **Demo data and public repo boundary section**
   - Must show: synthetic data statement and private-material exclusions.

9. **Alibaba Cloud deployment notes**
   - Must show: runtime environment variables with empty API key placeholders only.

10. **Work items status**
    - Must show: T001 through T008 done after this task is complete.

## Recording checklist

Before recording:

- Pull latest `main`.
- Run `pnpm install` if dependencies changed.
- Run `pnpm typecheck` and `pnpm build` if time allows.
- Start the app with `pnpm dev` or run production preview with `pnpm build && pnpm start`.
- Close private browser tabs and local files.
- Disable notifications.
- Confirm no API key is visible anywhere.

During recording:

- Keep the story focused on source trail, ProcedureLedger, Publish Gate, and fallback-safe Qwen integration.
- Do not spend time explaining future SaaS features.
- Do not show internal WorkCue planning.
- Do not over-emphasize pricing, customers, or commercial strategy.
- Keep the pace clear enough for judges to understand the system in one viewing.

After recording:

- Upload the main demo video publicly to YouTube, Vimeo, or Facebook Video.
- Keep the main demo around three minutes.
- Prepare a separate Alibaba Cloud deployment proof clip if required by the hackathon submission form.
- Verify the Devpost project text links to the public GitHub repo.
- Verify the public repo includes an open-source license before final submission.

## Devpost submission reminders

The submission should include:

- Public code repository URL.
- Open-source license visible in the repo.
- Architecture diagram.
- Main public demo video, about three minutes.
- Separate proof of Alibaba Cloud deployment if requested in the submission form.
- Text description of features and functionality.
- Track selection: **Track 4 — Autopilot Agent**.

## What not to say in the video

Avoid claims that are not yet implemented:

- Do not claim TraceCue is a complete SaaS product.
- Do not claim production authentication, billing, database persistence, PDF upload, or multi-tenant support.
- Do not claim real customer deployment.
- Do not claim Qwen is always required for the demo to work.
- Do not mention private WorkCue strategy or internal roadmap.

## Final demo message

Use this as the concise ending line:

> TraceCue Agent is not just generating a guide. It is proving whether each instruction is grounded enough to publish.
