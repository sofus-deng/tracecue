# TraceCue Equipment After-sales QR Guide demo video script

## Purpose

This document is the recording script for the new TraceCue submission package. It positions TraceCue as the public WorkCue Open / Qwen Cloud competition edition and technical showcase version of WorkCue.

The video should feel like a prize-focused hackathon pitch, not a slow product tutorial. It must show why TraceCue is more than a QR guide generator: it is an agent pipeline that uses Qwen generation, source traceability, safety controls, human review, Publish Gate decisions, ProcedureLedger proof, QR Preview, and exportable artifacts.

## Target duration

Target length: **2 minutes 30 seconds to 2 minutes 55 seconds**.

Hard rule: keep the final cut under 3 minutes.

## Track fit

Recommended track: **Track 4 — Autopilot Agent**.

TraceCue fits because it automates a real operational workflow: turning scattered equipment after-sales source notes into reviewable frontline QR guide cards, then stopping unsupported or risky instructions before publication.

## Core positioning

TraceCue is the public, safe competition edition of WorkCue. It demonstrates the core agent pipeline for turning messy equipment after-sales notes into QR-ready frontline guides: Qwen generates, Source Guard traces evidence, humans review risk, Publish Gate blocks unsafe cards, and ProcedureLedger records the proof.

## One-line value proposition

TraceCue turns public-safe synthetic equipment after-sales notes into QR-ready guide cards, proves where each instruction came from, and withholds unsupported or risky steps before they reach frontline users.

## Recording prerequisites

- Use a clean browser profile or private window.
- Open only the TraceCue app, the public repository README if needed, and optional Alibaba Cloud deployment proof.
- Use a readable desktop viewport such as `1440 x 900` or `1512 x 982`.
- Disable notifications and hide bookmarks or browser extensions that may reveal private data.
- Confirm the initial page load shows deterministic standby unless a controlled smoke test intentionally enables another state.
- Trigger Qwen live generation only through the explicit `Run Qwen pass` button.
- Show `qwen_live` and model metadata only if a safe configured environment is available.
- If free quota is exhausted, present `qwen_quota_paused` / `Free quota exhausted` as a safety state that avoids billable usage.
- Do not show `.env.local`, API keys, cloud account identifiers, private terminal history, real customer data, private prompts, internal prompt chains, or private WorkCue material.

## Shot-by-shot script

| Time | Shot | Narration intent | Visual proof |
|---|---|---|---|
| 0:00-0:20 | Problem hook | Frontline QR guides cannot contain unsupported AI-generated instructions. | Show scattered synthetic after-sales sources: maintenance rules, warranty boundaries, safety limits, and support escalation notes. |
| 0:20-0:40 | TraceCue positioning | TraceCue is the public WorkCue Open / Qwen Cloud competition edition using public-safe synthetic equipment samples. | Show hero, WorkCue Open badge, Equipment After-sales QR Guide label, source coverage, and generation badge. |
| 0:40-1:10 | Run Qwen pass | Start from deterministic standby, then click `Run Qwen pass` in a safe configured environment if available. | Show standby first, button click, `qwen_live` badge and model metadata if available. Reserve this shot even if fallback is used. |
| 1:10-1:35 | Source traceability | Every instruction must prove where it came from. | Show guide cards with refs such as `filter-replacement#03`, `fault-triage#02`, `safety-limits#01`, `warranty-boundaries#01`, or `support-escalation#01`. |
| 1:35-1:55 | Human review and risk controls | Source Guard and Risk Guard catch missing evidence and safety, warranty, escalation, unsupported repair, or service-authority risks. | Show guard badges and session-only review actions. Explain approval cannot bypass missing evidence or high-severity risk. |
| 1:55-2:15 | Publish Gate | Publishable, needs review, and blocked cards are separated before publication. | Show all three Publish Gate columns and explain withheld cards do not ship to the QR guide. |
| 2:15-2:35 | QR Preview | Frontline users see only allowed cards. | Show mobile-style QR Preview, included/held/blocked counts, and withheld notice. |
| 2:35-2:50 | ProcedureLedger and exports | TraceCue records generation, evidence, review, risk, publish status, feedback, revision proposal, and exports proof. | Show ProcedureLedger, ledger JSON export, and guide Markdown export buttons or downloaded artifacts. |
| 2:50-2:58 | Closing | Tie Qwen Cloud, Alibaba Cloud deployment notes, public repo, and equipment after-sales value together. | End on Publish Gate or QR Preview with proof trail visible. |

