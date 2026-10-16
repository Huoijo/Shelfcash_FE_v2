# 020 — Afternoon BE handoff follow-up

Source: `BE_answer/16_10_afternoon/shelfcash_FE_handoff_d5cfbfb59de7`, source-only BE SHA `d5cfbfb59de7c45bc08eb47129b5ba3919e05473`. Implementation and validation: [sprint receipt](../docs/sprints/020/020_Backend_Handoff_Integration.md). Existing [020 design/contract discrepancies](020_Design_Contract_Reconciliation.md) remain separate.

## FE + Product/Design

1. **CR-01 runtime journal rollout:** an opt-in allowlisted service/IndexedDB boundary now exists. Production hooks and legacy workflow owners still use memory. Specify retention, logout and shared-device handling through current MagicPath before rollout. No silent deletion/expiry, automatic new-key retry or claim that logout cancels a write. Audit both roles and restore pending/unknown state with explicit readback/exact replay. Metadata-only bodies, excluded uploads/proofs and unresolved records need operation-specific behavior; a hash is not a replay body.
2. **Assistant result surface:** AS01/AS02/AS03 typed services and scoped controllers are available. Audit the current retained-results design before adding a caller. Preserve evidence/version, diagnostics/fallback, structured context and paid-provider uncertainty. AS02 is retained read only; AS03 recovery is the original same-key/body POST, with no invented GET or J01 polling. Do not reopen standalone AI, What-if or PO on endpoint availability alone.
3. **Existing FE debt:** RT-02 has sufficient existing failed/retry design and published I03 semantics; implement separately against fresh source-set/CAS/allowed_actions, distinguishing terminal failure from lost ACK. FM-009 descriptor-specific ergonomics remains. These are FE implementation tasks, not missing APIs.

## BE / target-machine evidence

- Supply/verify actual deployed SHA and migration/worker/Origin baseline on the architecture-matched testing machine. This package explicitly says runtime_deployed=false; source fixes and reported BE tests cannot establish live behavior.
- Validate AS01–03 against current Store grants: planning.result.read + budget.read + procurement.cost.read. Summary/chat model flags are independently off by default; a 200 fallback response does not prove model invocation. Keep V6/V8/provider composition a BE concern.
- Native IndexedDB reload/disk/quota/multitab validation and live mutation recovery remain unexecuted. Use the existing integration-audit target-machine handoff and process-ownership checks.
- No request to add already supplied AS APIs, I02 replay, Review persistence, submission lifecycle or the allowlist. Generic negative-outcome proof/cross-device recovery, accepted-file mutation/unseal, standalone domain-decision persistence and immediate canonical create+bind remain documented limitations; no new BE SLA is inferred.
