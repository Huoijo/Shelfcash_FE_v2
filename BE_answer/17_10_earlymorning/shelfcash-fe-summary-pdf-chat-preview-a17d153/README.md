# ShelfCash FE preview — SOURCE_READY / NOT_DEPLOYED

Source local main: `a17d153feccfa96de34002dd536bf9381c01f219`. Date: 2026-10-17 (Asia/Saigon).
Serving deployment is UNVERIFIED; NOT_DEPLOYED means this preview did not deploy.
Remote main was not fetched; only local origin/main ref is recorded in PROVENANCE.json.

Start with [canonical FE delta/checklist](docs/handoff/010_BE_CAPABILITY_RESPONSE_VI.md),
then [OpenAPI](docs/handoff/openapi.json), [Planning workflow](docs/PROCUREMENT_API_CONTRACT_VI.md),
[Assistant/operator limits](docs/features/DECISION_ASSISTANT.md) and
[examples/request order](docs/handoff/examples.json).

Import nâng cấp đang ở nhánh riêng; chưa thuộc bản bàn giao này. Sẽ reconcile và
phát hành handoff thống nhất sau tích hợp. This ZIP is a preview, not the final release.

Only FE contracts, required operator documentation, synthetic examples and baseline
OpenAPI are included. Supplementary engineering/source links outside this bounded
package are explicitly written as repository references, with paths listed in
PROVENANCE.json. Resolve those in the pinned source repository; they are not bundled
code, historical logs, provider raw data or runnable instructions for this task.

Unrelated seed WIP is preserved in the workspace and excluded from this package:
CURRENT_STATE/ROADMAP/FULL_TEST_FLOW use HEAD plus this handoff's own inserted text.
Other documents use reviewed working-tree contract changes. Those documents are
uncommitted overlays; do not infer their bytes exist at source HEAD.

Historical live examples keep their original pins. New integration_sequences are
ILLUSTRATIVE offline fixture projections; export_sequence is DTO-only. No new DB,
browser, provider or production acceptance. S3 has no final-source live Gemini proof.

MANIFEST.sha256 hashes every other entry, including PROVENANCE.json and this README.
Check ZIP CRC and manifest before use. ZIP SHA-256 is supplied alongside the archive.
Do not execute DB/reset/worker/live-provider commands merely to consume this handoff.
