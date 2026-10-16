---
name: playwright-cli
description: Use the existing locked Microsoft Playwright CLI and ShelfCash controlled browser/capture tooling for local visual verification. Also routes explicitly requested future isolated component rendering; does not install another browser stack.
---

# ShelfCash Playwright skill integration

Read repository-root [DESIGN.md](../../../DESIGN.md) for visual work. ShelfCash rules and the user's test scope override generic examples.

## Reuse the installed official skill and CLI

After the repository's normal dependency setup, read the official Microsoft skill at `node_modules/playwright-core/lib/tools/skills/playwright-cli/SKILL.md`. Follow its references only as needed. It is already shipped by the locked `playwright-core` 1.64.0 dependency; no separate CLI package or global installation is required.

Preflight from repository root:

```sh
node node_modules/@playwright/test/cli.js --version
node node_modules/playwright-core/lib/tools/cli-client/cli.js --help
```

In upstream examples, replace `playwright-cli` with `node node_modules/playwright-core/lib/tools/cli-client/cli.js`. Treat these bundled paths as version-specific: recheck availability and documentation after a dependency upgrade. Do not use downloading npx commands, install browsers, add MCP servers, or create a second test architecture just to follow generic examples.

## Choose the existing verification boundary

- `scripts/capture-visual-convergence.mjs`: static SSR component captures, no hydration, all browser requests blocked. It accepts an output directory, but Import siblings are derived from its parent; inspect destinations before running.
- `scripts/capture-copy-provenance.mjs`: baseline-sensitive copy audit captures; fixed output paths. Do not rerun casually or overwrite historical evidence.
- `scripts/verify-planning-021-browser.mjs`: interactive synthetic export components, intercepted HTTP and isolated IndexedDB/profile; fixed evidence destinations. Reuse intentionally, not as a generic screenshot command.
- `playwright.config.ts` / `tests/e2e`: existing mock, responsive, production-parity and controlled-api projects. Inspect test intercepts and webServer startup first. The default configuration starts multiple servers and its names do not prove every request is intercepted. Do not run it against live BE for visual verification.

Use isolated synthetic data/providers, block or explicitly intercept every request, and write fresh task-specific evidence without overwriting historical receipts. Never attach to real signed-in profiles or save credentials/storageState for visual work. Keep screenshots, static SSR, controlled interaction and live E2E labels distinct. Existing host/process-ownership rules still apply.

## Later isolated component-state rendering

Existing SSR/client-mount capture runners already render actual production components with deterministic fixtures. Use that boundary first. If a maintained gallery is explicitly requested later, read Microsoft's installed `node_modules/playwright-core/lib/tools/skills/playwright-component-testing/SKILL.md` to assess it; do not auto-scaffold a gallery, Storybook, production route or new state during ordinary verification.

Source: official Microsoft instructions/CLI bundled in the existing locked Playwright package. This local entrypoint only supplies ShelfCash routing and constraints; upstream files in node_modules remain unchanged.
