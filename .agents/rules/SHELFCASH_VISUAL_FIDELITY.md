# ShelfCash Frontend Visual Fidelity Rules

> Persistent implementation rules for Codex and other frontend agents working in the ShelfCash repository.
>
> Scope: **frontend visual fidelity, design convergence, and production-facing copy discipline**.
>
> These rules apply whenever an approved ShelfCash surface already exists in canonical MagicPath.

---

## 1. Core principle

For existing approved ShelfCash surfaces:

> **MagicPath is the visual source of truth.**

The frontend must converge toward the approved MagicPath design.

Do not reinterpret, embellish, simplify, or "improve" an approved design during implementation unless the task explicitly asks for a new design decision.

The direction of convergence is:

```text
Frontend implementation
        ↓
Canonical MagicPath
```

Never:

```text
Canonical MagicPath
        ↓
Current frontend convenience
```

---

## 2. Separation of responsibilities

Use the following source-of-truth model.

### MagicPath owns

- visual hierarchy
- page geometry
- spacing
- typography hierarchy
- information density
- card/panel structure
- drawer geometry
- table density
- visible copy
- control placement
- status presentation
- border/background treatment
- restrained green accent placement

### Product/API contracts own

- runtime behavior
- permissions
- business-state semantics
- mutation rules
- safety rules
- API payloads
- recovery behavior
- availability of actions
- role authority

Do not use backend/runtime semantics as an excuse to redesign the approved visual surface.

Do not use MagicPath prototype behavior as evidence for unsupported backend behavior.

---

## 3. Critical fidelity rule

When implementing an existing canonical MagicPath surface:

**Do not add production-facing visual structure that is not present in the canonical design unless an explicit runtime/safety contract requires it.**

This includes:

- subtitles
- helper paragraphs
- explanatory microcopy
- onboarding copy
- additional card wrappers
- extra banners
- extra section headings
- new tooltips
- new informational callouts
- extra confirmation prose
- redundant status explanations
- extra whitespace introduced only because it "looks cleaner"

If the design already communicates the state without those additions, implement the design as-is.

---

## 4. Do not improve approved UI during implementation

An implementation task is not a design task.

Do not make unsolicited UX improvements such as:

- adding explanatory subtitles
- rewriting approved copy
- introducing new hierarchy
- changing information order
- converting dense operational UI into spacious consumer UI
- replacing flat layouts with cards
- changing button hierarchy
- reorganizing drawers
- moving actions to locations that feel more conventional
- changing semantic emphasis because another pattern seems preferable

If an approved design appears problematic, record the issue separately.

Do not silently redesign it in production code.

---

## 5. Production copy provenance

Every production-facing string must have an identifiable source.

A visible string is allowed only when it belongs to one of these classes:

### A. `MAGICPATH_COPY`

The same meaning is visibly present in the canonical MagicPath state.

Prefer the approved wording.

### B. `CONTRACT_REQUIRED_COPY`

The copy is not present in MagicPath, but it is genuinely required to communicate a runtime or safety condition that cannot safely remain implicit.

Examples:

- mutation outcome is unknown
- stale state prevents an action
- permission was lost
- retry could duplicate a consequential mutation
- recovery requires a specific user action
- a consequential confirmation needs a reason

Use the **minimum amount of copy necessary**.

Do not turn safety requirements into large explanatory paragraphs.

### C. `DATA`

Dynamic data rendered from the product/runtime.

Examples:

- Store name
- file name
- Run
- date
- status
- count
- actor
- field value
- result value

Any production-facing string that belongs to none of the above classes is:

```text
UNSUPPORTED_COPY
```

and should normally be removed.

---

## 6. Subtitle rule

Never apply a generic "remove all subtitles" rule.

Instead, for every subtitle/helper line:

### Question 1

Does the equivalent canonical MagicPath state contain this information?

- YES → keep it and match the approved hierarchy.
- NO → continue.

