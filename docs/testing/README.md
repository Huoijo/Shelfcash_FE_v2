# Kiểm thử và evidence

## Integration audit preparation

The [English integration audit workspace](../integration-audit/README.md) contains the original prompt/handoff and the later Windows discovery/resume reports. The [active report](../integration-audit/REPORT.md) records bounded Windows execution and T03 recovery browser evidence; the [archived discovery run](../integration-audit/runs/20261016-windows-d5cfbfb-discovery/REPORT.md) remains historical. Preparation templates and earlier macOS limitations do not override those host-specific results. This Git integration pass runs offline checks only; it does not rerun live/browser acceptance. Future discovery follows the [agent rule](../../.agents/rules/integration-audit.md) and establishes a fresh target-host baseline.

## Quy trình

- [017 — Live BE/FE E2E protocol](017_Live_BE_FE_E2E_Protocol.md): Owner/Staff, scope, quyền, mutation safety, authoritative readback, coverage và exit criteria.
- [Live E2E agent skill](../../.agents/skills/live-be-fe-e2e/SKILL.md): hướng dẫn thực thi tương ứng trong `.agents`.

## Inventory và verification receipts

- [UI toolchain bootstrap verification](UI_TOOLCHAIN_BOOTSTRAP_VERIFICATION.json) and [assessment](../architecture/UI_REFACTOR_TOOLCHAIN.md): skills/design-index setup only; 519 controlled tests plus a network-blocked browser engine smoke, no product rendering or live BE.

- [021 Planning handoff verification](planning-021/VERIFICATION.json), [native controlled browser](planning-021/BROWSER_VERIFICATION.json) and [implementation receipt](../sprints/021/021_Planning_Handoff_Integration.md): expanded Summary/PDF contracts, Assistant application boundary, N10 durable production caller. HTTP fixtures/local state/native browser storage are controlled evidence; live BE/full app E2E NOT_RUN.

- [MagicPath → FE visual convergence](visual-fidelity/MAGICPATH_FE_CONVERGENCE.md): current 13 source pins, copy provenance/removal ledger, typography candidates and controlled static component screenshots; PARTIAL, no live BE/E2E claim.
- [Final copy provenance](visual-fidelity/COPY_PROVENANCE_FINAL.json), [closure report](visual-fidelity/MAGICPATH_FE_CONVERGENCE.md#copy-provenance-adjudication-closure) and [verification](visual-fidelity/COPY_VERIFICATION.json): 4,131 classified producer/value occurrences, 14 removals, one explicit marketing-asset review case; 370 controlled tests and 22 before/after captures. Live BE/E2E NOT RUN; typography/geometry/full-shell acceptance remain separate.
- [Visual green design audit](VISUAL_GREEN_20261017_DESIGN_AUDIT.json) và [verification](PASS_020_VISUAL_GREEN_VERIFICATION.json): exact 13 canonical revisions, restrained palette, visual-only source checks and controlled regressions; FE browser/live acceptance NOT_RUN.
- [PASS_020_CLASSIFICATION_DRAFT_VERIFICATION.json](PASS_020_CLASSIFICATION_DRAFT_VERIFICATION.json): immediate classification-dependent mapping choices; 143 controlled Import tests, browser/live NOT_RUN.
- [LIVE_E2E_DESIGN_INVENTORY.json](LIVE_E2E_DESIGN_INVENTORY.json): baseline danh mục thiết kế/điều kiện; không phải chứng nhận live coverage.
- [BACKEND_CAPABILITY_COVERAGE.json](BACKEND_CAPABILITY_COVERAGE.json): inventory service/state được generator pin với contract; `npm run check:capabilities-wire` kiểm tra artifact này.
- [FREEZE_019_DESIGN_AUDIT.json](FREEZE_019_DESIGN_AUDIT.json) và [FREEZE_019_VERIFICATION.json](FREEZE_019_VERIFICATION.json): design pins, source fingerprints và kết quả tại freeze019.
- [PASS_020_BACKEND_HANDOFF_VERIFICATION.json](PASS_020_BACKEND_HANDOFF_VERIFICATION.json): afternoon020 offline tests and integrity checks; native IndexedDB/browser/live acceptance NOT_RUN.
- [PASS_020_CAPABILITY_AUDIT.json](PASS_020_CAPABILITY_AUDIT.json) và [PASS_020_VERIFICATION.json](PASS_020_VERIFICATION.json): audit 73 operations và evidence của implementation020.

Các JSON trên được giữ nguyên bytes trong lần sắp xếp thư mục. Kết quả chỉ có giá trị với source, contract, môi trường và phạm vi đã ghi. Controlled/mock/API-only pass không đồng nghĩa BE live acceptance. Path cũ trong frozen receipts được tra qua [manifest di chuyển](../PATHS.json).

## Live runs có phạm vi cụ thể

- [API smoke — 16/10/2026](live-runs/import-smoke-2026-10-16T08-29-02-943Z/README.md): một batch staging được nhận; Analyze job còn queued. Có Origin mismatch và contract drift ngoài scope; không phải UI/live acceptance toàn flow.
