# Backend truth and recovery

Scope: API integration, protected application state and integration verification.

- Preserve backend unknown/null, outcome, snapshot labels, units, comparison direction, proof limits and duplicate business lines. Do not recalculate recommendations, causal explanations, Summary or PDF content in FE.
- Treat clarification as a successful branch requiring explicit identity selection; never auto-select a candidate. Deterministic fallback with a usable answer is a valid result, independent of Planning execution status.
- Fresh permission/session/resource denial overrides cached protected facts. Clear visible accumulated pages, conversation/context and pending read results; fence late responses on actor/Store/evidence changes.
- Persist only reviewed allowlisted intent fields before dispatch. Storage failure blocks dispatch. Never persist credentials, cookies, CSRF, or free text excluded by the journal policy.
- Unknown mutation outcome, missing/empty readers and denied replay do not establish no-effect. Restore without dispatch; explicit recovery retains original operation/key/body/CAS. Never reconstruct a missing request from metadata or mint a replacement automatically.
- A known receipt is separate from its async job and download. Poll bounded readers using the server interval; download failure does not create a new job. Do not replay a POST merely to poll progress.
- Label mock, intercepted HTTP, local simulation, native browser storage, live API and live UI evidence separately. Source-ready contracts are not deployment proof.
- API/application state can precede UI. Missing canonical interactions stay pending in the current register; a shared visual pattern alone does not authorize new product flows.