### Question 2

Is the copy required for a runtime/safety/permission/recovery contract?

- YES → keep the shortest safe version and classify it as `CONTRACT_REQUIRED_COPY`.
- NO → remove it.

This rule exists specifically to stop implementation-authored subtitles from accumulating across ShelfCash.

---

## 7. Small text is not automatically redundant

Do not delete information based on font size alone.

A small line may still carry:

- Store context
- Run context
- scope
- evidence
- source information
- before/after values
- permission state
- recovery instruction
- decision meaning
- timestamps required for interpretation

Typography and content necessity are separate questions.

If important information is too small, normalize typography.

Do not solve small typography by deleting required information.

---

## 8. ShelfCash visual language

ShelfCash is an operational product.

Preserve:

```text
compact
precise
dense
grayscale-first
hierarchy-driven
restrained
```

Avoid implementation drift toward:

```text
consumer-chat style
large decorative surfaces
excessive whitespace
oversized cards
verbose helper copy
color-heavy layouts
```

The visual system is:

> **monochrome core + restrained green accent**

Do not expand green usage beyond the approved canonical design during implementation.

---

## 9. Shared component discipline

When the frontend differs from MagicPath, first determine whether the mismatch originates from:

- a shared primitive
- a shared token
- state-specific composition

Common shared sources of drift include:

- `PageHeader`
- `SectionHeader`
- `Card`
- `Drawer`
- `Button`
- `Badge`
- `Table`
- `FormField`
- typography tokens
- spacing tokens

If multiple approved screens use the same visual rule, prefer correcting the shared primitive/token.

Do not accumulate one-off CSS overrides when the root cause is shared.

If the design is truly state-specific, preserve state-specific composition.

---

## 10. Visual mismatch taxonomy

Use these labels while auditing frontend vs MagicPath.

### `GEOMETRY_DRIFT`

Examples:

- wrong width
- wrong drawer size
- wrong alignment
- wrong grouping
- wrong table proportions

### `SPACING_DRIFT`

Examples:

- excessive vertical gaps
- wrong padding
- oversized cards
- incorrect section rhythm

### `TYPOGRAPHY_DRIFT`

Examples:

- wrong font size
- wrong weight
- wrong hierarchy
- wrong line-height

### `COPY_DRIFT`

Examples:

- implementation-authored subtitle
- extra helper text
- duplicate explanation
- different visible wording

### `COMPONENT_DRIFT`

Examples:

- card used where MagicPath is flat
- wrong button treatment
- wrong status treatment
- abstraction changes approved geometry

### `COLOR_DRIFT`

Examples:

- wrong grayscale
- excessive green
- missing approved green
- unnecessary semantic color

### `DENSITY_DRIFT`

Frontend displays materially less or more information per viewport than the canonical design.

---

## 11. Refactor priority

During a visual convergence pass, fix in this order:

1. geometry
2. layout / spacing
3. typography hierarchy
4. copy drift
5. controls and actions
6. borders / backgrounds
7. micro-polish

Do not hide structural mismatch through cosmetic styling.

---

## 12. Import Flow fidelity

Import is particularly sensitive because many states share a shell but have different business meaning.

Preserve the canonical six-stage model:

1. File
2. Analyze
3. Resolve / interpretation
4. Profile
5. Preview → Review → Commit
6. Completion / Readiness

Within Resolve, preserve the canonical distinction between:

- structure / semantics
- identity
- declarations
- units

Do not simplify these states into a generic form merely to reduce implementation complexity.

---

## 13. Critical ShelfCash distinctions

Never collapse or visually blur these distinctions:

- Profile approved ≠ data imported
- Review confirmed ≠ Commit completed
- Import completed ≠ Readiness passed
- Readiness passed ≠ Planning completed
- notification read ≠ business action handled
- email verified ≠ Store exists
- email verified ≠ invitation accepted
- reusable Profile change ≠ batch-only import fact
- failed mutation ≠ unknown mutation outcome
- request changes ≠ reject
- current value ≠ proposed value

