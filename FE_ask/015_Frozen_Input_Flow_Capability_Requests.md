# 015 — FE → BE: Frozen Input Flow capability review

14/10/2026. **FE PROPOSAL TO BE — NOT RUNTIME API.** Current integration target remains `contracts/011/openapi.main.json`. This document requests product capabilities, not new endpoint paths or backend implementation. Approved design does not prove runtime support. Existing responses/metadata must remain authoritative.

Frozen MagicPath v1: OWNER `461110616439017472`, STAFF `461109945690124288`, project `458079658328604672`. Business document: `docs/SHELFCASH_IMPORT_NAM_NGUYEN.docx`.

## 1. Read outcome of a retained mutation intent

Flows: resolver M03/M04, N5 Profile decisions, upload, persisted Review and commit recovery.

FE needs to submit or identify the original intent and read an authorized outcome: pending, confirmed applied with canonical result/current revision, terminal not-applied, or unknown. Response must relate to the exact Store/import/target/intent, not just a changed counter/revision. A negative result must establish safe retry; unchanged state alone cannot establish that a request is not still in flight.

Current support: I04/client receipts, M01/M02 issue resolutions, retained Review and I06 can prove some positive outcomes. They cannot prove every rejection/retirement decision, filtered-away mapping, or terminal not-applied request. FE keeps unknown locked and uses readback; no blind mutation replay. Please confirm whether an existing retained result capability can provide this contract before adding anything new.

## 2. Immediate entity creation + binding with explicit reuse scope

Flow: Step 3B Product/Ingredient/Supplier creation.

Frozen design expects metadata validation, possible duplicates, permission checks, create + bind for current import by default, and a separate explicit opt-in to reusable recognition (STAFF proposal → Owner approval). FE needs canonical created/reserved entity identity, exact create permission/outcome and a clear transactional boundary if Import later fails.

Current support: M04 `new_entity_proposal` metadata + Owner review + atomic commit reservation. FE uses that supported proposal behavior and never reports immediate creation from its ACK. **Product/BE decision needed:** should frozen immediate creation be a separate action, or should design copy be corrected to proposal/reservation semantics? Do not implicitly change atomic rollback or duplicate identity rules. Supplier commercial terms remain outside Supplier metadata creation.

## 3. Persist Sales relationship and Supplier decisions before Review

Flows: Preview domain drawers → global domain gate → persisted Review.

FE needs the current required decision set per immutable Preview, each decision's unresolved/pending/confirmed/blocked/permission/conflict state, and a supported way to submit/revise the decision with evidence, reason and acknowledgment. The result must invalidate or re-pin dependent Preview/Review when business interpretation changes.

Sales: show both contribution identities/source evidence; select correction/replacement vs genuinely disjoint contributions only when supported. No default sum/merge and no quantity override. Expose current/previous contribution context needed to justify the decision, including ambiguous relationships.

Supplier: show current/proposed term, fees and effective periods; resolve missing date/overlap explicitly when supported. Keep historical periods intact unless the exact amendment is authorized. Return blockers and current action permissions.

Current support: immutable Preview before/after/provenance and I05 commit `resolutions`/`supplier_changes`. FE stages exact confirmations and gates Review but **does not claim they are separately persisted**. There is no declared domain-decision write/readback boundary in the current target. Please confirm the intended product boundary and available contract; do not infer a new endpoint from this request.

## 4. Source context period and human-readable/custom-source presentation

Flow: Analyze source evidence/custom/locale/period/amendment.

FE needs explicit allowed source/report identifiers and friendly labels or a documented custom-source identity policy; filename/header compatibility alone is never proof. General data-period context needs a supported from/to representation, scope, validation and effect on analysis/Preview. Source confirmation is current-import context unless reusable behavior is explicitly proposed/approved.

Current M04 supports namespace source/report identifiers, evidence, date/decimal locale and specific term/fee amendments. FE sends only those fields; it does not send display names as identifiers or unsupported period fields. Please clarify whether current descriptors already express each period fact or whether a new capability/Product decision is needed.

## Existing dependencies, not duplicate requests

- Staff queue/submission/notification/outcome remains the existing tracked dependency; parked/underconstruction work is excluded from new scope here.
- Supplier candidate search and immutable friendly business displays remain requests in `012_Import_Capability_Requests.md` / `013_Import_Display_Contract_Clarifications.md`. FE already reuses current Menu/Inventory readers for supported Product/Ingredient search; this is not a new Import identity-search API.
- Full read contracts, source evidence/provenance, N5/CAS, current Review pins and atomic commit already exist; FE is not requesting them again.
- Controlled browser responses and DEV adapters are verification fixtures, not evidence of deployed BE capability. No DESIGN_READY endpoints were wired.
