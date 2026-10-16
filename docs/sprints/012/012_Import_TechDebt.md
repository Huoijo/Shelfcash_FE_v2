# 012 — Import Technical Debt delta

14/10/2026. Đây là delta cho request OWNER/STAFF Input flow; các debt ngoài Import trong `011_TechDebt.md` giữ nguyên. Không đưa các phần Underconstruction_by_BE vào active debt dưới đây.

## FE đã resolve trong scope này

- Analyze checkpoint độc lập, 6-step Owner/Staff presentation và Resolve rộng hơn column mapping.
- Owner reusable approval riêng khỏi batch facts/Preview/Commit; Staff reuse không bắt approve lại.
- Mock actor role/grants lấy đúng membership, không cấp Owner mặc định cho Staff.
- Preview → Review navigation không bypass stale/blocked/incomplete pages/unsupported wire data; recovery quay Resolve hoặc regenerate.
- Structured authorization/retirement/stale/CAS/system faults, terminal completion navigation; giữ existing exact-intent retry/atomic/review safeguards.
- I06 completion tách khỏi fresh R01 planning readiness theo ngày/quyền; ready/not-ready/unknown/error/warnings không bị nhập làm một.
- DEV Staff submit/wait/approve/reject/resubmit có real clickable path và cùng batch context, không lẫn với runtime API.

## 012-IMPORT-01 — Per-batch Owner outcome read model

**PARTIALLY RESOLVED / FE PROPOSAL TO BE, not runtime.** N5 decisions và M01 approved bindings đã có, nên approval/resume không còn là missing API chung. Nhưng current T `ProfileProposal` không có submitted/waiting/rejected state, latest decision/rejection reason hoặc read acknowledgment để Staff phân biệt external rejection với proposal chưa được quyết định sau refresh.

FE hiện dùng explicit manual handoff + server refresh; không tự báo đã submit. DEV adapter chỉ mô phỏng trạng thái này. Cần capability đọc trạng thái/decision của đúng batch/profile proposal revision, giữ source/resolutions và tách khỏi commit authorization. Request chi tiết ở FE_ask 012. Không yêu cầu triển khai global queue thuộc underconstruction ở đây.

## 012-IMPORT-02 — Explicit selection khi nhiều approved profiles phù hợp

**PARTIALLY RESOLVED / FE PROPOSAL TO BE, not runtime.** Source proof, unique compatible binding, ambiguity/drift blockers và N5 approval đã có. FE đã trình bày riêng ambiguity và cho tiếp tục source/semantics resolution. Tuy nhiên T không có candidate collection/selection command với exact profile/version/digest. Không thể nối các candidate buttons demo bằng cách thêm profile_id vào M04 source_context ngoài schema.

Cần BE chốt liệu clarification bằng M04 là product behavior duy nhất, hay bổ sung explicit per-batch candidate choice. Không tự suy ra candidate list từ một nhóm approved_profiles/binding_refs không được định nghĩa là candidates.

## 012-IMPORT-03 — Latest business spec vs integrated wire / live acceptance

**SOURCE/WIP claims ≠ runtime target parity.** DOCX mô tả A1 stockout observations/missingness/contributions và A2 domains/permissions. Current T `SalesSource` vẫn chỉ product/date/quantity/unit/report key; không expose tri-state fields/contribution history như UI mới. Không thêm fields/routes từ prose vào HTTP payloads.

Cần snapshot/source integrated current main và acceptance evidence trước khi cập nhật typed wire. Các phần live acceptance đã thuộc 011-BE-000 tiếp tục giữ ở baseline, không đánh dấu resolved bằng controlled HTTP tests. Source cells chưa được cung cấp đầy đủ vẫn là limitation cũ, không xin lại provenance fields/source_value đã có.

## Không phải active debt / không mở rộng scope

- Upload 422 committed-rejection semantics, source/recipe guards, full-spec N5 CAS, canonical Preview/review/commit và immutable I06: đã có và giữ nguyên.
- DEV memory-only reset khi reload là cơ chế minh họa hiện có, không phải backend persistence.
- Underconstruction milestones/global queue/profile-list/notifications giữ nguyên trong tài liệu park; không đưa vào API thiếu của sprint này.
