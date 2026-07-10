# TraceCue Agent Devpost submission copy

## 1. Title

TraceCue Agent

## 2. Tagline

Source-grounded QR guide generation for equipment after-sales teams.

## 3. Short description

TraceCue Agent is the public WorkCue Open / Qwen Cloud competition edition, built to show how operational source material can become reviewable frontline guidance without hiding the evidence trail. Qwen generation creates guide cards from synthetic equipment after-sales notes, while source traceability, Publish Gate decisions, and ProcedureLedger proof help decide what is safe enough to publish.

## 4. What it does

TraceCue turns synthetic equipment after-sales notes into QR-ready frontline guide cards.

- Qwen generates guide cards through the explicit `Run Qwen pass` action, not through passive page load.
- Source Guard verifies that each card has valid source references back to the synthetic source pack.
- Risk Guard flags safety, warranty, escalation, unsupported repair, and service-authority risks.
- Human review actions classify cards as approved, needs expert review, or blocked within the demo session.
- Publish Gate decides which cards can be published, which require review, and which must be blocked.
- QR Preview shows what frontline users would see from a QR guide after blocked and review-only cards are withheld.
- ProcedureLedger records generation mode, model, source coverage, guard results, review status, publish status, feedback, and revision guidance.
- JSON ledger export and Markdown guide export provide inspectable artifacts for judges, reviewers, and technical evaluators.

## 5. Inspiration or problem

Equipment vendors and after-sales teams often have maintenance notes, filter replacement instructions, fault triage rules, safety limits, warranty boundaries, and escalation policies. The problem is converting that material into safe frontline QR guidance without accidentally publishing unsupported repair steps, unsafe advice, or blurred warranty authority.

A generic AI generator may produce plausible instructions that sound correct but do not prove where they came from. TraceCue addresses that trust gap by requiring every guide card to prove its source trail or be reviewed or blocked before it can reach a frontline QR guide.

## 6. How we built it

The public implementation is a focused Next.js app built around a synthetic markdown source pack for equipment after-sales procedures.

At a high level, the app includes:

- A synthetic markdown source pack covering maintenance, filter replacement, fault triage, safety limits, warranty boundaries, and support escalation.
- A source parser that turns markdown into source documents and source chunks.
- A Qwen Cloud server-side generation path for guide-card creation.
- A deterministic standby path for safe replay when live generation is not configured or should not run.
- Source Guard to validate evidence references.
- Risk Guard to flag safety, warranty, escalation, unsupported repair, and service-authority risk.
- ProcedureLedger to record generation, evidence, guard, review, and publish proof.
- Publish Gate to separate publishable, needs-review, and blocked cards.
- QR Preview to show the frontline guide experience after gating.
- JSON export for the ledger and Markdown export for the guide artifact.
- Alibaba Cloud deployment notes for running the public slice as a standard Next.js service.

This public slice does not claim database persistence, authentication, billing, production SaaS behavior, real customer integration, PDF OCR, or QR image decoding.

## 7. How we used Qwen Cloud

Qwen Cloud is used as the guide-card generation layer. TraceCue sends the synthetic equipment after-sales source context to Qwen and asks for concise guide cards with valid source references.

Live Qwen generation is triggered only by the explicit `Run Qwen pass` action. Page load stays deterministic by default so refreshes, crawlers, health checks, and passive visits do not consume Qwen tokens. This keeps the public demo replayable and makes model usage an intentional judge-visible action.

Qwen outputs must include valid source references. Even when Qwen returns useful instructions, the cards still pass through Source Guard, Risk Guard, ProcedureLedger, and Publish Gate. Invalid source references, unsupported instructions, or unsafe language can still be held for review or blocked.

The model chain supports free-quota rotation across configured Qwen models. If the configured free quota is exhausted, TraceCue enters the `qwen_quota_paused` state and displays `Free quota exhausted` instead of silently continuing into unexpected billable usage. That paused state is a deliberate cost and safety signal, not a hidden success path.

