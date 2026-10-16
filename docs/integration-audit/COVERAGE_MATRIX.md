# Integration coverage matrix

Document state: TEMPLATE_ONLY. Assignment mode: PREPARATION_ONLY. Run ID: NOT_RECORDED.

No concrete execution cases have been inventoried or run for this package. Counts and coverage denominators are NOT_CALCULATED. The record below is a template, not a counted case.

## Case record template

```yaml
case_id: TO_ASSIGN
phase_and_area: NOT_RECORDED
status: NOT_RUN
execution_mode: NOT_RECORDED
fe_be_build_contract_design_refs: NOT_RECORDED
route_surface_control_and_transition: NOT_RECORDED
role_session_and_permission_variant: NOT_RECORDED
store_context_and_resource_ids: NOT_RECORDED
dataset_baseline_and_independent_oracle: NOT_RECORDED
data_and_lifecycle_state: NOT_RECORDED
preconditions: NOT_RECORDED
action_and_expected_navigation: NOT_RECORDED
backend_boundary_and_expected_request_response: NOT_RECORDED
expected_pending_error_recovery_ui: NOT_RECORDED
expected_persisted_effects_and_no_effects: NOT_RECORDED
refresh_deep_link_and_cache_expectation: NOT_RECORDED
actual_observation: NOT_RECORDED
evidence_refs: []
defect_ids: []
blocker_type_and_dependency: NOT_RECORDED
scope_disposition_and_authority: NOT_RECORDED
not_applicable_reason_and_guard: NOT_RECORDED
timestamp_and_tester: NOT_RECORDED
```

## Required status semantics

- NOT_RUN: discovered case not executed; not an implicit PASS.
- PASS: applicable expectations, UI/network/authoritative state, and required persistence/recovery evidence agree. A correctly enforced negative case can PASS.
- FAIL: observed departure from an authoritative expectation. Link a reproducible defect; do not conceal a broken committed capability as a mere blocker.
- BLOCKED: a prerequisite prevents evaluation. Record ENVIRONMENT/PLATFORM/DATA/CONTRACT/DESIGN/FE/BE separately, with dependency, evidence, owner, and next action.
- NOT_APPLICABLE: a proven impossible/inapplicable combination with guard/contract and scope authority. Missing accounts/data/environment are not N/A.

Record STATIC_ONLY, API_ONLY, LIVE_UI, LIVE_WITH_FAULT_INJECTION, CONTROLLED, or MOCK as a separate execution mode. Do not combine their PASS counts into a live UI acceptance number.

## Completion accounting

Account for all discovered routes, consumers, relevant endpoints, states, controls/edges, roles/grants, Stores, datasets, and mutations. Include success/failure, authorization, refresh/deep-link, and an additional exploratory sweep. Log newly discovered cases rather than excluding them from the denominator.

At report time, reconcile total = NOT_RUN + PASS + FAIL + BLOCKED + NOT_APPLICABLE for actual case records. Count scoped exclusions and blocker categories separately. No average coverage score can override an authorization, isolation, atomicity, or data-integrity failure. Do not close discovery as complete with NOT_RUN cases or an incomplete inventory; use an explicitly limited report instead.
