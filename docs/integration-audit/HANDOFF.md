# Target-machine handoff

Status: PREPARATION_ONLY. Target machine: NOT_RECORDED. Execution authorization: NOT_GIVEN for this preparation assignment.

## Transfer requirements

1. Transfer both FE and BE working trees, including authorized uncommitted/untracked work. A Git revision alone may omit the actual implementation. Do not commit/push/reset merely to facilitate transfer.
2. Transfer the existing contract packages and their provenance. Record target revisions and dirty-source fingerprints anew; do not reuse old verification as a target baseline.
3. Transfer INPUT_FOR_TESTING unchanged through the chosen workspace transfer. Confirm its files and hashes on the target before use; the preparation pass has not inspected their contents.
4. Provision dedicated test data/Stores and accounts privately. The existing ignored docs/testing/TEST_ACCOUNTS.local is machine-local and may not arrive through Git. Re-provision it through an appropriate private channel; do not paste credentials into this prompt, report, or committed configuration.
5. Discover target startup instructions, URLs, TLS trust, allowed Origins, database/runtime directories, workers, and required services from both repositories. Do not assume the old localhost ports, macOS paths, or seed state are valid.
6. Record native OS/CPU architecture, runtime/dependency/browser versions, and platform-specific process identity behavior. Compatibility is NOT_VERIFIED until supported by evidence; moving to another OS alone is not proof.

## Platform and process safety

Before operations that start/stop/recover child processes or workers, establish the supported process-ownership mechanism on the target. Check PID plus process incarnation/creation identity and ownership using the project's supported implementation. Do not replace that check with PID existence alone.

Do not disable process tracking, read another process's secrets, terminate unrelated services, force-unlock a job, edit lifecycle rows, reset a database, or replay an unknown mutation to work around an environmental blocker. Report exact prerequisites and continue independent authorized checks where possible.

Historical staging batch/job IDs from the earlier smoke run belong to that environment. Do not reconstruct or replay them on the target. If the database is shared, retain their provenance and investigate only within the explicit assignment.

## Future activation prompt

Use the following only when assigning execution on the target machine:

> Perform a DISCOVERY_EXECUTION integration audit of ShelfCash on this target machine. Read AGENTS.md, .agents/rules/integration-audit.md, .agents/skills/live-be-fe-e2e/SKILL.md, and docs/integration-audit/PROMPT.md first. Establish fresh FE/BE/platform/contract/design baselines and record the authorized scope, test Stores, data, and write boundaries in ENVIRONMENT.md. Use docs/integration-audit as the output workspace. Follow phases 0-8, record reproducible defects before changes, and execute only the authorized scope with isolated Owner/Staff sessions. Treat startup/platform blockers separately from product defects and never bypass process-ownership or mutation-safety checks. Populate COVERAGE_MATRIX.md and BUGS.md, perform the final exploratory sweep, produce REPORT.md sections A-L, and stop. Do not implement product fixes, commit, push, reset, rebase, or delete data. If prerequisites fail, produce a bounded blocked report and identify the exact prerequisite required to continue.

The activation assignment must identify its actual scope, environments, authorized test data, and permitted writes. Existing authorization may supply those details; do not ask again when already established. Missing critical prerequisites block dependent execution, not independent documentation work.
