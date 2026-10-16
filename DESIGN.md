# ShelfCash design entrypoint

Canonical [MagicPath project 458079658328604672](https://www.magicpath.ai/files/458079658328604672) is the visual/interaction source of truth. Verify the current surface and role revision before implementation; local audit receipts are historical evidence.

Read before frontend visual work:

- [Visual fidelity](.agents/rules/SHELFCASH_VISUAL_FIDELITY.md): approved hierarchy, geometry, density and visual convergence.
- [Copy provenance](.agents/rules/SHELFCASH_COPY_PROVENANCE.md): preserve approved copy and required semantics; classify before deletion.
- [Typography](.agents/rules/SHELFCASH_TYPOGRAPHY.md): semantic scale, readability and role parity; no global multiplier.
- [MagicPath authority](.agents/rules/ui-magicpath-authority.md): implementation cannot invent product UI or interactions.
- For Import: [UI design contract](.cursor/rules/import-ui-design-contract.mdc).

Preserve the **monochrome core + restrained green accent**. Existing [brand styles](src/shared/styles/BrandAccent.css) implement approved accents; generic skills do not authorize changing them.

Use existing shared primitives and tokens to reproduce approved design. No implementation-authored redesign or explanatory copy. Runtime/business/API behavior remains authoritative and intact.

Track inadequate designs in [the current register](docs/status/FOUND_MISSING_UI_V1.md); preserve [historical evidence](docs/FOUND_MISSING_UI.md). Temporary UI does not close a gap.

Repository-local skills: [frontend standards](.agents/skills/frontend-ui-standards/SKILL.md), [design-rule loading](.agents/skills/design-md-workflow/SKILL.md), [existing Playwright verification](.agents/skills/playwright-cli/SKILL.md). All are subordinate to the ShelfCash rules above.
