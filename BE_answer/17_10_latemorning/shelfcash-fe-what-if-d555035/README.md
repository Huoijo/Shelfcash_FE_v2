# ShelfCash FE — What-if REPLAN

**SOURCE_READY / NOT_DEPLOYED** — implementation
`d555035bdb52929eea4ce7b60b5d1447ce748078`.

Start with [WHAT_IF_FE_HANDOFF_VI.md](WHAT_IF_FE_HANDOFF_VI.md), then
[S01/S02 OpenAPI subset](what_if/openapi_subset.json),
[SYNTHETIC examples](what_if/examples.json) and
[FE acceptance checklist](what_if/FE_ACCEPTANCE_CHECKLIST.md).
The subset has2 operations/2 paths with complete transitive schema references;
it is not the full BE OpenAPI (78 operations/71 paths).

[API delta](what_if/api_diff.json) compares the implementation with pre-What-if
main `0786505f152b0a59f1fa6b4be8e6df0a4796911d`.
[Provenance](what_if/PROVENANCE.json) pins implementation and reviewed result hashes;
[manifest](what_if/manifest.sha256) hashes all payload files except the manifest
itself, using archive-relative paths. Verify with `sha256sum -c what_if/manifest.sha256`
from the extracted root, or an equivalent SHA-256 tool.

Examples are SYNTHETIC. Completed examples reuse reviewed actual engine output;
queued/running/failure and transport examples are labelled DTO/router fixtures.
Baseline10 VND → demand1.2:15 VND (+5); delay2/combined: no winner, money delta null.
These are not real cafe results or runtime8103 acceptance. No new solve, provider,
DB reset/migration or application runtime call was needed to package this handoff.

Scope: REPLAN may choose another basket; no fixed-basket stress test or real-state
mutation. Unsupported pending inbound/challenger/chaining fail closed. Do not call
Summary/Chat/PDF for child scenarios. Read the known S02 error-envelope/ETag and
S01 body-limit declaration drift in the handoff before writing a strict FE adapter.

Only the feature handoff, subset, examples, API delta, checklist, provenance and
manifest are included. No source diff, test logs, review ZIP, DB dump or credentials.
Implementation is committed locally; no push, Import merge or deployment is implied.
