# Evidence handling

Preparation state: no execution artifacts have been captured for this package.

During a later authorized run, organize redacted artifacts under a run ID, with case-specific filenames for screenshots, console observations, request/response summaries, authoritative readbacks, and data-oracle comparisons. Each artifact must identify its case, timestamp, role alias, Store scope, build/contract/design baseline, and execution mode.

Sanitize before persistence. Do not write passwords, session cookies, CSRF, invitation/mail tokens, raw HAR/storageState, or unrelated personal data to tracked evidence. Where raw material is explicitly needed, keep it only in an ignored machine-local private.local location with appropriate access/retention controls; publish a redacted summary instead. Verify the actual ignore policy before writing private artifacts on the target.

Record only relevant non-secret headers, resource IDs, request IDs, and intent association. An idempotency key is not permission to reconstruct/replay a lost operation; preserve the exact intent through the supported mechanism.

Do not overwrite artifacts from another run/build, clean up a failed batch to erase evidence, or capture staged/preparation screenshots as live execution. If an expected artifact is unavailable, mark the evidence limitation explicitly.
