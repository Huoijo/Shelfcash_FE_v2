# Examples current đã validate

CURRENT FACT: 38 JSON examples được validate lại với DTO hiện hành. Synthetic IDs/digests/dates/versions không phải quyền, credential hay usable server pins. Không suy một workflow bằng cách ghép response từ case riêng. New requests chỉ chứng minh shape/DTO, không business validation/authorization/CAS. Không có password/session/real PDF/customer data.

H01/H02 dùng s411 có meta.warnings explicit; old S410 History traces bị loại. PLAN C01 TARGET DESIGN/code-fence lịch sử trong snapshot contract không phải example current. Các examples s48/planning_public/s410 còn lại có current shape, nguồn ghi riêng trong [validation report](../generated/example_validation.json).

- [examples/t02_response.json](t02_response.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/i01_request.json](i01_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/i03_request.json](i03_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/m04_source_context_request.json](m04_source_context_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/m04_sheet_type_request.json](m04_sheet_type_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/m04_ignore_request.json](m04_ignore_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/m04_profile_constant_request.json](m04_profile_constant_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/m04_import_value_request.json](m04_import_value_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/i05_preview_request.json](i05_preview_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/i05_confirm_review_request.json](i05_confirm_review_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/i05_insert_commit_request.json](i05_insert_commit_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n6_actual_receipt_request.json](n6_actual_receipt_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n8_request.json](n8_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n21_preview_request.json](n21_preview_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n21_commit_request.json](n21_commit_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n1_request.json](n1_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n4_request.json](n4_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [examples/n10_request.json](n10_request.json) — new synthetic shape fixture, not a captured HTTP response or usable resource pin.
- [docs/features/examples/s410/c04_response.json](../docs/features/examples/s410/c04_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/c04_null_digest_response.json](../docs/features/examples/s410/c04_null_digest_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/c05_response.json](../docs/features/examples/s410/c05_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/c05_null_digest_response.json](../docs/features/examples/s410/c05_null_digest_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/c08_response.json](../docs/features/examples/s410/c08_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/n9_response.json](../docs/features/examples/s410/n9_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/n10_response.json](../docs/features/examples/s410/n10_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/s410/j01_pdf_response.json](../docs/features/examples/s410/j01_pdf_response.json) — synthetic S410 HTTP test trace; revalidated current DTO, not rerun HTTP.
- [docs/features/examples/planning_public/c02_accepted_response.json](../docs/features/examples/planning_public/c02_accepted_response.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c02_custom_request.json](../docs/features/examples/planning_public/c02_custom_request.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c02_default_request.json](../docs/features/examples/planning_public/c02_default_request.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c02_saved_request.json](../docs/features/examples/planning_public/c02_saved_request.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c03_completed_response.json](../docs/features/examples/planning_public/c03_completed_response.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c03_failed_response.json](../docs/features/examples/planning_public/c03_failed_response.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c03_queued_response.json](../docs/features/examples/planning_public/c03_queued_response.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/planning_public/c03_running_response.json](../docs/features/examples/planning_public/c03_running_response.json) — synthetic planning test fixture/trace; separate cases, current DTO revalidated.
- [docs/features/examples/s411/h01_response.json](../docs/features/examples/s411/h01_response.json) — current S411 History fixture with explicit warnings; old S410 History traces excluded.
- [docs/features/examples/s411/h02_response.json](../docs/features/examples/s411/h02_response.json) — current S411 History fixture with explicit warnings; old S410 History traces excluded.
- [docs/features/examples/s48/readiness-empty-store.json](../docs/features/examples/s48/readiness-empty-store.json) — synthetic empty Store response, current DTO revalidated.
- [docs/features/examples/s48/planning-context-empty-store.json](../docs/features/examples/s48/planning-context-empty-store.json) — synthetic empty Store response, current DTO revalidated.