## Narration script

Use this as the primary voiceover. Trim minor wording live if needed, but keep the pacing punchy.

**0:00-0:20 — Problem hook**

> Equipment vendors and after-sales teams already have the information: maintenance notes, filter replacement steps, fault triage rules, warranty boundaries, safety limits, and support escalation notes. The hard part is turning that messy source material into a QR guide a frontline user can trust. A normal AI generator can produce polished instructions, but a frontline QR guide cannot contain unsupported repair steps, blurred warranty authority, or unsafe advice.

**0:20-0:40 — TraceCue positioning**

> TraceCue is the public, safe competition edition of WorkCue. It demonstrates the core agent pipeline for turning messy equipment after-sales notes into QR-ready frontline guides: Qwen generates, Source Guard traces evidence, humans review risk, Publish Gate blocks unsafe cards, and ProcedureLedger records the proof. This public demo uses only synthetic equipment after-sales samples and is built for the Qwen Cloud hackathon.

**0:40-1:10 — Run Qwen pass**

> On page load, TraceCue starts in deterministic standby. That is intentional: refreshes, crawlers, health checks, and passive visits should not create Qwen usage. When a safe configured environment is available, I click `Run Qwen pass` to trigger one explicit Qwen generation request. If live proof is available, show the `qwen_live` state and model metadata here. If quota is exhausted, TraceCue shows `Free quota exhausted` as a paused safety state rather than silently moving into billable usage.

**1:10-1:35 — Source traceability**

> Qwen is not just writing a guide; every card must carry a source trail. These cards reference synthetic source chunks like filter replacement, fault triage, safety limits, warranty boundaries, and support escalation. If a guide card cannot prove where an instruction came from, Source Guard marks it for review or blocks it.

**1:35-1:55 — Human review and risk controls**

> Risk Guard checks for safety, warranty, escalation, unsupported repair, and service-authority risks. Human review actions are demo-local: a reviewer can approve, request expert review, or block a card, but approval cannot override missing evidence or high-severity risk controls.

**1:55-2:15 — Publish Gate**

> The Publish Gate is where the agent becomes useful for frontline operations. Cards are separated into publishable, needs review, and blocked. Unsupported or risky cards are withheld before publication, so the QR guide does not become a blind copy of AI text.

**2:15-2:35 — QR Preview**

> The QR Preview shows what a frontline user would see after scanning an equipment guide link. Only cards cleared by the Publish Gate appear in this mobile-style preview. Review-only and blocked cards stay out of the frontline artifact.

**2:35-2:50 — ProcedureLedger and exports**

> ProcedureLedger records what happened: generation mode, model evidence, source coverage, risk flags, review state, publish status, feedback, and the revision proposal. The ledger JSON export gives machine-readable proof, and the guide Markdown export gives a readable review or frontline artifact.

**2:50-2:58 — Closing**

> TraceCue runs as a public WorkCue Open reference slice with Qwen Cloud usage, Alibaba Cloud deployment notes, deterministic standby, and production-oriented safeguards. It is relevant for equipment vendors and after-sales teams that need source-grounded QR guidance. TraceCue is not just generating instructions. It is proving which instructions are safe enough to publish.

## On-screen proof checklist

- [ ] WorkCue Open badge is visible.
- [ ] Equipment After-sales QR Guide is visible as the active scenario.
- [ ] Deterministic standby is visible before any Qwen action.
- [ ] `Run Qwen pass` is clicked only as an explicit user action.
- [ ] `qwen_live` and model metadata are shown if a safe configured environment is available.
- [ ] `qwen_quota_paused` / `Free quota exhausted` is described as a safety state if it appears.
- [ ] Guide cards show source references from the equipment after-sales source pack.
- [ ] Source Guard and Risk Guard badges are visible.
- [ ] Review action copy makes clear approval cannot bypass missing evidence or high-severity risk controls.
- [ ] Publish Gate shows publishable, needs review, and blocked categories.
- [ ] QR Preview shows only allowed cards and withholds review-only or blocked cards.
- [ ] ProcedureLedger shows generation state, source snapshot, guard results, review state, publish state, and revision target.
- [ ] Export ledger JSON is shown or referenced as the machine-readable proof artifact.
- [ ] Export guide Markdown is shown or referenced as the readable review/frontline artifact.

