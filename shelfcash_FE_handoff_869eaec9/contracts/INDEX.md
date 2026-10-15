# Điều hướng canonical contracts

Nguồn duy nhất: main `869eaec914aa6905d6b935889afebe7d973004ae`. Bản sao dành cho handoff; prose không sửa. Local links được điều hướng sang tài liệu đã đóng gói hoặc chỉ mục nguồn bên dưới.

OpenAPI/DTO sở hữu wire; contracts sở hữu workflow/meaning/permissions. Các checkpoint cũ chưa đồng bộ được ghi tại [audit mismatch](../verification/DOC_MISMATCHES_VI.md). Không lấy proposal làm API hiện hành.

## Tài liệu đã đóng gói

- [docs/API_CONTRACT.md](./docs/API_CONTRACT.md)
- [docs/AUTHORIZATION_CONTRACT_VI.md](./docs/AUTHORIZATION_CONTRACT_VI.md)
- [docs/IMPORT_MAPPING_API_CONTRACT_VI.md](./docs/IMPORT_MAPPING_API_CONTRACT_VI.md)
- [docs/PROCUREMENT_API_CONTRACT_VI.md](./docs/PROCUREMENT_API_CONTRACT_VI.md)
- [docs/NOTIFICATION_API_CONTRACT_VI.md](./docs/NOTIFICATION_API_CONTRACT_VI.md)
- [docs/CONTRACT_COMPATIBILITY_CHANGELOG_VI.md](./docs/CONTRACT_COMPATIBILITY_CHANGELOG_VI.md)
- [docs/features/DATA_READINESS_POLICY.md](./docs/features/DATA_READINESS_POLICY.md)
- [docs/features/AUTH_SESSION.md](./docs/features/AUTH_SESSION.md)
- [docs/features/IMPORT_SCHEMA_INVENTORY.md](./docs/features/IMPORT_SCHEMA_INVENTORY.md)
- [docs/features/PUBLIC_PLANNING.md](./docs/features/PUBLIC_PLANNING.md)
- [docs/DECISIONS.md](./docs/DECISIONS.md)
- [docs/adr/ADR-001-backend-business-authority.md](./docs/adr/ADR-001-backend-business-authority.md)
- [docs/adr/ADR-004-bounded-llm.md](./docs/adr/ADR-004-bounded-llm.md)
- [docs/adr/ADR-007-postgresql-persistence-baseline.md](./docs/adr/ADR-007-postgresql-persistence-baseline.md)
- [docs/adr/ADR-010-data-completeness-and-missing-business-facts.md](./docs/adr/ADR-010-data-completeness-and-missing-business-facts.md)
- [docs/adr/ADR-012-observed-sales-forecast-execution-contract.md](./docs/adr/ADR-012-observed-sales-forecast-execution-contract.md)
- [docs/adr/ADR-013-future-store-mapping-approval-direction.md](./docs/adr/ADR-013-future-store-mapping-approval-direction.md)
- [docs/adr/ADR-015-trained-observed-sales-forecast.md](./docs/adr/ADR-015-trained-observed-sales-forecast.md)
- [docs/adr/ADR-020-product-requirements-procurement-selector.md](./docs/adr/ADR-020-product-requirements-procurement-selector.md)
- [docs/adr/ADR-021-operational-decision-v2-temporal-scope.md](./docs/adr/ADR-021-operational-decision-v2-temporal-scope.md)
- [docs/adr/ADR-022-internal-durable-planning.md](./docs/adr/ADR-022-internal-durable-planning.md)
- [docs/adr/ADR-A1-observed-stockout-demand-policy.md](./docs/adr/ADR-A1-observed-stockout-demand-policy.md)

## Nguồn không đóng gói hoặc anchor cần đối chiếu

Không cần đọc các nguồn này để bắt đầu tích hợp. Runbooks dài, source/tests và task notes không được đưa vào ZIP. Khi cần đối chiếu sâu, đọc đường dẫn dưới đây tại đúng SHA main bằng `git show <source-sha>:<path>`; không dùng WIP worktree. Các liên kết thiếu anchor được ghi lại, không giả rằng anchor tồn tại.

