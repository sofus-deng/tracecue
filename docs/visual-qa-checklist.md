# Visual QA checklist

Use this checklist before hackathon submission, demo recording, or a customer-facing rehearsal. It is a screenshot-driven QA pass for the TraceCue Equipment After-sales QR Guide workbench.

This document is submission readiness material. It is not product user documentation and should not be presented as frontline operating guidance.

## Public-safe screenshot rules

Before capturing or sharing screenshots:

- Use only the synthetic TraceCue demo data bundled with this repository.
- Do not show real customer data, private equipment-owner data, private source files, or internal WorkCue planning material.
- Do not show API keys, model credentials, cloud console secrets, private workspace IDs, terminal history containing secrets, or `.env.local`.
- Do not show personal browser tabs, bookmarks, extensions, notifications, local file paths, or account details that are not needed for the demo.
- If a screenshot includes exported JSON or Markdown, inspect it for secrets before sharing.
- If using a deployed URL, confirm it is a public-safe deployment and does not expose debug output or runtime secrets.

## Setup checklist

- [ ] Pull the intended branch and confirm the working tree contains only expected changes.
- [ ] Use either a deployed URL or local app URL such as `http://localhost:3000`.
- [ ] Start local development only if needed with `pnpm dev`.
- [ ] Use a clean browser profile or private window.
- [ ] Set browser zoom to 100% unless a different zoom is intentionally being tested.
- [ ] Close private browser tabs and disable notifications.
- [ ] Confirm the first page load shows a safe deterministic standby state unless a controlled test environment is intentionally configured otherwise.
- [ ] Confirm Qwen live generation is triggered only by the explicit `Run Qwen pass` action.
- [ ] Save screenshots with descriptive names, for example `desktop-standby-home.png` or `mobile-qr-preview.png`.

## Viewport matrix

Capture the required set on at least one desktop viewport and one mobile viewport. Use the additional sizes when preparing final submission assets or a customer-demo rehearsal.

| Viewport | Size | Required | Purpose |
|---|---:|---|---|
| Desktop standard | 1440 x 900 | Yes | Main hackathon and demo-video capture size |
| Desktop wide laptop | 1512 x 982 | Recommended | Checks spacing on common laptop displays |
| Tablet / narrow | 768 x 1024 | Optional | Checks tablet layout and tab wrapping |
| Mobile tall | 390 x 844 | Yes | Primary mobile QA size |
| Mobile small | 375 x 667 | Recommended | Stress test for crowded header actions and phone preview |

## Required desktop screenshots

Capture these at 1440 x 900 or 1512 x 982.

| Screenshot | Required visible evidence | Pass criteria |
|---|---|---|
| Desktop page load deterministic standby | WorkCue Open badge, TraceCue Agent badge, generation badge, hero, source coverage, source metrics, export actions | Page is readable, no Qwen call is implied, no actions are hidden |
| Desktop Qwen live success | Generation state after clicking `Run Qwen pass` in a safe configured environment | Badge clearly says Qwen live and does not suggest automatic page-load generation |
| Failed fallback state | `Qwen attempted; fallback used`, if safely reproducible | Wording makes fallback explicit and does not pretend the model succeeded |
| Quota paused state | `Free quota exhausted`, only if naturally reproducible or available in a safe configured test environment | Red paused state is visible and explains live generation is paused to avoid billable usage |
| Guide cards tab | Guide card titles, source references, review badges, risk/source badges, and review action buttons | Cards remain readable and reviewer controls are visible |
| Publish Gate tab | Publishable, Needs Review, and Blocked columns | Columns are visible and card titles do not overflow their containers |
| QR Preview tab | QR entry point, withheld notice, phone preview frame, proof trail, and generation badge inside the phone preview | Phone preview stays inside its container and all proof-trail text is readable |
| Export ledger JSON | Opened exported JSON artifact | Expected ledger fields are present and no secrets are present |
| Export guide Markdown | Opened exported Markdown artifact | Guide sections and source references are present and no secrets are present |

## Required mobile screenshots

Capture these at 390 x 844. Repeat at 375 x 667 when preparing final submission screenshots.

| Screenshot | Required visible evidence | Pass criteria |
|---|---|---|
| Mobile top of page | Badges, generation state, Run Qwen pass, export buttons, hero, and source coverage | Header actions wrap without horizontal scroll or hidden buttons |
| Mobile source and ledger panels | Input pack and ProcedureLedger panels | Accordions and timeline remain readable |
| Mobile Guide cards tab | At least one guide card with source references and review controls | Badges do not become unreadable and buttons remain tappable |
| Mobile Publish Gate tab | Publishable, Needs Review, and Blocked sections stacked vertically | Each gate section is reachable without broken tab behavior |
| Mobile QR Preview tab | QR entry point, withheld notice, and phone preview | The phone preview does not overflow the viewport and the inner scroll area works |
| Mobile export actions | Export guide Markdown and Export ledger buttons | Export actions are not crowded, clipped, or hidden |

## Generation-state QA

Check every state that is safely available in the current environment.

