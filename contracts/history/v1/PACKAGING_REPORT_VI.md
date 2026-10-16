# Báo cáo packaging — shelfcash-fe-handoff/1-20261009-184259

09/10/2026; snapshot documentation, 53 canonical core routes đã review design.
Không runtime/API acceptance. References: 17 tài liệu trực tiếp;
omissions: 46 đích tham chiếu phụ thuộc (xem README).

Kiểm tra bắt buộc khi tạo gói: ZIP mở được/CRC, paths an toàn, entry duy nhất;
manifest khớp mọi payload; links và anchors nằm trong gói; JSON examples parse;
contract copy khớp nguồn hoặc chỉ đổi đường dẫn link; sources/WIP giữ nguyên.
Chỉ Markdown + manifest `.txt`, không source/binaries/raw data/credentials/token thật.

## Hash nguồn và bản copy

| File trong gói | Nguồn repo | SHA-256 nguồn | SHA-256 copy | Diff |
| --- | --- | --- | --- | --- |
| `AUTHORIZATION_CONTRACT_VI.md` | `docs/AUTHORIZATION_CONTRACT_VI.md` | `d563310fca9e266be2cfe9df873f12bb32ec2a2941a9c737124903c516e2233b` | `d563310fca9e266be2cfe9df873f12bb32ec2a2941a9c737124903c516e2233b` | `Khớp byte nguồn` |
| `CATALOG_MENU_RECIPE_API_CONTRACT_VI.md` | `docs/CATALOG_MENU_RECIPE_API_CONTRACT_VI.md` | `1e97404a37ba77e46aaab8bfdf2b95d51d610a8434e5c355685de107b5fac52d` | `17e265d462ba6ed738e57a57d4b576fd9b1c87e22dc3b37eaa2380bac4246d0f` | `Chỉ rewrite đường dẫn link` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `docs/IMPORT_MAPPING_API_CONTRACT_VI.md` | `0e050049988b0ad186edcd84ee97954ba37be4bc36ac1f8c2ea6588281b5f7ac` | `cbb8fdbec51449b5ff176443e7a2555d016246a1f948d45b5b4de699a8fd6956` | `Chỉ rewrite đường dẫn link` |
| `INVENTORY_API_CONTRACT_VI.md` | `docs/INVENTORY_API_CONTRACT_VI.md` | `945b47adc4447cae3e94f25d0b5274af979b424e3ea2d184f5719ca1e6767def` | `1dc8fb440089a8176630c39c0d6a5573700b87ab2e5b8882d1f26bee62e50745` | `Chỉ rewrite đường dẫn link` |
| `PROCUREMENT_API_CONTRACT_VI.md` | `docs/PROCUREMENT_API_CONTRACT_VI.md` | `67bfc16ccc9e2569dacb69829bf13eba534bbbca0ed8a3048c5178de0ae5f8ac` | `16b86003d3dd300586011af3295190017defdfb26b804e095ebef20a20566b3f` | `Chỉ rewrite đường dẫn link` |
| `SHELFCASH_API_CONTRACT_V1_VI.md` | `docs/SHELFCASH_API_CONTRACT_V1_VI.md` | `56e99dde5fc011d11fa384ce553f0fb339731fc1c15af158d1384d522b9fa198` | `cc42ed65b1fb6fe679118be669585634aba8a395b62e14c3721f0c5f3202a602` | `Chỉ rewrite đường dẫn link` |
| `references/AGENTS.md` | `AGENTS.md` | `01f86fea654b3f21510472c73e298b1d24a4ed07567263eb0d30055698f6c8ee` | `01f86fea654b3f21510472c73e298b1d24a4ed07567263eb0d30055698f6c8ee` | `Khớp byte nguồn` |
| `references/API_CONTRACT.md` | `docs/API_CONTRACT.md` | `dd56a299396749044a320de4f5b4a33813359a322e31819bd54a45e39d6918ed` | `e0e83f92720664f582bcffe05228fc77fcd607565de85701aca86c99b2401011` | `Chỉ rewrite đường dẫn link` |
| `references/CURRENT_STATE.md` | `docs/CURRENT_STATE.md` | `ac45502c0a502d90999a2914db530f384a03a85e5536a166fb085c8092557ca7` | `75c27750f05c69c17f774852f5ca74a4219c92292c44d5904aed7fe9d4225b0e` | `Chỉ rewrite đường dẫn link` |
| `references/ShelfCash_FE_BE_API_CONTRACT_v0.md` | `docs/ShelfCash_FE_BE_API_CONTRACT_v0.md` | `648946afd476324603b7cdf8a7b810c41eaeb5cdbab0a1357aec49cb79cf6dde` | `648946afd476324603b7cdf8a7b810c41eaeb5cdbab0a1357aec49cb79cf6dde` | `Khớp byte nguồn` |
| `references/adr/ADR-008-import-idempotency-correction-policy.md` | `docs/adr/ADR-008-import-idempotency-correction-policy.md` | `4712f187c7e40693527db0391b8bb7c933d223e2b6be15e840ca3a6bf9a03d7a` | `4712f187c7e40693527db0391b8bb7c933d223e2b6be15e840ca3a6bf9a03d7a` | `Khớp byte nguồn` |
| `references/adr/ADR-009-inventory-mutation-audit-policy.md` | `docs/adr/ADR-009-inventory-mutation-audit-policy.md` | `da0f2273a59056a8902a1868d4274c1c9f2d2e126c8be78e1cee98d9c8ec0883` | `da0f2273a59056a8902a1868d4274c1c9f2d2e126c8be78e1cee98d9c8ec0883` | `Khớp byte nguồn` |
| `references/adr/ADR-010-data-completeness-and-missing-business-facts.md` | `docs/adr/ADR-010-data-completeness-and-missing-business-facts.md` | `d25a2f7459203e896f26ec02b179368252cf58571bb5893d9c97a6e841bbb9bf` | `d25a2f7459203e896f26ec02b179368252cf58571bb5893d9c97a6e841bbb9bf` | `Khớp byte nguồn` |
| `references/adr/ADR-011-historical-run-immutability-snapshot-policy.md` | `docs/adr/ADR-011-historical-run-immutability-snapshot-policy.md` | `6d71ab44e0dc8e8e47de81bd4bf7182b07b6fefb73810e22689712ad54b0a452` | `6d71ab44e0dc8e8e47de81bd4bf7182b07b6fefb73810e22689712ad54b0a452` | `Khớp byte nguồn` |
| `references/adr/ADR-013-future-store-mapping-approval-direction.md` | `docs/adr/ADR-013-future-store-mapping-approval-direction.md` | `4f71fc86f0c66b3c5b39b06791a08dfc74a8da0f9301b14b2a6b3f2e05cfed1e` | `4f71fc86f0c66b3c5b39b06791a08dfc74a8da0f9301b14b2a6b3f2e05cfed1e` | `Khớp byte nguồn` |
| `references/adr/ADR-020-product-requirements-procurement-selector.md` | `docs/adr/ADR-020-product-requirements-procurement-selector.md` | `d1b6ee0049d76b41b3c7dae3e4223d9947af07d320e147b1641501a1cc5aad88` | `e398091ca073257e66c91d76670cf3bf73c5a6a259fa1ad5c18458da422de974` | `Chỉ rewrite đường dẫn link` |
| `references/features/APPLICATION_CONTRACTS.md` | `docs/features/APPLICATION_CONTRACTS.md` | `4515618b3a9dd550c854a467c787b7fd5521a1fc249bf125b44c12e16b0879d4` | `eb17758f4ba6dfe85850b7631ca08ff0b4fc6a269855d76776c0ac567fb7c2ea` | `Chỉ rewrite đường dẫn link` |
| `references/features/DECISION_OPERATIONAL_PIPELINE.md` | `docs/features/DECISION_OPERATIONAL_PIPELINE.md` | `9d941c0737e345824ab29432c2e267e874001d334d9f24b95008210b932fe87f` | `f6545f7703eed952cd722cccf9f43c40c5dda9d59dd77a835e00e0e03c2ff488` | `Chỉ rewrite đường dẫn link` |
| `references/features/DECISION_OPERATIONAL_V2.md` | `docs/features/DECISION_OPERATIONAL_V2.md` | `7ef1f72e7dd6047c3be2c6ad46d473b6ccedc5fb9ac643d1db3370eadb86ee8a` | `30071f1f3035acb5f1185fd3e794d241f93f8c3be789e6e5797629f2e24c42fb` | `Chỉ rewrite đường dẫn link` |
| `references/features/IMPORT_MAPPING.md` | `docs/features/IMPORT_MAPPING.md` | `1bb8ece13f5d6e583cea3887400640329bd26a43012b5f3f0376edfcd7664246` | `1bb8ece13f5d6e583cea3887400640329bd26a43012b5f3f0376edfcd7664246` | `Khớp byte nguồn` |
| `references/features/PLANNING_RUN.md` | `docs/features/PLANNING_RUN.md` | `e792b5ddc360d4f61873ab4282af715b1640d3ddaae6d68230422de8f83cda47` | `e792b5ddc360d4f61873ab4282af715b1640d3ddaae6d68230422de8f83cda47` | `Khớp byte nguồn` |
| `references/reports/S361_PROCUREMENT_VERIFICATION.md` | `docs/reports/S361_PROCUREMENT_VERIFICATION.md` | `9297c537002f410499621513738aadf22768525d36728201a2f50622d6df423f` | `9297c537002f410499621513738aadf22768525d36728201a2f50622d6df423f` | `Khớp byte nguồn` |
| `references/runbooks/S364_TASK_NOTES.md` | `docs/runbooks/S364_TASK_NOTES.md` | `8232fb2f152f31ae4ccd82b8147aea734bfa01733ec0ac5a22c26bcc8441f8b1` | `8232fb2f152f31ae4ccd82b8147aea734bfa01733ec0ac5a22c26bcc8441f8b1` | `Khớp byte nguồn` |