<a id="source-e88a27e78a41"></a>
- Original target: `IMPORT_SCHEMA_LEGACY_HANDOFF_VI.md`; source file có trong checkout.

<a id="source-2174205b6106"></a>
- Original target: `IMPORT_SCHEMA_LEGACY_HANDOFF_VI.md#4-liên-kết-nhiều-file-và-setup-store`; source file có trong checkout.

<a id="source-9140f471159e"></a>
- Original target: `app/application/contracts/forecast_eligibility.py`; source file có trong checkout.

<a id="source-c641af8cea3d"></a>
- Original target: `app/application/contracts/import_mapping.py`; source file có trong checkout.

<a id="source-432478caa7d3"></a>
- Original target: `app/application/contracts/offer_admission.py`; source file có trong checkout.

<a id="source-a87423b8684c"></a>
- Original target: `app/application/contracts/procurement_v2.py`; source file có trong checkout.

<a id="source-3ef2b281031b"></a>
- Original target: `app/application/contracts/readiness.py`; source file có trong checkout.

<a id="source-82100e79bdc6"></a>
- Original target: `app/application/decision_capture_v2_validation.py`; source file có trong checkout.

<a id="source-e87aa431fb9b"></a>
- Original target: `app/application/forecast_demand.py`; source file có trong checkout.

<a id="source-3b2a018ba378"></a>
- Original target: `app/application/forecast_preparation.py`; source file có trong checkout.

<a id="source-79c5dc021191"></a>
- Original target: `app/application/import_configuration_preview.py`; source file có trong checkout.

<a id="source-6d89cf8b7cc3"></a>
- Original target: `app/application/import_preview.py`; source file có trong checkout.

<a id="source-a9cb5347c52a"></a>
- Original target: `app/application/operational_import_facts.py`; source file có trong checkout.

<a id="source-e28042e05547"></a>
- Original target: `app/application/planning_context_projection.py`; source file có trong checkout.

<a id="source-4ca3b59a3add"></a>
- Original target: `app/application/planning_public_projection.py`; source file có trong checkout.

<a id="source-e1299aa68278"></a>
- Original target: `app/application/procurement_v2_validation.py`; source file có trong checkout.

<a id="source-3e70b96406be"></a>
- Original target: `app/application/readiness_evaluation.py`; source file có trong checkout.

<a id="source-f19419b8b789"></a>
- Original target: `app/application/use_cases/bom.py`; source file có trong checkout.

<a id="source-d7f422fc1fc7"></a>
- Original target: `app/application/use_cases/forecast_baseline.py`; source file có trong checkout.

<a id="source-5bb1594cd32f"></a>
- Original target: `app/application/use_cases/forecast_serving.py`; source file có trong checkout.

<a id="source-d43430494a5b"></a>
- Original target: `app/application/use_cases/forecast_trained_execution.py`; source file có trong checkout.

<a id="source-cbc9f42063f3"></a>
- Original target: `app/application/use_cases/import_staging.py`; source file có trong checkout.

<a id="source-2be36e86ccd1"></a>
- Original target: `app/application/use_cases/model_serving.py`; source file có trong checkout.

<a id="source-784891f6c72b"></a>
- Original target: `app/application/use_cases/planning_public.py`; source file có trong checkout.

<a id="source-955989268101"></a>
- Original target: `app/application/use_cases/planning_setup.py`; source file có trong checkout.

<a id="source-ba71729760a1"></a>
- Original target: `app/application/use_cases/readiness.py`; source file có trong checkout.

<a id="source-c527b14e891b"></a>
- Original target: `app/domain/demand/bom.py`; source file có trong checkout.

<a id="source-55bf457ce7a9"></a>
- Original target: `app/domain/forecasting/baseline.py`; source file có trong checkout.

<a id="source-c1c54483e5db"></a>
- Original target: `app/domain/forecasting/stockout.py`; source file có trong checkout.

<a id="source-1d995ae40bb5"></a>
- Original target: `app/domain/forecasting/validation.py`; source file có trong checkout.

<a id="source-e48bed295c6f"></a>
- Original target: `app/infrastructure/database/planning_capture.py`; source file có trong checkout.

<a id="source-f4f14f0406e4"></a>
- Original target: `app/infrastructure/forecast_model.py`; source file có trong checkout.

