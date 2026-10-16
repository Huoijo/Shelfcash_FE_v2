# Phase 1: FE-BE system map

Template status: NOT_RUN. No routes/endpoints have been inventoried for this new audit.

## Frontend inventory obligations

Inventory public/authenticated/nested routes; sidebar and other navigation destinations; API clients; query/mutation hooks; DTOs/validators; role and permission checks; Store-scoped state; loaders; empty/error states; forms; dialogs/drawers; pagination/filtering/sorting; URL/search parameters; browser history; local/session storage; and cache/state management.

For each entry record its source location, reachable entry point, current design revision, state guards, API operations, and associated case IDs. Include nested controls, automatic transitions, and disabled/parked entries with explicit scope disposition.

## Backend inventory obligations

Inventory paths/methods; path/query/body schemas; response schemas/envelopes/statuses; enums/nullability/omission semantics; validation; authorization and Store ownership; pagination/filtering/sorting; lifecycle transitions; database constraints; idempotency/CAS; retained readers; and documented errors.

Inspect both repositories and the deployment contract. Generated service coverage is not proof of a reachable FE caller or live UI acceptance. Database access is not automatically authorized by repository access.

## Boundary record template

```yaml
boundary_id: TO_ASSIGN
fe_route_component_source: NOT_RECORDED
reachable_entry_point: NOT_RECORDED
fe_client_hook_validator: NOT_RECORDED
backend_operation_method_path: NOT_RECORDED
request_contract_and_pins: NOT_RECORDED
response_contract_and_statuses: NOT_RECORDED
role_permission_store_requirements: NOT_RECORDED
expected_ui_states_and_transitions: NOT_RECORDED
retained_readback_and_recovery: NOT_RECORDED
case_ids: []
finding_ids: []
```

## Initial mismatch categories

Check missing/unused endpoints, method/path/field/enum/nullability mismatches, wrong IDs/Store/query parameters, pagination disagreements, and false success/error assumptions. A backend-only capability must be classified as missing user UI, adequate-design implementation debt, internal-only, not-required, already covered, or explicitly parked; do not infer a new product requirement solely from endpoint availability.

All discovered execution cases must be entered in COVERAGE_MATRIX.md before the browser sweep. Record findings in BUGS.md before modifying product code.
