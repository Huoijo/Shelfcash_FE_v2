---
name: frontend-ui-standards
description: Apply ShelfCash-approved semantic tokens, shared primitives, typography, spacing and responsive implementation consistency during frontend convergence or review. Does not authorize product redesign.
---

# ShelfCash frontend implementation standards

Read repository-root [DESIGN.md](../../../DESIGN.md) and its three ShelfCash rule files before applying this skill. Canonical MagicPath and ShelfCash rules override all upstream guidance.

Use this skill only for semantic tokens, shared primitive consistency, typography, spacing and responsive implementation discipline. It supplies implementation technique, not design authority. Do not infer new surfaces, copy, interactions, confirmation flows, density, token values or breakpoints from generic guidance. Preserve approved geometry and runtime semantics; unresolved design conflicts belong in the current register.

Consult the vendored [upstream skill](references/upstream-SKILL.md) for these sections only:
- Core Principle; Token And Metrics Rules.
- Inspect Existing Patterns; Classify Every Visual Value; Encode Layout Relationships.
- Component Reuse Rules, only within already-approved patterns.
- Typography Rules; Layout And Spacing Rules, subject to ShelfCash's exact approved scale/geometry.

Upstream Figma, interaction, new-component, app-installation and general redesign suggestions are not applicable authority for ShelfCash. Token extraction is not permission to change visual values or global-scale text. Read copy provenance before editing any visible string.

Verify the relevant existing component/state with the repository's controlled capture tooling, including OWNER/STAFF parity and narrow viewports where applicable. Keep fixtures, static SSR, interactive controlled checks and live acceptance distinct. No live BE or MagicPath writes are implied.

Source: MaxHan7/frontend-ui-standards-skill, MIT, pinned commit `0609cb07793ee1f8f6626c98042ee2e811f81735`. Upstream instructions are preserved unchanged in the reference; this entrypoint and UI metadata are ShelfCash-specific adaptations. See LICENSE.