<a id="source-e562db6197dc"></a>
- Original target: `app/infrastructure/storage/forecast_artifacts.py`; source file có trong checkout.

<a id="source-5952391df085"></a>
- Original target: `docs/CURRENT_STATE.md`; source file có trong checkout.

<a id="source-0d96796e2b2a"></a>
- Original target: `docs/ROADMAP.md`; source file có trong checkout.

<a id="source-36c7600f81eb"></a>
- Original target: `docs/adr/ADR-002-modular-monolith.md`; source file có trong checkout.

<a id="source-e9e0a97b2156"></a>
- Original target: `docs/adr/ADR-003-sqlite-persistence.md`; source file có trong checkout.

<a id="source-89a0444e968f"></a>
- Original target: `docs/adr/ADR-005-decision-run-snapshot.md`; source file có trong checkout.

<a id="source-63857e02cf2a"></a>
- Original target: `docs/adr/ADR-006-hypothetical-what-if.md`; source file có trong checkout.

<a id="source-5649790d9e66"></a>
- Original target: `docs/adr/ADR-008-import-idempotency-correction-policy.md`; source file có trong checkout.

<a id="source-a6b787bfb745"></a>
- Original target: `docs/adr/ADR-009-inventory-mutation-audit-policy.md`; source file có trong checkout.

<a id="source-e42ac0675ba9"></a>
- Original target: `docs/adr/ADR-011-historical-run-immutability-snapshot-policy.md`; source file có trong checkout.

<a id="source-10d13c6b3e12"></a>
- Original target: `docs/adr/ADR-014-retained-baseline-execution.md`; source file có trong checkout.

<a id="source-57c5efb0dbf6"></a>
- Original target: `docs/adr/ADR-016-decision-contracts-provisional-demo-policy.md`; source file có trong checkout.

<a id="source-7f2e38a584d5"></a>
- Original target: `docs/adr/ADR-017-serving-fefo-provisional-direction.md`; source file có trong checkout.

<a id="source-a277b790a218"></a>
- Original target: `docs/adr/ADR-018-procurement-optimization-review.md`; source file có trong checkout.

<a id="source-6255764fd530"></a>
- Original target: `docs/adr/ADR-019-internal-procurement-engine.md`; source file có trong checkout.

<a id="source-d83e0a48bd37"></a>
- Original target: `docs/features/APPLICATION_CONTRACTS.md`; source file có trong checkout.

<a id="source-b8b9b6c444f0"></a>
- Original target: `docs/features/DECISION_OPERATIONAL_V2.md`; source file có trong checkout.

<a id="source-d75c8b99efa0"></a>
- Original target: `docs/features/IMPORT_FIELD_VALUE_BINDINGS.md`; source file có trong checkout.

<a id="source-097f3156af5b"></a>
- Original target: `docs/features/IMPORT_INVENTORY_SUPPLIER.md`; source file có trong checkout.

<a id="source-07f662895c1a"></a>
- Original target: `docs/features/IMPORT_STAGING_PREVIEW.md`; source file có trong checkout.

<a id="source-ea604a353a02"></a>
- Original target: `docs/features/PROCUREMENT_V2.md`; source file có trong checkout.

<a id="source-130aff0d743b"></a>
- Original target: `docs/features/RECIPE_SCHEDULE.md`; source file có trong checkout.

<a id="source-c3d8dd00f914"></a>
- Original target: `docs/features/STAFF_PERMISSIONS_INVITATIONS.md`; source file có trong checkout.

<a id="source-55a8b95a0bb0"></a>
- Original target: `docs/features/examples/planning_public/README.md`; source file có trong checkout.

<a id="source-eee7461410f4"></a>
- Original target: `docs/features/examples/s410/README.md`; source file có trong checkout.

<a id="source-9e1e590ccc6f"></a>
- Original target: `docs/handoff/openapi.json`; source file có trong checkout.

<a id="source-d3bf9725104b"></a>
- Original target: `docs/handoff/openapi_diff_fe54.json`; source file có trong checkout.

<a id="source-a3598c2ee77d"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md`; source file có trong checkout.

<a id="source-08daed4bf84d"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#b4-authstaff-acceptance-without-fe-or-smtp`; source file có trong checkout.