## 8. Track fit

Recommended track: **Track 4: Autopilot Agent**.

TraceCue fits Track 4 because it automates a real operational workflow end to end: source material becomes generated cards, cards are checked for evidence and risk, humans review ambiguous cases, Publish Gate blocks unsupported outputs, QR Preview shows the frontline result, and exports preserve the proof.

The workflow handles ambiguous and risky operational instructions rather than only generating fluent text. It includes human-in-the-loop checkpoints, blocks unsupported outputs before publication, and emphasizes production-oriented safeguards instead of toy demo behavior.

## 9. Architecture summary

The architecture flow is:

```text
Synthetic equipment after-sales samples
-> source parser
-> Qwen generation or deterministic standby
-> Source Guard
-> Risk Guard
-> ProcedureLedger
-> Publish Gate
-> Dashboard, QR Preview, ledger JSON export, and guide Markdown export
```

No database is required in this public slice. Review state is demo-local, and the public repository uses synthetic data only.

## 10. What makes it different

TraceCue is not a chatbot and not just a QR guide generator. It is an evidence-aware agent pipeline for operational instructions.

The key differentiator is not only that Qwen generates instructions. TraceCue proves where each instruction came from, reviews risk, blocks unsupported or unsafe cards, records the decision trail, and exports artifacts that a judge or technical reviewer can inspect.

## 11. Challenges

Realistic challenges included:

- Preventing passive page loads from consuming Qwen quota.
- Making Qwen output useful while requiring valid `sourceRefs`.
- Separating deterministic standby from live generation states so the UI does not imply fake live success.
- Handling free quota exhaustion transparently with `qwen_quota_paused` / `Free quota exhausted`.
- Making review actions useful without letting them override source and safety guards.
- Keeping the public repository safe while still showing the commercial WorkCue capability at a high level.

## 12. Accomplishments

This build delivers a public-safe WorkCue Open slice for the Qwen Cloud hackathon, including:

- Equipment after-sales source pack with synthetic samples.
- Explicit Qwen pass through `Run Qwen pass`.
- Source traceability for guide cards.
- Source Guard and Risk Guard.
- Human review actions for approved, needs expert review, and blocked states.
- Publish Gate for publishable, needs-review, and blocked decisions.
- QR Preview for the frontline guide experience.
- ProcedureLedger proof trail.
- JSON ledger export and Markdown guide export.
- Alibaba Cloud deployment notes.
- Visual QA checklist.
- Demo video script designed to stay under 3 minutes.

## 13. What we learned

Enterprise AI demos need evidence, not just fluent text. For operational guidance, a confident instruction is not enough; the system must show the source trail, the risk checks, and the publication decision.

We also learned that agent workflows need explicit checkpoints. Deterministic fallback is useful for safe demos, human review should be a controlled part of the pipeline rather than an afterthought, and a public demo can showcase product capability without exposing private customer data or private strategy.

## 14. What is next

Public-safe next steps include:

- Richer equipment scenarios.
- A better QR guide publishing flow.
- Optional QR image decoding in a future version.
- PDF or manual upload support later.
- Persistent review history.
- Deeper WorkCue commercial product work outside this public repository.

## 15. Public safety and open-source boundary

This public repository uses synthetic samples only. It excludes real customer data, pricing, private WorkCue strategy, secrets, engine-vault material, private prompts, and internal prompt chains.

TraceCue is the public WorkCue Open / Qwen Cloud competition edition and technical showcase version of WorkCue. The repository keeps the commercial WorkCue relationship high-level and public-safe while demonstrating the core agent capabilities judges can inspect.

## 16. Submission checklist

- [ ] Public repo
- [ ] OSI license
- [ ] Working deployment link
- [ ] Demo video under 3 minutes
- [ ] Architecture diagram
- [ ] Qwen Cloud usage explanation
- [ ] Alibaba Cloud deployment proof
- [ ] No secrets
- [ ] No real customer data