If a visual refactor risks obscuring one of these distinctions, stop and preserve the current semantics.

---

## 14. Owner / Staff parity

Equivalent Owner and Staff tasks should use equivalent geometry and typography.

Differences should be driven by authority or available actions, not arbitrary layout divergence.

Do not create separate visual systems or typography scales for equivalent role states.

---

## 15. Prototype-only controls

MagicPath may contain controls used only for design inspection.

Never ship:

- `PROTOTYPE ONLY` controls
- state selectors used for QA
- revision labels
- prototype notes
- design-debug panels
- fake runtime controls

Use them only to inspect canonical states.

---

## 16. Frontend-only safety boundary

This repository work must remain safe when live backend access is unavailable.

### Do not assume access to live BE.
### Do not modify live BE.
### Do not require live BE mutation to complete a visual refactor.
### Do not perform destructive or consequential real mutations merely to obtain screenshots.

Visual refactoring should be possible using:

- frontend-controlled state
- existing controlled test fixtures
- local safe data
- existing non-live development environments
- deterministic mocked/fixture states where already supported by the repository

Do not add fake production behavior merely to make a screenshot possible.

---

## 17. Backend boundary

When backend access is unavailable:

- preserve existing API contracts
- preserve existing adapters
- preserve existing request/response shapes
- do not invent endpoints
- do not alter backend assumptions just to simplify the UI
- do not claim an integration is verified live

If frontend behavior cannot be validated without live BE, mark it truthfully as:

```text
NOT LIVE VERIFIED
```

or the repository's equivalent status.

Do not convert controlled evidence into a live-certification claim.

---

## 18. No live E2E claims

Passing:

- unit tests
- boundary tests
- controlled browser tests
- fixture-driven UI states
- screenshots

does **not** prove live backend integration.

Use precise wording.

Examples:

```text
VISUAL VERIFIED IN CONTROLLED ENVIRONMENT
```

```text
FRONTEND STATE VERIFIED
```

```text
NOT LIVE BE VERIFIED
```

Never write:

```text
LIVE E2E VERIFIED
```

unless a real approved live integration environment was actually exercised.

---

## 19. Visual validation

When the frontend can be rendered safely, validate the actual browser output.

Preferred baseline:

```text
desktop
1440px viewport width
100% browser zoom
```

For representative canonical states:

1. render the frontend state
2. compare against canonical MagicPath
3. identify mismatch category
4. correct frontend
5. render again
6. capture final evidence where tooling allows it

Do not rely only on source-code inspection if rendered output is available.

---

## 20. Screenshot evidence

When screenshot tooling is available, store visual evidence under the repository's testing/evidence structure.

Recommended organization:

```text
docs/testing/visual-fidelity/
  import/
  planning/
  store/
  notifications/
  today/
  inventory/
  menu/
  auth/
```

Use representative states.

Do not generate hundreds of redundant screenshots.

For reusable shells, one representative screenshot plus documented state coverage is acceptable.

---

## 21. Screenshot limitation

If the current execution environment cannot render or capture the frontend:

- do not fabricate screenshot evidence
- do not claim visual PASS from code inspection alone
- mark the state as requiring rendered verification

Use wording such as:

```text
IMPLEMENTED — RENDERED VISUAL VERIFICATION PENDING
```

---

## 22. Visual evidence report

For a visual convergence task, maintain a report such as:

```text
docs/testing/visual-fidelity/MAGICPATH_FE_CONVERGENCE.md
```

Recommended fields:

```text
Workspace
State
Role
Canonical MagicPath reference
Mismatch categories
Changes made
Screenshot/evidence path
Remaining difference
PASS / PARTIAL / FAIL
```

---

## 23. Copy drift report

Track removed frontend-authored copy.