<a id="source-6c6ec76a9667"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#collaboration-c2`; source file có trong checkout.

<a id="source-508e5584d5de"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#customer-self-service`; source file có trong checkout.

<a id="source-74621df32c03"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#data-readiness-d2`; source file có trong checkout.

<a id="source-65612cf5b151"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#data-readiness-d3`; source file có trong checkout.

<a id="source-0f18d38983c5"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#data-readiness-d4`; source file có trong checkout.

<a id="source-d8d4f638a81f"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#data-readiness-d5`; source file có trong checkout.

<a id="source-cb8acecb4726"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#excel-actual-receipt-c3`; source file có trong checkout.

<a id="source-817fa29d6396"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#integrated-demo-runtime`; source file có trong checkout.

<a id="source-5d6f45c9df67"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#notifications-c1`; source file có trong checkout.

<a id="source-73dd96633d6a"></a>
- Original target: `docs/runbooks/FULL_TEST_FLOW.md#read-discovery-c4`; source file có trong checkout.

<a id="source-5b2e1e9fdd4a"></a>
- Original target: `tests/fixtures/openapi_20261010.json`; source file có trong checkout.

<a id="source-a03f42169423"></a>
- Original target: `tests/integration/test_data_readiness_acceptance.py`; source file có trong checkout.

<a id="source-6b0df0d916d6"></a>
- Original target: `tests/integration/test_decision_operational_v2.py`; source file có trong checkout.

<a id="source-c7d6604da7b3"></a>
- Original target: `tests/integration/test_forecast_readiness.py`; source file có trong checkout.

<a id="source-92d095ddbbb9"></a>
- Original target: `tests/integration/test_forecast_serving.py`; source file có trong checkout.

<a id="source-35d97d2d4705"></a>
- Original target: `tests/integration/test_forecast_stockout_a1.py`; source file có trong checkout.

<a id="source-162e16da8193"></a>
- Original target: `tests/integration/test_forecast_trained_execution.py`; source file có trong checkout.

<a id="source-87dd3599ea44"></a>
- Original target: `tests/integration/test_import_readiness_snapshot.py`; source file có trong checkout.

<a id="source-40dc4386c5c2"></a>
- Original target: `tests/integration/test_import_supplier_basis.py`; source file có trong checkout.

<a id="source-fb42b2ff7347"></a>
- Original target: `tests/integration/test_planning_configuration_resolution.py`; source file có trong checkout.

<a id="source-aae3f1f022ea"></a>
- Original target: `tests/integration/test_planning_offer_admission.py`; source file có trong checkout.

<a id="source-de35bc90828c"></a>
- Original target: `tests/integration/test_planning_public_sources.py`; source file có trong checkout.

<a id="source-08b2920eb46c"></a>
- Original target: `tests/integration/test_readiness_context.py`; source file có trong checkout.

<a id="source-7bbf7e602141"></a>
- Original target: `tests/unit/test_bom.py`; source file có trong checkout.

<a id="source-0a84052705d7"></a>
- Original target: `tests/unit/test_forecast_artifacts.py`; source file có trong checkout.

<a id="source-dfc22dcc094e"></a>
- Original target: `tests/unit/test_forecast_baseline.py`; source file có trong checkout.

<a id="source-c188a624adcb"></a>
- Original target: `tests/unit/test_forecast_eligibility.py`; source file có trong checkout.

<a id="source-5abbf4b711ba"></a>
- Original target: `tests/unit/test_forecast_execution.py`; source file có trong checkout.

<a id="source-c5ee81354848"></a>
- Original target: `tests/unit/test_import_inventory_completeness.py`; source file có trong checkout.

<a id="source-0a1e185597d3"></a>
- Original target: `tests/unit/test_import_preview.py`; source file có trong checkout.

<a id="source-45a6c0b47446"></a>
- Original target: `tests/unit/test_offer_admission.py`; source file có trong checkout.

<a id="source-fad90b67d1ce"></a>
- Original target: `tests/unit/test_procurement_v2.py`; source file có trong checkout.

<a id="source-781790f63551"></a>
- Original target: `tests/unit/test_stockout_readiness.py`; source file có trong checkout.
