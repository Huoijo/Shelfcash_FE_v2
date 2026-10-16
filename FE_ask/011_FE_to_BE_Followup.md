# 011 — FE → BE follow-up sau night handoff

Ngày tạo lập: 13/10/2026. General Context: đã nhận `010_BE_FE_handoff_20261013`, kiểm đủ 80 file manifest và pin main T SHA256 `d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d` cho FE. Chi tiết [receipt](../docs/sprints/011/011_Implementation_Receipt.md), [debt](../docs/sprints/011/011_TechDebt.md).

## Đã tiếp nhận — không yêu cầu BE gửi lại hoặc duyệt lại

- Đã nhận T/I/B snapshots và source references; FE đã cập nhật Import wire, source value/recipe basis, supplier price-MOQ semantics, Excel diagnostics/serial và opening effect theo T.
- Source-before-reuse và recipe cross-sheet blockers đã được đối chiếu source; FE hiển thị hướng dẫn và giữ atomic blockers. Split-report assembly deferred, không đề xuất API split-report mới.
- R05/R09 đã **ACCEPTED / DESIGN_READY, not runtime**; không còn FE proposal/Product question. FE không tự dựng DTO theo prose hoặc bật fields chưa có.
- FE đã sửa PDF eligible-only; candidate tham khảo có warning, no-winner explicit selection, no-candidate deny, lost ACK replay, artifact503 recovery và403 gates. Không yêu cầu BE thêm PDF endpoint cho các việc FE này.

## F01 — Integrated runtime và live acceptance handoff

**HANDOFF/VERIFICATION REQUEST, không endpoint mới.** Cần build/release identity và schema của môi trường FE sẽ gọi; giữ rõ T vs Auth/Import WIP. T pin đã có, thiếu release hợp nhất không giải bằng merge JSON hoặc cùng HEAD.

Cần base URL/Origin/cookie/CORS/CSRF config, worker readiness và fixture/account/Store/grants phù hợp (không secrets trong tài liệu công khai). Xin evidence executed gắn source/build và request IDs/fresh reads cho source-reuse/recipe scope/retirement, opening↔N6/count/completeness, source price/MOQ và các flow retained/PDF. Health hay SMTP smoke không thay whole-flow evidence. Không cần cung cấp DB reset rights.

## F02 — B1/B2 ổn định và lựa chọn target Auth tích hợp

**SOURCE REPORTED COMPLETE IN AUTH WIP / INTEGRATION PENDING.** Xin stable B1/B2 slice hoặc release tích hợp, xác nhận public routes/response/errors theo source. Snapshot B59/55 chứa B3 WIP; FE không coi toàn bộ nó là release đã hoàn tất.

A07 source trace dùng `/api/v1/auth/password-reset/request`, khác prose afternoon `/auth/password-reset-requests`. Xin xác nhận route theo finalized generated artifact; FE không thử cả hai hoặc suy fallback. Cần workflow signup→verify→login no-Store, resend/forgot→N7→old-session-revocation→relogin và delivery/browser evidence gắn build. Không hỏi lại policy account không Store/Owner, anti-enumeration, Origin/no CSRF public, password hoặc reset revocation đã chốt.

## F03 — B3 final acceptance và accept true-only schema

**SOURCE WIP, NOT COMPLETE.** Chờ decline lifecycle/filter/terminal/reissue/CAS/race/replay/fresh persistence acceptance và stable snapshot. Xin correction OpenAPI AcceptInvitation accept true-only theo runtime validator. FE không dùng accept:false làm decline, không ship B3 vì WIP route xuất hiện, không gộp inbox vào B3 completion.

## F04 — Runtime handoff các read projections đã được duyệt

**ACCEPTED / DESIGN_READY, NOT RUNTIME; không yêu cầu thiết kế endpoint trùng hoặc phê duyệt Product lại.** Xin xác định slice triển khai/bàn giao, source-generated DTO/query/examples và executed evidence khi sẵn sàng:

- R03: scoped mapping issue counters/filter/origin + same-revision paging.
- R04: bounded raw cells/source_effect I04; source_value hiện có không thay toàn projection.
- R05: I04 raw source rows riêng distinct logical actions, overlapping file/sheet totals không cộng thành batch total, cùng digest/page/filters. Typed DTO chưa có; FE chờ cấu trúc thực, không đoán field names.
- R06: SU01 canonical supplier picker, supplier.read/Store scope/paging/no commercial leak; nullable N6 vẫn dùng được.
- R07: N9 creator/Store-local created-date trên accepted_at; filters cũ giữ nguyên.
- R08: EX01 export list/locator + verified artifact availability; không POST để tìm PDF, không automatic rerender từ GET.
- R09: N9 captured effective limit/currency + availability/null legacy evidence; không current cap/spend, không N+1 C03. Typed DTO chưa có.

FE không hỏi lại Product các policy trên. Nếu chưa mở implementation, ghi rõ planned/not started thay vì runtime availability; không cần tự đặt ETA hoặc tên slice mới khi chưa thống nhất.

## F05 — Capabilities đã thiết kế nhưng chưa có producer runtime

**ACCEPTED / DESIGN_READY, NOT RUNTIME.** R11 PR01–PR04 regular permission requests; R12 NF01–NF03 recipient inbox/count/read state; R13 inventory_receipts Excel pipeline/shared N6 ledger. Xin giữ chúng là backlog implementation riêng và giao schema/producer/evidence khi sẵn sàng. Email durable intents, N13 direct grants, opening/count hoặc A2 purchase history không thay ba flows này.

Không đề xuất API mới trong follow-up 011. Các việc shared mock/performance/lint/browser coverage còn lại là FE/QA, không quy thành BE API blocker. Phạm vi đã Underconstruction/deferred không nằm trong các requests thực thi này.