## Rewrite đường dẫn (chỉ bản copy)

| File | Đường dẫn nguồn | Đường dẫn copy |
| --- | --- | --- |
| `CATALOG_MENU_RECIPE_API_CONTRACT_VI.md` | `ShelfCash_FE_BE_API_CONTRACT_v0.md` | `references/ShelfCash_FE_BE_API_CONTRACT_v0.md` |
| `CATALOG_MENU_RECIPE_API_CONTRACT_VI.md` | `features/APPLICATION_CONTRACTS.md` | `references/features/APPLICATION_CONTRACTS.md` |
| `CATALOG_MENU_RECIPE_API_CONTRACT_VI.md` | `adr/ADR-011-historical-run-immutability-snapshot-policy.md` | `references/adr/ADR-011-historical-run-immutability-snapshot-policy.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `../AGENTS.md` | `references/AGENTS.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `ShelfCash_FE_BE_API_CONTRACT_v0.md` | `references/ShelfCash_FE_BE_API_CONTRACT_v0.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `features/IMPORT_MAPPING.md` | `references/features/IMPORT_MAPPING.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `adr/ADR-008-import-idempotency-correction-policy.md` | `references/adr/ADR-008-import-idempotency-correction-policy.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `adr/ADR-009-inventory-mutation-audit-policy.md` | `references/adr/ADR-009-inventory-mutation-audit-policy.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `adr/ADR-010-data-completeness-and-missing-business-facts.md` | `references/adr/ADR-010-data-completeness-and-missing-business-facts.md` |
| `IMPORT_MAPPING_API_CONTRACT_VI.md` | `adr/ADR-013-future-store-mapping-approval-direction.md` | `references/adr/ADR-013-future-store-mapping-approval-direction.md` |
| `INVENTORY_API_CONTRACT_VI.md` | `ShelfCash_FE_BE_API_CONTRACT_v0.md#9-inventory--kho` | `references/ShelfCash_FE_BE_API_CONTRACT_v0.md#9-inventory--kho` |
| `INVENTORY_API_CONTRACT_VI.md` | `adr/ADR-009-inventory-mutation-audit-policy.md` | `references/adr/ADR-009-inventory-mutation-audit-policy.md` |
| `INVENTORY_API_CONTRACT_VI.md` | `adr/ADR-010-data-completeness-and-missing-business-facts.md` | `references/adr/ADR-010-data-completeness-and-missing-business-facts.md` |
| `PROCUREMENT_API_CONTRACT_VI.md` | `CURRENT_STATE.md` | `references/CURRENT_STATE.md` |
| `PROCUREMENT_API_CONTRACT_VI.md` | `adr/ADR-020-product-requirements-procurement-selector.md` | `references/adr/ADR-020-product-requirements-procurement-selector.md` |
| `PROCUREMENT_API_CONTRACT_VI.md` | `reports/S361_PROCUREMENT_VERIFICATION.md` | `references/reports/S361_PROCUREMENT_VERIFICATION.md` |
| `PROCUREMENT_API_CONTRACT_VI.md` | `features/DECISION_OPERATIONAL_PIPELINE.md` | `references/features/DECISION_OPERATIONAL_PIPELINE.md` |
| `PROCUREMENT_API_CONTRACT_VI.md` | `features/DECISION_OPERATIONAL_V2.md` | `references/features/DECISION_OPERATIONAL_V2.md` |
| `SHELFCASH_API_CONTRACT_V1_VI.md` | `ShelfCash_FE_BE_API_CONTRACT_v0.md` | `references/ShelfCash_FE_BE_API_CONTRACT_v0.md` |
| `SHELFCASH_API_CONTRACT_V1_VI.md` | `API_CONTRACT.md` | `references/API_CONTRACT.md` |
| `SHELFCASH_API_CONTRACT_V1_VI.md` | `runbooks/S364_TASK_NOTES.md` | `references/runbooks/S364_TASK_NOTES.md` |
| `SHELFCASH_API_CONTRACT_V1_VI.md` | `features/PLANNING_RUN.md` | `references/features/PLANNING_RUN.md` |
| `SHELFCASH_API_CONTRACT_V1_VI.md` | `../AGENTS.md` | `references/AGENTS.md` |
| `references/API_CONTRACT.md` | `PROCUREMENT_API_CONTRACT_VI.md` | `../PROCUREMENT_API_CONTRACT_VI.md` |
| `references/CURRENT_STATE.md` | `reports/S363_SMALL_DOMAIN_VERIFICATION.md` | `../README_VI.md#omission-027` |
| `references/CURRENT_STATE.md` | `features/PLANNING_SETUP_RESOLVER.md` | `../README_VI.md#omission-011` |
| `references/CURRENT_STATE.md` | `runbooks/S363_TASK_NOTES.md` | `../README_VI.md#omission-046` |
| `references/CURRENT_STATE.md` | `runbooks/S362_TASK_NOTES.md` | `../README_VI.md#omission-045` |
| `references/CURRENT_STATE.md` | `reports/S362_POSTGRESQL_ACCEPTANCE.md` | `../README_VI.md#omission-026` |
| `references/CURRENT_STATE.md` | `adr/ADR-021-operational-decision-v2-temporal-scope.md` | `../README_VI.md#omission-004` |
| `references/CURRENT_STATE.md` | `PROCUREMENT_API_CONTRACT_VI.md` | `../PROCUREMENT_API_CONTRACT_VI.md` |
| `references/CURRENT_STATE.md` | `runbooks/S361_TASK_NOTES.md` | `../README_VI.md#omission-044` |
| `references/CURRENT_STATE.md` | `features/PROCUREMENT_V2.md` | `../README_VI.md#omission-017` |
| `references/CURRENT_STATE.md` | `runbooks/S352_TASK_NOTES.md` | `../README_VI.md#omission-043` |
| `references/CURRENT_STATE.md` | `reports/S352_POSTGRESQL_ACCEPTANCE.md` | `../README_VI.md#omission-025` |
| `references/CURRENT_STATE.md` | `features/PROCUREMENT_COMPARISON.md` | `../README_VI.md#omission-012` |
| `references/CURRENT_STATE.md` | `runbooks/S351_TASK_NOTES.md` | `../README_VI.md#omission-042` |
| `references/CURRENT_STATE.md` | `adr/ADR-019-internal-procurement-engine.md` | `../README_VI.md#omission-003` |
| `references/CURRENT_STATE.md` | `features/PROCUREMENT_ENGINE.md` | `../README_VI.md#omission-014` |
| `references/CURRENT_STATE.md` | `runbooks/S344_TASK_NOTES.md` | `../README_VI.md#omission-041` |
| `references/CURRENT_STATE.md` | `reports/S344_PROCUREMENT_VERIFICATION.md` | `../README_VI.md#omission-024` |
| `references/CURRENT_STATE.md` | `reports/S343_PROCUREMENT_NUMERIC_BENCHMARK.md` | `../README_VI.md#omission-023` |
| `references/CURRENT_STATE.md` | `runbooks/S343_TASK_NOTES.md` | `../README_VI.md#omission-040` |
| `references/CURRENT_STATE.md` | `reports/S342_PROCUREMENT_BENCHMARK.md` | `../README_VI.md#omission-022` |
| `references/CURRENT_STATE.md` | `runbooks/S342_TASK_NOTES.md` | `../README_VI.md#omission-039` |
| `references/CURRENT_STATE.md` | `features/PROCUREMENT_DESIGN.md` | `../README_VI.md#omission-013` |
| `references/CURRENT_STATE.md` | `features/PROCUREMENT_FORMULATION.md` | `../README_VI.md#omission-015` |
| `references/CURRENT_STATE.md` | `features/PROCUREMENT_GOLDEN_CASES.md` | `../README_VI.md#omission-016` |
| `references/CURRENT_STATE.md` | `runbooks/S341_TASK_NOTES.md` | `../README_VI.md#omission-038` |
| `references/CURRENT_STATE.md` | `TESTING.md` | `../README_VI.md#omission-001` |
| `references/CURRENT_STATE.md` | `runbooks/FULL_TEST_FLOW.md` | `../README_VI.md#omission-028` |
| `references/CURRENT_STATE.md` | `features/DECISION_DESIGN.md` | `../README_VI.md#omission-006` |
| `references/CURRENT_STATE.md` | `features/DECISION_GOLDEN_CASES.md` | `../README_VI.md#omission-007` |
| `references/CURRENT_STATE.md` | `runbooks/S31_TASK_NOTES.md` | `../README_VI.md#omission-034` |
| `references/CURRENT_STATE.md` | `features/FORECAST_TRAINED.md` | `../README_VI.md#omission-009` |
| `references/CURRENT_STATE.md` | `runbooks/S2_TRAINED_TASK_NOTES.md` | `../README_VI.md#omission-033` |
| `references/CURRENT_STATE.md` | `reports/S2_SYNTHETIC_COMPARISON.md` | `../README_VI.md#omission-021` |
| `references/CURRENT_STATE.md` | `features/FORECAST_EXECUTION.md` | `../README_VI.md#omission-008` |
| `references/CURRENT_STATE.md` | `features/PERSISTENCE_ACCESS.md` | `../README_VI.md#omission-010` |
| `references/CURRENT_STATE.md` | `runbooks/S16_VERIFICATION.md` | `../README_VI.md#omission-030` |
| `references/CURRENT_STATE.md` | `runbooks/S17_VERIFICATION.md` | `../README_VI.md#omission-032` |
| `references/CURRENT_STATE.md` | `runbooks/FULL_TEST_FLOW.md` | `../README_VI.md#omission-028` |
| `references/CURRENT_STATE.md` | `features/SCAFFOLD.md` | `../README_VI.md#omission-018` |
| `references/CURRENT_STATE.md` | `runbooks/S331_TASK_NOTES.md` | `../README_VI.md#omission-036` |
| `references/CURRENT_STATE.md` | `features/SERVING_FEFO.md` | `../README_VI.md#omission-019` |
| `references/CURRENT_STATE.md` | `features/SERVING_FEFO.md` | `../README_VI.md#omission-019` |
| `references/CURRENT_STATE.md` | `runbooks/S33_TASK_NOTES.md` | `../README_VI.md#omission-037` |
| `references/CURRENT_STATE.md` | `features/BOM.md` | `../README_VI.md#omission-005` |
| `references/CURRENT_STATE.md` | `runbooks/S32_TASK_NOTES.md` | `../README_VI.md#omission-035` |
| `references/CURRENT_STATE.md` | `features/STORE_IDENTITY.md` | `../README_VI.md#omission-020` |
| `references/CURRENT_STATE.md` | `runbooks/S02_SQLITE_AUDIT.md` | `../README_VI.md#omission-029` |
| `references/adr/ADR-020-product-requirements-procurement-selector.md` | `../PROCUREMENT_API_CONTRACT_VI.md` | `../../PROCUREMENT_API_CONTRACT_VI.md` |
| `references/adr/ADR-020-product-requirements-procurement-selector.md` | `../features/PROCUREMENT_V2.md` | `../../README_VI.md#omission-017` |
| `references/adr/ADR-020-product-requirements-procurement-selector.md` | `../runbooks/S361_TASK_NOTES.md` | `../../README_VI.md#omission-044` |
| `references/adr/ADR-020-product-requirements-procurement-selector.md` | `ADR-019-internal-procurement-engine.md` | `../../README_VI.md#omission-003` |
| `references/adr/ADR-020-product-requirements-procurement-selector.md` | `ADR-017-serving-fefo-provisional-direction.md` | `../../README_VI.md#omission-002` |
| `references/features/APPLICATION_CONTRACTS.md` | `../runbooks/S16_VERIFICATION.md` | `../../README_VI.md#omission-030` |
| `references/features/APPLICATION_CONTRACTS.md` | `../runbooks/FULL_TEST_FLOW.md` | `../../README_VI.md#omission-028` |
| `references/features/APPLICATION_CONTRACTS.md` | `../runbooks/S17_VERIFICATION.md` | `../../README_VI.md#omission-032` |
| `references/features/APPLICATION_CONTRACTS.md` | `../runbooks/S17_TASK_NOTES.md` | `../../README_VI.md#omission-031` |
| `references/features/DECISION_OPERATIONAL_PIPELINE.md` | `../reports/S352_POSTGRESQL_ACCEPTANCE.md` | `../../README_VI.md#omission-025` |
| `references/features/DECISION_OPERATIONAL_PIPELINE.md` | `../runbooks/S352_TASK_NOTES.md` | `../../README_VI.md#omission-043` |
| `references/features/DECISION_OPERATIONAL_V2.md` | `../runbooks/S362_TASK_NOTES.md` | `../../README_VI.md#omission-045` |
| `references/features/DECISION_OPERATIONAL_V2.md` | `../reports/S362_POSTGRESQL_ACCEPTANCE.md` | `../../README_VI.md#omission-026` |