- [ ] Deterministic standby: initial page load clearly communicates that demo cards loaded without a live model call.
- [ ] Qwen live: after explicit `Run Qwen pass`, the badge and notification clearly show live Qwen generation succeeded.
- [ ] Qwen unconfigured: if live generation is enabled without credentials in a safe test environment, the UI clearly says Qwen is unconfigured and deterministic cards are shown.
- [ ] Qwen attempted fallback: if a safe failure path is available, the UI clearly says Qwen was attempted and fallback was used.
- [ ] Free quota exhausted: capture only if naturally reproducible or available in a safe configured test environment. Do not force risky quota behavior or change model-chain safeguards just to create this screenshot.
- [ ] No generation state implies Qwen was called automatically on page load.
- [ ] Exported artifacts record the generation mode and model accurately.

## Guide cards tab QA

- [ ] At least two cards show visible source references.
- [ ] Review status, Source Guard status, Risk Guard badges, and Publish Gate status are readable.
- [ ] Review action buttons are visible and tappable on desktop and mobile.
- [ ] Approval wording does not imply that human approval can override Source Guard or high-severity Risk Guard.
- [ ] Cards with missing or invalid evidence remain blocked or held for review.
- [ ] Long card titles and source references do not clip or create horizontal overflow.

## Publish Gate tab QA

- [ ] Publishable, Needs Review, and Blocked categories are visible.
- [ ] Counts match the visible card grouping.
- [ ] Empty states are clear when a category has no cards.
- [ ] The Publish Gate copy explains that unsupported or risky instructions stop before QR publication.
- [ ] Gate cards remain readable at desktop and mobile widths.

## QR Preview tab QA

- [ ] Included, held-for-review, and blocked counts are visible.
- [ ] QR entry point is clearly marked as a placeholder if QR image rendering is not implemented.
- [ ] Withheld notice correctly summarizes cards hidden from the frontline QR guide.
- [ ] Phone preview frame does not overflow its parent container.
- [ ] Phone preview inner scroll area works and does not hide proof-trail content.
- [ ] Proof trail shows model and generation state without misleading wording.
- [ ] Blocked or review-only steps are not presented as frontline-ready instructions.

## JSON export QA

Click `Export ledger` and inspect the downloaded JSON.

- [ ] Filename is recognizable as a TraceCue equipment after-sales ledger export.
- [ ] `generationMeta` is present and includes mode, model, and reason.
- [ ] `procedureLedger` is present.
- [ ] `sourceDocuments` is present and contains only synthetic source material.
- [ ] `sourceChunks` is present and contains only synthetic chunks.
- [ ] `guardedGuideCards` is present.
- [ ] `publishGateSummary` is present.
- [ ] `reviewSession` marks review actions as local/session-only when applicable.
- [ ] No API key, `.env.local` value, private cloud identifier, real customer data, or private WorkCue planning material appears in the file.

## Markdown export QA

Click `Export guide Markdown` and inspect the downloaded Markdown.

- [ ] Filename is recognizable as a TraceCue equipment after-sales guide export.
- [ ] Generation mode and model are visible.
- [ ] Publish Gate summary is visible.
- [ ] Guide cards include instructions, completion checks, and source references.
- [ ] Withheld or blocked cards are clearly marked when present.
- [ ] Review decisions are included only as session-local review evidence when applicable.
- [ ] The export does not imply unsupported cards are publishable.
- [ ] No API key, `.env.local` value, private cloud identifier, real customer data, or private WorkCue planning material appears in the file.

## Visual defect checklist

Review screenshots and the live browser for these defects:

- [ ] Horizontal overflow at desktop, tablet, or mobile widths.
- [ ] Clipped headings, body text, source references, or completion checks.
- [ ] Unreadable badges due to color contrast, wrapping, or truncation.
- [ ] Hidden or crowded buttons, especially `Run Qwen pass`, `Export guide Markdown`, and `Export ledger`.
- [ ] Broken tab behavior or tabs that are unreachable on narrow screens.
- [ ] Phone preview overflow or proof-trail content hidden behind the preview frame.
- [ ] Crowded export actions at mobile widths.
- [ ] Alert copy that contradicts the current generation state.
- [ ] Misleading generation wording, especially around fallback, unconfigured, failed, or quota-paused states.
- [ ] Screenshots that show private data, local secrets, private browser state, or real customer material.

## Submission readiness evidence

This section is for hackathon submission readiness only. It is not product user documentation.

- [ ] Deployed URL opens successfully.
- [ ] Public repository URL is ready.
- [ ] OSI license is visible in the repository.
- [ ] Demo video is public and focused on the current Equipment After-sales QR Guide scenario.
- [ ] Qwen live screenshot is captured from an explicit `Run Qwen pass` action if a safe configured environment is available.
- [ ] Deterministic standby screenshot is captured for replayability proof.
- [ ] JSON export artifact is captured or attached after secret review.
- [ ] Markdown guide export artifact is captured or attached after secret review.
- [ ] Alibaba Cloud deployment proof is prepared if required by the submission form.
- [ ] No screenshot or artifact exposes `.env.local`, API keys, secrets, private cloud identifiers, real customer data, private prompts, or internal WorkCue strategy.
