# ShelfCash visual-refactor toolchain bootstrap

Date: 17/10/2026. Scope: tooling/skills/documentation only.
Verdict: **UI REFACTOR TOOLCHAIN READY**.
No product UI, copy, business/API behavior, routes, permissions or workflow states changed. MagicPath and live BE were not accessed. Typography implementation has not started.

## A. Existing capabilities discovered

- Repository-local `.agents/skills/` convention already contains live-be-fe-e2e and motion. Existing rules cover visual fidelity, copy provenance, typography, MagicPath authority and integration safety; all preserved byte-for-byte.
- React 19.2.8 / Vite 8.3.0 / TypeScript 6.0.2, npm package-lock, existing shared flow/dialog/motion/brand primitives. No new design-system runtime is needed for this bootstrap.
- Locked `@playwright/test`, `playwright` and `playwright-core` **1.64.0**. The installed Microsoft package already contains the agent CLI, official CLI skill/reference guides, and optional component-testing guidance. `playwright-cli` is not a global PATH command here; its existing bundled Node entrypoint works.
- Existing Playwright projects: mock-desktop, mock-mobile, production-parity, controlled-api. Existing helpers intercept synthetic API responses. The default config starts three servers: project names alone do not prove network isolation, so the full runner was not started for this task.
- Existing captures: static SSR visual convergence; copy-provenance static/client captures; interactive Planning component browser verification with isolated persistence. These render production components with synthetic fixtures, not a Storybook catalog or a live backend.
- No root DESIGN.md, frontend-ui-standards or design-reading skill existed before this bootstrap. No Storybook package, config or stories were present.

## B. Skills/tools added

