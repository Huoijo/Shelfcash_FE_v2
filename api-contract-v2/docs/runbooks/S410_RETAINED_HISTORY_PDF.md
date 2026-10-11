# Local retained views, history and PDF — S4.10

## CURRENT FACT — test environment and worker

Use one backend process. Defaults independently disable Import, planning and PDF
workers. In a private local test setup, select exact local `shelfcash_test`,
`ENVIRONMENT=test`, and check the repository DB guard/status before connecting.
Use the existing FULL_TEST_FLOW and supported `scripts.dev` commands; no command
in this task targets the development DB. Migration head is0017_planning_exports.
Before resuming inspect process ownership/logs; do not duplicate an active runner.
Missing exit/completion evidence is UNVERIFIED/INTERRUPTED, never PASS.

For actual automatic PDF processing set `PDF_EXPORT_WORKER_ENABLED=true` before
starting the existing backend entrypoint, then restart that one process. Its
lifespan starts one `shelfcash-pdf-export` thread and joins it on shutdown. Enable
`PLANNING_WORKER_ENABLED=true` independently only when creating new planning Runs;
retained inspection/PDF need no new Run computation. GET never starts workers.
With PDF flag false, accepted exports stay queued until an authorized local
worker runs; J01 still exposes their state. Private files are under the configured
runtime directory's `planning_exports`, without an external download URL.

## Manual HTTP flow

1. Follow S49's explicit BASELINE operator setup and real C02/C03 flow in the
   guarded test environment. Authenticate with the supported cookie/CSRF/Origin.
   Wait for a completed retained result; keep the Run UUID and result digest.
2. GET C04/C05/C08 using that Run. Verify winner/explicit option IDs and identical
   retained result digest. Inspect a different actual option without mutating the
   Run. Check3×7 balances, physical-stock separation and exact quantities.
3. GET N9 for the Store; try status/date filters, limit1 and next_cursor. A Run
   lifecycle update invalidates the old snapshot cursor. Reopen the UUID with C03.
4. Upload/analyze an Import with existing I01–I04. H01 `month=YYYY-MM` and H02
   `import_date=YYYY-MM-DD` use Store-local first-upload time, not data_date or
   completion time. Verify category+q on one file and only retained I06 completion
   normalizes status to completed. Drafts and retries do not add calendar counts.
5. N10 POST `/api/v1/procurement-plans/{run_id}/exports` with canonical UUID key
   and `{"format":"pdf","option_id":null,"locale":"vi"}`. Keep export_id/job_id
   and the original queued receipt. Poll existing J01 until completed; render
   stage is `rendering`, result resource_type is `planning_pdf_export`.
6. GET N11 `/api/v1/procurement-plans/{run_id}/exports/{export_id}`. Save binary
   PDF; compare SHA-256 and length with J01. Inspect Vietnamese text, capture,
   selected option, hypothetical purchases, warnings/proof and all pages.
7. Replay the original N10 key: receipt stays original; different original
   payload conflicts. Revoke cost/export read rights and verify denial on current
   GET/replay/download. Live stock/price/name/config edits must not rewrite the
   retained read or rendered historical report.

## Automated evidence

Sequential targeted gates and exact exit statuses are listed in
[S410 task notes](S410_TASK_NOTES.md). Fixtures own only guarded shelfcash_test
and verify committed state with fresh Sessions. Failure injections are labeled;
PDF rendering proof uses real ReportLab bytes, embedded fonts and PDFium images.
OpenAPI diff validates eight additive operations/six paths and unchanged old
operations; only the shared JobView component expands.

Actual final sample is retained at `runtime/s410/planning_sample_vi.pdf` with
SHA-256/page/byte/render/visual checks in `runtime/s410/pdf_qa.json`. All28 pages
were rendered with PDFium (Poppler unavailable); contact sheets and selected full
pages were inspected. No browser, live provider or real-data-quality claim.

Do not automatically retry dead-process exports or delete private orphan files.
Controlled internal retry remains bounded and requires current accepted actor
authority; no public retry endpoint or retention policy is approved. Windows
publication uses file fsync/atomic rename; POSIX also fsyncs the containing
directory. Render deadline is cooperative. Cold retained-read cost remains debt.
