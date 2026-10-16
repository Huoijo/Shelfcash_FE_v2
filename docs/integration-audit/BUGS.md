# Integration defect ledger

Document state: TEMPLATE_ONLY. Run ID: NOT_RECORDED. No discovery pass was executed and no new confirmed defects are asserted here. Do not interpret an empty ledger as evidence that the application has no defects.

Historical observations stay linked to their original runs. The user-reported macOS PID issue belongs in the environment/blocker record until supported by reproducible evidence; it is not automatically a new confirmed product defect.

## Defect record template

ID: TO_ASSIGN
Severity: P0 / P1 / P2 / P3 / P4
Area: NOT_RECORDED
Route: NOT_RECORDED
Role: NOT_RECORDED
Store context: NOT_RECORDED
Precondition: NOT_RECORDED
Case IDs / build / contract / design references: NOT_RECORDED

Steps to reproduce: NOT_RECORDED

Expected: NOT_RECORDED

Actual: NOT_RECORDED

Frontend evidence: NOT_RECORDED

Network evidence: NOT_RECORDED

Backend evidence: NOT_RECORDED

Console evidence: NOT_RECORDED

Screenshot/evidence path: NOT_RECORDED

Suspected integration boundary: NOT_RECORDED

Likely root cause: UNKNOWN until supported

Confidence: HIGH / MEDIUM / LOW

User impact / dependent blocked cases / safe stop: NOT_RECORDED

Owner / recommended next action / verification reference: NOT_RECORDED

## Severity for new discovery runs

- P0: security breach, destructive corruption, or a product defect making the application unusable.
- P1: critical user flow impossible, authorization bypass, wrong-Store data, or persistent data corruption.
- P2: materially broken feature, incorrect state transition, or failed error/recovery handling.
- P3: minor functional defect, confusing state, or recoverable inconsistency.
- P4: cosmetic/polish issue without meaningful functional impact.

Prioritize correctness and data integrity. An environmental outage does not by itself establish a P0 product defect. Confidence describes evidence strength; suspected root cause is not proven causation. Do not combine unrelated defects, regrade historical records silently, or fix defects during discovery.
