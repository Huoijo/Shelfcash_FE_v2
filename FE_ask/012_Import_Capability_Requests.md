# FE → BE — Import OWNER / STAFF capability follow-up 012

14/10/2026. Review theo `SHELFCASH_IMPORT_NAM_NGUYEN.docx` và current integrated target T `contracts/011/openapi.main.json`. Các mục FE đề xuất dưới đây là **FE PROPOSAL TO BE**, không phải endpoint đã tồn tại hoặc DESIGN_READY đã được BE chốt. Không yêu cầu backend implementation/schema/database cụ thể.

Không bao gồm các milestone underconstruction/global queue/profile-list/notifications đang park. Không xin lại I01–I06/J01/M01–M04/N5/R01 đã có; FE đang dùng đúng clients/DTOs hiện hành.

## 1. Đọc outcome của reusable proposal theo batch

**FE PROPOSAL TO BE — per-batch capability, not runtime.**

Flow: Staff đã hoàn tất resolution nhưng reusable spec cần Owner duyệt. Owner có thể mở batch và quyết định qua N5 hiện có. Khi Staff đọc lại/reopen/refresh, FE cần biết proposal vẫn chưa quyết định, đã approved, đã rejected, đã được thay revision, hay version đã retired. Hiện M01 `ProfileProposal` không có latest decision/status/rejection reason; absence của binding không đủ chứng minh rejection.

FE cần lấy: import/store identity, profile identity + exact proposal/lifecycle revision, current outcome, decision reason/evidence khi được quyền xem, approved binding/version/digest nếu đã duyệt. Nếu có submit riêng trong tương lai, FE cần gửi exact batch + proposal revision + ghi chú handoff; kết quả phải cho biết đã ghi nhận hay chỉ chưa hỗ trợ.

Expected semantics:

- State/decision thuộc đúng proposal đang xem; không resume theo latest profile khác.
- Rejection giữ nguyên files, source proof, identity/declarations/resolutions và cho edit → new revision → review lại.
- Approval chỉ authorize reusable interpretation, không commit hoặc cấp Staff write grants.
- Reopen/refresh không tạo draft mới; đọc lại không gửi quyết định hoặc commit.
- Nếu current contract chủ đích chỉ hỗ trợ manual handoff, xin BE chốt semantics/read fields có thể dùng để hiển thị external rejection an toàn. Không cần global queue hoặc notifications để chốt mục này.

## 2. Product decision cho ambiguous compatible profiles

**FE PROPOSAL TO BE — decision/contract clarification, not runtime.**

Flow: sau Analyze và source proof, server báo `PROFILE_MATCH_AMBIGUOUS`. MagicPath có candidate cards cho người dùng chọn approved profile. Current M04 source_context nhận source/report/semantics/evidence, không nhận explicit profile/version selection.

Xin BE chốt một trong hai capability:

- Chỉ cho người dùng làm rõ source/report/semantics tới khi matching unique; FE sẽ dùng M04 hiện hành, giữ blocker nếu vẫn ambiguous.
- Cho explicit per-batch candidate choice: FE cần lấy candidate identities/version/digest, compatibility/evidence/reason và phạm vi source/sheet; gửi lựa chọn exact candidate với current batch/source/proposal revision. Server phải recheck active/nonretired, exact source scope, compatible declarations và invalidate preview/review khi pin đổi.

FE sẽ không auto-pick, không chọn theo filename/name similarity và không biến approved_profiles thành candidate list ngoài contract. Không cần Store-wide profile discovery để giải quyết per-batch choice.

## 3. Xác nhận integrated contract cho các dữ liệu A1/A2 mới

**Integration request — reported source/acceptance in DOCX, not target-T runtime parity.**

FE cần current-main OpenAPI/source/release authority cho observed stockout true/false/unknown, missingness/aliases và sales contributions nếu các capability A1 đã được tích hợp. Expected: qty-only correction giữ observation hiện có; not-provided vẫn unknown; unknown không thành false và zero sales không tự chứng minh stockout. FE chỉ đọc/gửi fields thực sự có trong current schema, không quantity override hoặc additive correction ngoài confirmed semantics.

Tương tự, xin xác nhận integration status/contract khi các A2 domains/permissions mới trở thành current-main; không auto-grant permission mới và không coi purchase history là actual receipt. Chưa yêu cầu FE wire branch-WIP endpoints như runtime.

Live server/worker acceptance vẫn cần xác nhận riêng với baseline 011; các browser tests HTTP có kiểm soát của FE không thay thế evidence đó.