## Visual capture checklist

- [ ] Clean desktop browser viewport, preferably `1440 x 900` or `1512 x 982`.
- [ ] No private bookmarks, account menus, notifications, local secrets, or personal tabs visible.
- [ ] Source input pack shows only synthetic equipment after-sales documents.
- [ ] Guide cards remain readable with source refs visible.
- [ ] Publish Gate columns are legible in one shot.
- [ ] QR Preview phone frame fits on screen.
- [ ] Export buttons are visible: `Export ledger` and `Export guide Markdown`.
- [ ] If downloaded artifacts are opened, inspect them first and show no secrets.
- [ ] Optional deployment proof shows only public-safe Alibaba Cloud deployment evidence and no credentials.

## Qwen live proof note

The strongest recording includes a safe configured run where `Run Qwen pass` produces `qwen_live` and visible model metadata. Show this only when credentials are server-side and safe.

If live Qwen is unavailable during recording, do not fake it. Keep the deterministic standby shot, reserve a brief live-proof slot, and state that the live path is available through explicit action when configured. If `Free quota exhausted` appears, explain it as `qwen_quota_paused`: TraceCue pauses live generation to avoid billable usage when free quota is exhausted.

## Export proof note

The ledger JSON export should be described as machine-readable proof. It should include generation metadata, ProcedureLedger, source documents, source chunks, guarded guide cards, Publish Gate summary, review session data, feedback, and revision proposal.

The guide Markdown export should be described as a readable artifact for review or frontline distribution after gate clearance. It should show publishable steps, source references, withheld-card notes, generation metadata, and no secrets.

## Public-safety reminders

- Use English narration for the Devpost/submission audience.
- Keep all samples synthetic and generic.
- Do not show real customer data, private equipment-owner data, or customer names.
- Do not show private WorkCue strategy, pricing, sales playbooks, engine-vault material, private prompts, internal prompt chains, secrets, or `.env.local` contents.
- Do not claim TraceCue is a complete production SaaS product.
- Say production-oriented safeguards or production-readiness signals, not complete production readiness.
- Make clear this public slice does not include auth, billing, database persistence, real customer data, QR image upload or decoding, PDF OCR, or multi-tenant SaaS behavior.
- Do not imply Qwen runs automatically on page load.
- Do not imply deterministic standby is a hidden live-model success path; it is the safe replay path.

## Submission readiness notes

- The active scenario is Equipment After-sales QR Guide, not Client Handoff.
- The first 30 seconds must answer what TraceCue is, why it matters, why it is more than a QR guide generator, and how it uses Qwen Cloud in an agent pipeline.
- Keep the story centered on Qwen generation, source traceability, human review, Publish Gate, ProcedureLedger, QR Preview, ledger JSON export, and guide Markdown export.
- Mention Alibaba Cloud deployment notes and runtime safeguards as production-oriented signals, not as proof of a complete SaaS platform.
- Keep the final line strong and specific: TraceCue is not just generating instructions. It is proving which instructions are safe enough to publish.

## Optional backup plan if Qwen live is unavailable during recording

Use this fallback narration if the environment cannot safely show `qwen_live`:

> This recording is using deterministic standby so page loads, refreshes, crawlers, and health checks do not create Qwen usage. The live Qwen path is intentionally behind the explicit `Run Qwen pass` action and records its generation mode and model in ProcedureLedger when configured. If the configured free quota is exhausted, TraceCue enters `qwen_quota_paused` and shows `Free quota exhausted` instead of silently creating billable usage. The rest of the agent pipeline still demonstrates the safety loop: Source Guard, Risk Guard, human review, Publish Gate, QR Preview, and exportable proof.

If using this backup, keep the video under 3 minutes by shortening the source traceability and export sections by a few seconds each.
