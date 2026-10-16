# 021 — Controlled Planning evidence

[Implementation receipt](../../sprints/021/021_Planning_Handoff_Integration.md) and [verification](VERIFICATION.json).

- 519 Node tests, including 40 added Planning cases, use fixtures/intercepted fetch/local state.
- [12 browser cases](BROWSER_VERIFICATION.json) mount the actual export components with synthetic Auth/Store/Run providers and intercept every HTTP request; native IndexedDB survives reload and clean isolated Chromium restart. No real session or BE server is used.
- `pdf-uncertain.png`: original unresolved intent, replacement locked.
- `pdf-processing.png`: exact replay accepted, J01 running.
- `pdf-completed.png`: completed job, download available.
- `retained-discovery.png`: EX01 retained receipt, existing artifact download.

Screenshots are component/state evidence, not full-shell visual acceptance. Synthetic PDF bytes prove transport/hash behavior only. Summary/Chat have application-state tests but no production UI caller/screenshots pending canonical interactions. Live API/full app E2E/provider/backend PDF content NOT_RUN.

Repeat: `npm run test:planning`; `node scripts/verify-planning-021-browser.mjs`. Browser runner builds a temporary isolated bundle/profile, uses no app/BE server, and removes its temporary files/profile on exit. The backend handoff directory is read-only input.