Example:

```text
Workspace: Planning Results
State: Run result
Removed:
"Xem lại các kết quả từ những lần chạy kế hoạch trước."

Reason:
- not present in canonical MagicPath
- not contract-required
- not dynamic data

Classification:
UNSUPPORTED_COPY
```

This makes copy cleanup auditable and prevents the same text from being reintroduced later.

---

## 24. Typography

Do not create arbitrary new font sizes.

Prefer approved ShelfCash typography tokens.

If the current frontend contains inconsistent one-off sizes:

- identify the semantic role
- map it to an approved token
- preserve density
- do not enlarge every text element uniformly

Small operational text should remain readable.

Do not reduce font size simply to make a layout fit.

Fix geometry if the canonical design requires more room.

---

## 25. Do not refactor behavior during visual work

A visual-fidelity pass must not casually change:

- API calls
- mutation order
- request keys
- CAS/version handling
- role permissions
- state transitions
- retry semantics
- recovery behavior
- Store scoping
- Profile version behavior
- Planning lifecycle

If a visual defect reveals a behavior bug, report it separately unless the task explicitly authorizes behavior changes.

---

## 26. Recovery safety

Unknown mutation outcome must remain distinct from failure.

Never visually convert unknown into:

- success
- failure
- retry-ready

without authoritative state.

Do not add optimistic copy suggesting the user can simply retry.

Do not use visual cleanup to remove recovery/safety information.

---

## 27. No invented backend semantics

Frontend agents must not invent:

- durable mutation status
- acceptance state
- backend persistence guarantees
- user permission
- reusable/batch semantic scope
- recovery guarantees
- destructive-operation safety

If a design implies behavior that the backend does not support, preserve the safe supported behavior and record the mismatch.

Do not fake the contract.

---

## 28. Canonical-state comparison before completion

Before declaring a visual refactor complete, inspect representative states from every modified family.

At minimum compare:

- default
- populated
- empty
- loading
- error
- blocked/permission
- relevant drawer/modal
- consequential confirmation
- role variant where applicable

For Import, include representative states across the six-stage flow.

---

## 29. Completion criteria

A canonical state is visually `PASS` only when:

- structure materially matches MagicPath
- hierarchy materially matches
- density is comparable
- typography is aligned
- controls appear in equivalent positions
- copy has valid provenance
- no unsupported subtitles/helper text remain
- approved green usage is preserved
- business semantics remain correct

Functional correctness alone is not visual fidelity.

---

## 30. Required final reporting for visual convergence tasks

Report:

### A. Components audited
### B. Systematic drift found
### C. Geometry fixes
### D. Spacing fixes
### E. Typography fixes
### F. Copy drift removed
### G. Shared primitives/tokens changed
### H. Representative states checked
### I. Screenshot/evidence status
### J. Remaining intentional differences

Each remaining difference must be classified as one of:

```text
CONTRACT_REQUIRED
RUNTIME_REQUIRED
RENDERED_VERIFICATION_PENDING
UNRESOLVED_VISUAL_DEFECT
```

### K. Regression status

Report:

- build
- unit/workflow tests
- controlled browser tests if available
- live BE validation status separately

### L. Final verdict

Use one:

```text
MAGICPATH / FE VISUAL CONVERGENCE PASS
```

```text
PARTIAL VISUAL CONVERGENCE — FOLLOW-UP REQUIRED
```

```text
VISUAL CONVERGENCE FAILED
```

Never claim live BE verification unless it actually occurred.

---

## 31. Default decision rule

When choosing between:

> adding something that may help the user

and:

> matching an already-approved canonical MagicPath design

choose:

> **match MagicPath**

unless an explicit safety/runtime contract requires otherwise.

If improvement is desirable, create a separate design issue.

Do not smuggle redesign into implementation.

---

## 32. One-line rule

> **Implement approved ShelfCash UI; do not reinterpret it.**
