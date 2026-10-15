# Delta FE011 → main

CURRENT FACT: baseline d45b25e6423c52a854bae39efc7896df5c44a22f15549fa7f7259b565e2d837d; main 869eaec914aa6905d6b935889afebe7d973004ae.

54 operations/50 paths → 73 operations/66 paths; +19 operations, 0 removals.

So sánh structural JSON; shared component changes có thể ảnh hưởng callers dù operation definition không đổi. Không kết luận FE chưa triển khai endpoint mới.

## Operations thêm

| ID | Method | Path |
| --- | --- | --- |
| A02 | POST | `/api/v1/auth/register` |
| A05 | POST | `/api/v1/auth/email-verifications/complete` |
| A06 | POST | `/api/v1/auth/email-verifications/request` |
| A07 | POST | `/api/v1/auth/password-reset/request` |
| D01 | GET | `/api/v1/stores/{store_id}/today` |
| EX01 | GET | `/api/v1/procurement-plans/{plan_id}/exports` |
| IN01 | POST | `/api/v1/staff-invitations/{invitation_id}/decline` |
| MQ01 | POST | `/api/v1/imports/{import_id}/mapping-submissions` |
| MQ02 | GET | `/api/v1/stores/{store_id}/mapping-submissions` |
| MQ03 | GET | `/api/v1/stores/{store_id}/mapping-submissions/{submission_id}` |
| NF01 | GET | `/api/v1/notifications` |
| NF02 | GET | `/api/v1/notifications/unread-count` |
| NF03 | PATCH | `/api/v1/notifications/{notification_id}` |
| PR01 | POST | `/api/v1/stores/{store_id}/permission-requests` |
| PR02 | GET | `/api/v1/stores/{store_id}/permission-requests` |
| PR03 | GET | `/api/v1/stores/{store_id}/permission-requests/{request_id}` |
| PR04 | POST | `/api/v1/stores/{store_id}/permission-requests/{request_id}/actions` |
| SU01 | GET | `/api/v1/stores/{store_id}/suppliers` |
| T03 | POST | `/api/v1/stores` |

## Definitions cũ đổi

C01, H01, H02, I04, M01, M02, N5, N9, R01

## Required response fields mới — rà types/mocks/validators

| Schema | Added required fields |
| --- | --- |
| DecisionResult | `notification_delivery`, `submission` |
| Invitation | `declined_at` |
| InvitationOffer | `declined_at` |
| OfferRead | `can_decline` |
| PermissionEvent | `decision_id`, `permission_request_id` |
| PreviewPage | `mapping_revision`, `read_set_digest`, `source_evidence_digest` |
| RunHistoryMeta | `applied_filters`, `timezone` |
| RunSummary | `captured_budget` |

## Enum/const và semantics

N19 chỉ nhận accept=true; invitation có terminal declined/can_decline; catalogue v3/43. Import schema/action/normalization unions mở rộng theo supported history/receipts. Xem exact before/after ở [compatibility_review.json](compatibility_review.json).

R01/C01 contextual readiness và new assessment fields; forecast recognized-only fallback/all-censored blocking; offer eligibility omissions; retained C03/C08 references/version: xem [FE_START_HERE](../FE_START_HERE_VI.md).

Recipe/supplier basis, raw source_value và opening effects đã có baseline FE011. So với FE54 cũ có thể trông là additions; không lẫn hai baseline.

Một số enum thay đổi là mở rộng, không mặc định breaking mọi client. Required response keys cần cập nhật fixtures; request constraint thu hẹp (N19 const:true) cần sửa caller gửi giá trị khác true.

Full diff: [FE011 → main](fe011_to_main.json). Historical comparisons: [FE54 cũ](fe54_to_main.json), [BE main052cddee](previous_main_to_main.json).