- `.agents/skills/frontend-ui-standards/`: vendored [MaxHan7/frontend-ui-standards-skill](https://github.com/MaxHan7/frontend-ui-standards-skill/tree/0609cb07793ee1f8f6626c98042ee2e811f81735/frontend-ui-standards), MIT, commit `0609cb07793ee1f8f6626c98042ee2e811f81735`. Installed with the existing skill-installer helper and repository-local destination. Original SKILL bytes remain in `references/upstream-SKILL.md`; LICENSE is retained. The local entrypoint/agent metadata restrict it to semantic tokens, shared primitives, typography, spacing and responsive implementation. Upstream interaction/Figma/redesign suggestions do not authorize ShelfCash changes.
- `.agents/skills/design-md-workflow/SKILL.md`: ShelfCash-authored equivalent of a DESIGN.md-reading workflow. It reads the repository's own index/rules; no third-party starter design or replacement design system is installed.
- `.agents/skills/playwright-cli/SKILL.md`: ShelfCash routing wrapper over the [official Microsoft CLI skill](https://github.com/microsoft/playwright/tree/main/packages/playwright-core/src/tools/skills/playwright-cli) already shipped in the locked dependency. It reads `node_modules/playwright-core/lib/tools/skills/playwright-cli/SKILL.md` and invokes the existing bundled CLI, not another package or browser architecture. Version-specific paths are rechecked on upgrades.
- Root [DESIGN.md](../../DESIGN.md): concise index to canonical MagicPath, fidelity/copy/typography rules, monochrome core with restrained green, Import contract and current register. AGENTS.md makes this read persistent for future visual work. ShelfCash rules and canonical MagicPath take priority over every added skill.

Repository-local skills are available for discovery on the next agent turn. Existing skills/rules were not overwritten.

## C. Existing tooling reused

Preflight commands verified without downloads:

```sh
node node_modules/@playwright/test/cli.js --version
node node_modules/playwright-core/lib/tools/cli-client/cli.js --help
```

For future work, reuse:

- `scripts/capture-visual-convergence.mjs`: static SSR, 1440px captures, blocked network, explicit no-hydration labels. Output can be supplied; Import sibling destinations derive from its parent.
- `scripts/capture-copy-provenance.mjs`: baseline-sensitive before/after copy captures; fixed evidence paths, so rerun only intentionally.
- `scripts/verify-planning-021-browser.mjs`: interactive controlled component rendering/IndexedDB with every HTTP request intercepted; fixed receipt paths.
- Existing `tests/e2e` and `playwright.config.ts`: select an appropriate isolated test scope after inspecting server startup and intercepts. Do not casually run the full configuration for visual work.

Historical screenshot runners were inspected, not rerun or rewritten. A separate ephemeral smoke check used the same installed `playwright` package to launch Chromium, render local synthetic HTML and capture PNG bytes in memory with every request blocked. It used no app server, real profile or production component. This proves the browser engine works on this host, not app visual fidelity/full E2E or application worker/PID readiness.

For later isolated component-state rendering, existing fixture/provider runners already suffice. If a maintained gallery is requested later, the installed Microsoft component-testing skill can be assessed then; no gallery, story scaffold or new production route is created now.

## D. Files changed

- `AGENTS.md` (append design-index/skill loading instruction only).
- `DESIGN.md` (new index).
- `.agents/skills/frontend-ui-standards/{SKILL.md,agents/openai.yaml,references/upstream-SKILL.md,LICENSE}`.
- `.agents/skills/design-md-workflow/SKILL.md`.
- `.agents/skills/playwright-cli/SKILL.md`.
- This report and `docs/architecture/README.md` index.
- [Bootstrap verification receipt](../testing/UI_TOOLCHAIN_BOOTSTRAP_VERIFICATION.json) and `docs/testing/README.md` index.

`src/`, existing `.agents/rules/`, existing skills, package files, Playwright config and existing capture/test scripts remain unchanged. No current UI gap status was closed or rewritten.

## E. Dependencies changed

**None.** package.json and package-lock.json are byte-identical to the baseline. No npm/global CLI install, browser download, new test runtime or Storybook dependency was added. Only the requested upstream skill files were fetched and installed locally; none of its executable tooling was run.

## F. Storybook assessment

**NOT CURRENTLY NECESSARY** for the requested toolchain: existing Playwright SSR/client capture runners cover isolated state rendering and visual verification. A searchable story catalog may be useful later and should be a separately authorized setup.

If requested later, a minimal React/Vite setup would introduce `storybook` and `@storybook/react-vite`; `@storybook/addon-docs`/`@storybook/addon-a11y` would be optional, separately assessed additions. Verify compatible peer versions against this repo's React/Vite/TypeScript and pin them at setup time. This is an implementation proposal, not a tested dependency combination. See [official React/Vite guidance](https://storybook.js.org/docs/get-started/frameworks/react-vite) and [installation effects](https://storybook.js.org/docs/get-started/install).

Affected areas would be package.json/lockfile, `.storybook/main.ts` and `preview.tsx`, isolated `tests/visual/stories/*.stories.tsx` plus fixture/decorator helpers, and optional Storybook scripts/output ignores. Keep stories outside production routes. Wrap actual production components in deterministic MemoryRouter/Auth/CurrentStore providers and fixtures; use stable dates/data, explicit OWNER/STAFF grants, no real accounts, blocked/intercepted network. Story-only props represent existing states rather than inventing product flows.

Storybook would be an optional catalog/host; the current Playwright installation would remain the browser/capture engine. Existing controlled tests and frozen evidence would retain their semantics and paths; no additional Playwright or experimental component-testing package is required by this proposal. No Storybook install or config is performed here.

## G. Validation

- Three new skill entrypoints pass the existing skill-creator `quick_validate.py` validator. Local Markdown links checked.
- Build PASS; existing large-chunk warning remains.
- Lint PASS; two existing effect warnings remain, unrepaired.
- **519 controlled tests PASS**: Planning 119, capabilities 83, Operations 30, Import 143, Store 118, Auth 26.
- Existing official CLI version/help PASS. Native Chromium tooling smoke PASS on macOS arm64 at 1440×1000; PNG capture worked, **0 network attempts**, no live BE/app rendering.
- Source/rule/config/package/capture-tool baseline hashes checked; only the intended AGENTS.md append changed an existing baselined file. Dependency/config/runtime behavior remains intact.
- Live BE, MagicPath, full application E2E and product visual acceptance: NOT_RUN. No commit/push.

## H. Final readiness

**UI REFACTOR TOOLCHAIN READY** for scoped work under the current ShelfCash design rules. Toolchain readiness does not approve any design change or establish visual convergence. Read DESIGN.md on the next visual task, establish the relevant canonical revision, then use controlled evidence for the authorized scope.
