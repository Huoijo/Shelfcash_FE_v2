# ShelfCash Typography Rules

> Persistent typography rules for Codex and other frontend agents.
>
> Scope: production-facing typography, especially dense operational UI.
>
> This file complements:
>
> - `SHELFCASH_VISUAL_FIDELITY.md`
> - `SHELFCASH_COPY_PROVENANCE.md`
>
> MagicPath remains the visual source of truth.
> Product/API contracts remain the behavior/runtime source of truth.

---

## 1. Core principle

ShelfCash must remain:

```text
compact
+
readable
+
hierarchical
```

Do NOT solve typography problems by making the entire product globally larger.

Do NOT reduce meaningful operational text merely to preserve density.

The current known issue is concentrated in the lower-tier typography of canonical Import surfaces.

---

## 2. Approved semantic type scale

Use semantic tokens rather than arbitrary per-surface font sizes.

### `type-page-title`

```text
size: 28–29px
line-height: ~36px
weight: 600
```

Usage:

- authenticated workspace title

Existing canonical Import page title may remain 29px.

Do not normalize 29px → 28px merely for cosmetic consistency during an Import typography pass.

---

### `type-section-title`

```text
size: 24px
line-height: ~32px
weight: 600
```

Usage:

- major workflow state
- major operational surface heading

---

### `type-drawer-title`

```text
size: 20px
line-height: ~28px
weight: 600
```

Usage:

- resolver drawer
- focused domain drawer
- correction drawer

---

### `type-metric`

```text
size: 20–24px
line-height: 30–32px
weight: 600
```

Usage:

- primary KPI
- emphasized metric/value

---

### `type-card-title`

```text
size: 14px
line-height: ~22px
weight: 600
```

Usage:

- operational card
- phase title
- record title
- grouped subsection heading

---

### `type-body`

```text
size: 12px
line-height: ~20px
weight: 400–500
```

Usage:

- normal explanation
- warning
- error
- recovery guidance
- permission explanation
- decision rationale
- operational helper text

---

### `type-control`

```text
size: 12px
line-height: ~20px
weight: 500–600
```

Usage:

- buttons
- select values
- input values
- table values
- tabs
- interactive filters
- paging controls
- primary action labels

---

### `type-label`

```text
size: 11px
line-height: ~18px
weight: 500
```

Usage:

- form labels
- evidence labels
- before/after labels
- table headers
- scope labels
- status/meta when meaningful
- resolver context labels

---

### `type-micro`

```text
size: 10px
line-height: ~16px
weight: 400–500
```

Usage only for:

- redundant provenance qualifier
- minor timestamp secondary to a stronger value
- nonessential count/badge
- decorative legend
- compact metadata not required to complete the task

`type-micro` is NOT for:

- errors
- evidence required for a decision
- input values
- action labels
- before/after semantics
- recovery instructions
- Profile rationale
- source interpretation
- table values

---

## 3. Absolute production floor

> **No meaningful production text below 10px.**

Production-facing 8px and 9px text is prohibited for meaningful operational information.

Allowed exceptions:

- decorative/redundant glyph labels
- purely visual legends
- prototype-only tooling

If a selector is 8px/9px and user-visible in production, it must either:

1. be migrated to an approved semantic token, or
2. be explicitly proven decorative/redundant.

---

## 4. Semantic minimums

Use these as hard minimums.

| Semantic role | Minimum |
|---|---:|
| Normal body | 12px |
| Button/action | 12px |
| Input/select value | 12px |
| Table/list value | 12px |
| Table header | 11px |
| Form label | 11px |
| Evidence label | 11px |
| Evidence value | 12px |
| Before/after label | 11px |
| Before/after value | 12px |
| Error copy | 12px |
| Permission explanation | 12px |
| Recovery/uncertainty copy | 12px |
| Acknowledgment/consequential confirmation | 12px |
| Status as sole semantic indicator | 11px |
| Micro metadata | 10px |

---

## 5. Import-specific correction target

Canonical Import is the primary normalization target.

Preserve its top hierarchy:

```text
page title      ≈ 29px
section title   ≈ 24px
drawer title    ≈ 20px
```

Do NOT broadly resize these during the typography normalization pass.

Normalize the operational floor instead.

---

## 6. Priority Import families

Normalize shared primitives/families before local state overrides.

Priority order:

1. `ContextEvidenceBlock`
2. before/after comparison primitives
3. mutation/recovery status
4. resolver shell
5. Source Context
6. Sales/Supplier domain review
7. History Correction
8. Profile decision/comparison
9. Review / Commit
10. dense tables
11. six-step stepper secondary text

This order reflects risk and semantic importance.

---

## 7. Evidence rules

Evidence that affects interpretation or approval must use:

```text
label >= 11px
value >= 12px
body/note >= 12px
```

Do not render decision evidence at 8px/9px.

Do not shrink evidence because it appears inside a 500px drawer.

---

## 8. Before/after rules

Consequential comparison UI must use:

```text
label >= 11px
value >= 12px
```

This applies to:

- Profile comparison
- History Correction
- Sales/Supplier review
- source replacement
- persisted/proposed values
- Review snapshots

---

## 9. Recovery rules

Mutation and recovery semantics must use:

```text
status label >= 11px
recovery body >= 12px
action >= 12px
```

Unknown mutation outcome must never be conveyed through microtype.

---

## 10. Resolver rules

