---
name: design-md-workflow
description: Load ShelfCash DESIGN.md and authoritative rules before frontend visual review, implementation or convergence. Use the repository's design index rather than creating a generic design system.
---

# Load ShelfCash design authority

1. Read repository-root [DESIGN.md](../../../DESIGN.md) before UI work. Resolve its links against the repository root.
2. Read the linked visual fidelity, copy provenance and typography files. Load the Import-specific contract when that surface is involved. These maintained rules own detail; do not copy them into a new generic design system.
3. Establish the current canonical MagicPath revision for the relevant surface/role through an authorized read-only audit. Local receipts are historical evidence until checked against the current source. This skill never grants permission to modify MagicPath.
4. Map the scoped change to existing approved primitives/tokens. If a required state lacks adequate design, update the current register and keep it pending. Do not invent placeholder production UI.
5. Before implementation, state the scoped families and verification method. For tooling-only or audit-only tasks, perform no product edit. Preserve business/API/state behavior during visual-only work.

This is a ShelfCash-authored equivalent of the DESIGN.md-reading workflow. No third-party starter design, taste profile or replacement token system is installed. Design ambiguity is resolved through canonical design review, not generic skill preference.
