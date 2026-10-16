# ShelfCash — contract workspace

Created 16/10/2026, sprint 016. This is the single entry point for FE integration contracts and workflow authority. `api-contract-v1` and `api-contract-v2` have been merged into this workspace as immutable historical sources, not combined into an invented API release.

- [Workflow and ground truth](WORKFLOW.md): behavioral invariants, authority and facts that survive each snapshot.
- [Current BE handoff guide](../shelfcash_FE_handoff_869eaec9/FE_START_HERE_VI.md), [canonical contracts](../shelfcash_FE_handoff_869eaec9/contracts/INDEX.md), [known prose mismatches](../shelfcash_FE_handoff_869eaec9/verification/DOC_MISMATCHES_VI.md).
- [016 OpenAPI](016/openapi.main.json), [016 provenance](016/provenance.json): exact bytes from BE main `869eaec914aa6905d6b935889afebe7d973004ae`. FE Import/SU01/Import R01 consume this slice. It is not attestation of a currently deployed BE or commit `b0db90c`.
- [018 service boundary](../docs/018_Backend_Capabilities_Service_Boundary.md): explicit `capabilities` consumer pins the same 016 artifact for all 73 callable operations. 018 was service-only; [019](../docs/019_Main_Frontend_Implementation.md) now connects the frozen supported surfaces and migrates selected UI closures; `npm run check:capabilities-wire` checks its types/schemas/inventory.
- [011 OpenAPI](011/openapi.main.json): previous FE target. 019 migrates Store Workspace, Planning and Operations closures to main016; unchanged session/read feature slices retain established 011 consumers. A shared snapshot copy is not permission to activate every new route.
- [Historical v1](history/v1/README_VI.md), [historical v2](history/v2/README_VI.md), [preservation manifest](history/PROVENANCE.json): all 252 original files, preserved byte-for-byte including manifests, accepted ADRs, examples, limitations and reported test results. These do not override newer implemented wire or new accepted decisions.

Use `npm run check:contracts` for file/provenance integrity and operation inventories; use each slice's wire gate and controlled/live acceptance separately. Old paths in frozen provenance are source names, not promises that old root folders still exist. Active repository links and callers use the consolidated locations.

## How to change a contract consumer

1. Identify the exact operation, DTO closure, permissions and current source SHA. Check newer prose corrections rather than treating an old checkpoint as current runtime.
2. Select the slice explicitly in `scripts/wire-source.mjs`; do not repin unrelated consumers implicitly. Preserve original source/hash provenance.
3. Audit current MagicPath for user-visible states. Business/API availability does not define visual interaction. Record missing states in [FOUND_MISSING_UI](../docs/FOUND_MISSING_UI.md); API TODOs stay in [sprint 016](../docs/016_Integration_Sprint.md).
4. Generate typed wire, adapt code and fixtures, run focused regression/drift checks. Never loosen unknown keys into arbitrary JSON to make a mismatch disappear.
5. Record independently: BE source capability, FE wiring, controlled verification, live verification. A 2xx, screenshot, design-ready endpoint or passing schema gate alone does not prove persistence or workflow completion.