For resolver drawers:

```text
drawer title >= 20px
form labels >= 11px
input/select values >= 12px
filters/actions >= 12px
evidence labels >= 11px
evidence values >= 12px
helper/recovery body >= 12px
```

The 500px drawer does NOT receive a smaller semantic scale than the main surface.

---

## 11. Table rules

Dense tables must preserve readability.

```text
header >= 11px
cell/value >= 12px
row action >= 12px
badge may be 10px only when redundant
```

A table may:

- scroll,
- reflow,
- wrap,
- use responsive column behavior

before text is reduced below semantic minimums.

“Need to fit more columns” is not justification for 10px operational table content.

---

## 12. Profile rules

Profile is a high-risk surface.

Use:

```text
comparison label >= 11px
comparison value >= 12px
rationale >= 12px
decision field label >= 11px
decision input >= 12px
alert/error >= 12px
```

Owner approval of reusable interpretation must not depend on 8–10px copy.

---

## 13. Review / Commit rules

Review / Commit is consequential.

Use:

```text
phase body >= 12px
snapshot label >= 11px
snapshot value >= 12px
reason label >= 11px
reason field >= 12px
acknowledgment >= 12px
inline/error body >= 12px
button >= 12px
```

Do not use `type-micro` for any Review/Commit decision semantics.

---

## 14. Stepper exception

The six-step Import stepper is geometry-sensitive.

Its secondary description may target:

```text
10px
```

rather than 11–12px if required for stable layout.

But:

- 8px is not allowed for production orientation text,
- clipping is not allowed,
- one-character wrapping is not allowed,
- role parity must remain intact.

Treat stepper normalization as explicit visual-regression work.

---

## 15. OWNER / STAFF parity

Equivalent OWNER and STAFF states must resolve to the same typography tokens.

Authority may change:

- copy,
- available actions,
- control state

but not readability.

Do not use role-specific font-size patches unless the semantic role is actually different.

---

## 16. Do not solve copy problems with typography

Typography normalization is separate from copy provenance.

Do not:

- delete useful copy because it is small,
- preserve unsupported copy merely because its font was normalized,
- rewrite approved MagicPath copy during typography work.

First determine whether text belongs.
Then assign the correct semantic token.

---

## 17. No arbitrary production 8px / 9px

New production code must not introduce arbitrary:

```css
font-size: 8px;
font-size: 9px;
```

for user-facing operational content.

If such a value is required for prototype-only UI, isolate it clearly.

---

## 18. Controlled implementation strategy

Do NOT apply a global multiplier.

Forbidden patterns include:

```text
all 8px → 11px
all 9px → 11px
all 10px → 12px
```

across the entire codebase without semantic review.

Normalize family-by-family.

After each family:

1. render representative states,
2. inspect geometry,
3. fix layout if needed,
4. verify semantics remain visible,
5. then continue.

---

## 19. Layout risk classes

### LOW / LOW–MEDIUM

Typical:

- evidence blocks
- before/after cards
- recovery copy
- completion metadata

### MEDIUM

Typical:

- resolver controls
- Source Context
- Sales/Supplier drawers
- History Correction
- Review/Commit

### MEDIUM–HIGH / HIGH

Typical:

- dense tables
- Profile comparison
- six-step stepper

Higher-risk families require dedicated visual regression before acceptance.

---

## 20. Visual regression baseline

When safe controlled rendering is available, validate at approximately:

```text
1440px desktop width
100% browser zoom
```

Also validate the existing supported narrow/mobile controlled viewport where relevant.

Check:

- no clipping
- no hidden evidence
- no one-character wrapping
- no footer/action collision
- no unreadably compressed columns
- no horizontal document overflow
- correct drawer behavior
- correct OWNER/STAFF parity

---

## 21. Backend safety boundary

Typography normalization must not require live BE access.

Do not:

- modify live BE,
- change API contracts,
- change mutation logic,
- perform consequential real mutations,
- claim live E2E.

Controlled fixture/component rendering is sufficient for visual regression when it represents the actual production component.

Report live status separately.

---

## 22. No behavior refactor

Typography work must not casually change:

- event handlers
- state transitions
- routes
- permissions
- API calls
- request payloads
- mutation behavior
- recovery semantics
- Store scoping
- Profile lifecycle
- Planning lifecycle

If visual work reveals a behavior defect, report it separately.

---

## 23. Shared primitive preference

If multiple Import states share the same typography family, fix the shared primitive/token.

Prefer:

```text
shared semantic token
```

over:

```text
state-specific font-size override
```

Avoid CSS patch accumulation.

---

## 24. Source-level QA

Frontend/Codex QA should flag:

- raw production `<10px` declarations,
- actions/controls `<12px`,
- table values `<12px`,
- evidence values `<12px`,
- evidence/form/table labels `<11px`,
- error/recovery copy `<12px`,
- equivalent semantic roles using different tokens,
- OWNER/STAFF token divergence.

Prototype-only selectors must be excluded.

---

## 25. Completion standard

Typography normalization is complete only when:

- meaningful production text is >=10px,
- semantic minimums are respected,
- shared Import primitives use stable tokens,
- high-risk layouts have rendered evidence,
- OWNER/STAFF parity is preserved,
- no business/runtime behavior changed,
- remaining exceptions are explicitly documented.

---

## 26. Final rule

> **Use font size to express semantic hierarchy, not available space.**
