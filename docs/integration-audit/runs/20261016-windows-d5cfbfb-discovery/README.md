# ShelfCash FE-BE integration audit workspace

Current run: **20261016-windows-d5cfbfb-discovery**, 2026-10-16 Asia/Saigon. Current assignment mode: **DISCOVERY_EXECUTION**. Outcome: **DISCOVERY_ENVIRONMENT_LIMITED**; see [REPORT](REPORT.md).

This workspace owns the current bounded discovery report, environment/source baseline, case ledger and defects. The user explicitly authorized execution on Windows; HANDOFF/PROMPT/playbook retain the earlier preparation context. Current results come only from this run, separated by evidence mode. Assigned Store credentials and browser TLS trust blocked live business flows; controlled/static/API diagnostics proceeded. No product fixes were made.

The user reports that macOS PID tracking prevents E2E execution on the current environment. This is a reported handoff blocker, not an independently established root cause. Earlier smoke evidence remains historical and does not prove that diagnosis.

## Authority and activation

- [PROMPT.md](PROMPT.md) preserves the supplied English discovery prompt verbatim. Its output paths are resolved under this docs/integration-audit workspace rather than a second root-level audit directory.
- [Agent rule](../../.agents/rules/integration-audit.md) and [live E2E skill](../../.agents/skills/live-be-fe-e2e/SKILL.md) govern future agent behavior.
- An explicit future execution assignment activates DISCOVERY_EXECUTION for the requested scope after target-host prerequisites are established. Merely reading/copying these files does not authorize execution.
- Business semantics and permissions come from accepted documents and the applicable contract/deployment. MagicPath defines UI/interaction. Never invent UI or business rules to complete a case.
- [Current register](../status/FOUND_MISSING_UI_V1.md) remains the sole current missing-UI/implementation register. [017](../testing/017_Live_BE_FE_E2E_Protocol.md) supplies supplemental checklists, but its older pins/absence claims are not current facts. This package governs phase order, P0-P4 severity, and the five execution statuses for new discovery runs.

## Directory map

```text
docs/integration-audit/
  README.md                 Workspace, authority, and current mode
  PROMPT.md                 Original English prompt
  HANDOFF.md                Target-machine handoff and activation text
  ENVIRONMENT.md            Baseline and platform/process prerequisite template
  SYSTEM_MAP.md             FE/BE inventory and consumer mapping template
  STATE_MATRIX.md           State dimensions and coverage rules
  CONTRACT_AUDIT.md         Static boundary comparison checklist
  EXECUTION_PLAYBOOK.md     Phases 0-8 and blocker behavior
  INPUT_DATA.md             Workbook inventory and data-oracle preparation
  COVERAGE_MATRIX.md        Current-run case ledger; not populated yet
  BUGS.md                   Current-run defect ledger; no new findings asserted
  REPORT.md                 A-L discovery report template; not a completed report
  evidence/README.md        Evidence structure and redaction rules
  runs/README.md            Immutable historical run retention
```

## Reading order on the target machine

Read HANDOFF, the original prompt, the agent rule/skill, ENVIRONMENT, SYSTEM_MAP, STATE_MATRIX, CONTRACT_AUDIT, and EXECUTION_PLAYBOOK. Then establish the new run baseline before executing any case. Populate INPUT_DATA from actual workbook inspection and accepted semantics before mutations that depend on those files.

COVERAGE_MATRIX, BUGS, and REPORT are the active documents for the identified run, not an all-time tracker. Archive a previous completed run before replacing its active documents. Preserve all existing historical receipts and frozen artifacts.

## Preparation boundary

All new instructions and templates in this package are in English. Existing documents, source workbooks, credentials files, application code, and historical evidence retain their original content/language. No credentials are copied into this package. The preparation created no runner scripts, tests or execution evidence. Current ignored discovery harnesses and sanitized evidence are referenced by REPORT; controlled results are never labeled live UI acceptance.
