# ShelfCash Copy Provenance & Adjudication Rules

> Persistent rules for Codex and other implementation agents.
>
> Scope: production-facing explanatory copy, subtitles, helper text, labels, descriptive microcopy, and runtime copy added during frontend implementation.
>
> This file complements the existing visual-fidelity rules. When both apply:
> - MagicPath remains the visual source of truth.
> - Product/API contracts remain the runtime/behavior source of truth.
> - This file decides whether production-facing copy is legitimate, removable, or requires product review.

---

## 1. Core principle

Every production-facing explanatory string must have defensible provenance.

Frontend-authored copy does **not** receive a presumption of legitimacy.

The implementation must be able to answer:

> Why is this text visible?

Every reviewed string must end in one final classification below.

---

## 2. Final classifications

### `MAGICPATH_EXACT`
The same user-facing wording exists in the current canonical MagicPath state.

Action: `KEEP`

Do not rewrite during an implementation-convergence pass.

### `MAGICPATH_SEMANTIC`
The wording differs, but the current canonical MagicPath clearly communicates the same information in the equivalent state.

Requirements:
- semantic counterpart is identifiable,
- state/context matches,
- FE copy introduces no additional product meaning.

Action: `KEEP`

Wording normalization belongs to a separate design/copy task.

### `CONTRACT_REQUIRED`
The copy is absent from MagicPath, but removing it would make actual runtime behavior unsafe, misleading, ambiguous, or materially incomplete.

Valid examples:
- unknown mutation outcome,
- stale/version conflict,
- permission loss,
- retry safety,
- reason/ack requirements,
- batch-only vs reusable scope,
- persisted vs staged state,
- unsupported runtime action,
- missing value vs zero,
- recovery instructions required to avoid duplicate mutation.

Action: `KEEP_MINIMAL`

The burden of proof is on the implementation. A contract, code path, state-machine rule, API behavior, or product specification must justify it.

### `DYNAMIC_DATA`
The visible value comes from runtime/user/business data.

Examples: Store, Run, filename, actor, count, amount, date, timezone, status, field value, evidence value.

Action: `KEEP`

### `UNSUPPORTED_COPY`
The copy is:
- not present in canonical MagicPath,
- not semantically represented there,
- not required by runtime/safety behavior,
- not dynamic data.

Action: `REMOVE`

This includes implementation-authored subtitles/helper copy added only to make the UI feel more explanatory.

### `REVIEW_REQUIRED`
The agent cannot safely determine whether the copy encodes product meaning, safety semantics, an undocumented contract, or a legitimate MagicPath semantic counterpart.

Action: `DO_NOT_AUTO_EDIT` + `REPORT`

This is valid only when uncertainty is explicit and evidenced.

---

## 3. Forbidden terminal state

The following is NOT acceptable:

```text
UNMATCHED_BUT_PRESERVED
```

or equivalents such as:
- kept for safety,
- possibly useful,
- seems intentional,
- might be needed,
- left untouched because uncertain.

If uncertain, use `REVIEW_REQUIRED` and explain why.

---

## 4. Burden-of-proof rule

If copy is absent from canonical MagicPath:

1. test whether it is `MAGICPATH_SEMANTIC`;
2. otherwise prove it is `CONTRACT_REQUIRED` or `DYNAMIC_DATA`;
3. if not provable, classify `UNSUPPORTED_COPY`;
4. if evidence is genuinely conflicting/incomplete, classify `REVIEW_REQUIRED`.

Do not default to preservation.

---

## 5. Exact matching is insufficient

Do not classify by literal string matching alone.

Example:

```text
MagicPath: Cấu hình một Planning Run cho Store hiện tại.
FE:        Cấu hình một lần chạy cho cửa hàng hiện tại.
```

If they clearly communicate the same thing in the same state, classify `MAGICPATH_SEMANTIC`.

An exact string found only in a legacy component, archived revision, prototype-only control, different state, different role, or unrelated workspace does not authorize current FE copy.

---

## 6. Canonical design rule

Only the current canonical MagicPath family/state may authorize `MAGICPATH_EXACT` or `MAGICPATH_SEMANTIC`.

Do not use:
- legacy Input Flow,
- archived revisions,
- obsolete worker experiments,
- prototype QA controls,
- unrelated sibling components

as production-copy provenance.

---

## 7. State-specific provenance

Provenance must be checked in the equivalent state.

A sentence present in `Import → Profile Review` does not automatically authorize the same sentence in `Import → Completion`.

---

## 8. Role-specific provenance

OWNER and STAFF may share copy when semantics are equivalent.

Role-specific authorization/workflow copy must be evaluated in the correct role context.

Do not use OWNER-only approval copy to justify STAFF copy unless the same meaning is valid for STAFF.

---

## 9. Audit more than `<p>` and `<small>`

Production-facing copy may exist in:
- JSX literals,
- component props,
- presentation dictionaries,
- helper-text props,
- labels,
- placeholders,
- empty states,
- status descriptions,
- modal/drawer descriptions,
- table-cell renderers,
- validation messages,
- banners,
- tooltips,
- button-adjacent descriptions,
- state/config objects.

Do not claim a complete census if only literal `p`/`small` elements were searched.

---

## 10. Dynamic expressions

Split dynamic text conceptually into static copy plus runtime data.

Example:

```text
Đang xem Store {storeName}
```

Audit:

```text
"Đang xem Store" → provenance classification
{storeName}       → DYNAMIC_DATA
```

Runtime interpolation does not legitimize unsupported static prose.

---

## 11. Subtitle adjudication

For every subtitle/helper/descriptive line:

### Step A — Canonical MagicPath?
- exact → `MAGICPATH_EXACT`
- clearly equivalent → `MAGICPATH_SEMANTIC`
- no → Step B

### Step B — Required by runtime/safety behavior?
- yes, with evidence → `CONTRACT_REQUIRED`
- no → Step C

### Step C — Dynamic data?
- yes → `DYNAMIC_DATA`
- no → `UNSUPPORTED_COPY`

### Step D — Genuinely ambiguous evidence?
Only then → `REVIEW_REQUIRED`

---

## 12. “Useful” is not sufficient

These reasons do NOT justify `CONTRACT_REQUIRED`:
- helps the user understand,
- good UX,
- provides extra context,
- makes the page clearer,
- explains the feature,
- feels safer,
- common design pattern.

`CONTRACT_REQUIRED` requires a concrete runtime/product/safety dependency.

---

## 13. Contract-required copy must be minimal

When extra runtime copy is necessary:
- say only what the user must know,
- avoid internal backend terminology,
- avoid implementation detail,
- avoid repeating heading/status,
- avoid large explanatory paragraphs.

Prefer concise safety copy when it preserves meaning.

---

## 14. Preserve critical semantic distinctions

Do not remove copy if it is required to distinguish:
- Profile approved ≠ data imported,
- Review confirmed ≠ Commit completed,
- Import completed ≠ Readiness passed,
- Readiness passed ≠ Planning completed,
- notification read ≠ business action handled,
- verified email ≠ Store exists,
- verified email ≠ invitation accepted,
- reusable Profile change ≠ batch-only fact,
- failed mutation ≠ unknown outcome,
- request changes ≠ reject,
- current value ≠ proposed value,
- missing value ≠ zero,
- staged correction ≠ committed mutation.

If a distinction is communicated only through copy, treat it as potentially `CONTRACT_REQUIRED`.

---

## 15. Redundancy rule

Even valid provenance does not authorize FE-only duplicated meaning.

If canonical MagicPath intentionally contains both title and subtitle, preserve it during convergence.

But implementation-only repetition should be classified `UNSUPPORTED_COPY` when it adds no distinct meaning.

---

## 16. Copy deletion safety

Before removing copy, confirm deletion does not remove the only visible explanation of:
- why an action is blocked,
- what scope an action affects,
- whether a mutation is persisted,
- whether the user may retry,
- whether Owner approval is required,
- whether data is reusable,
- what changed,
- what remains pending.

If it does, do not delete without identifying the replacement semantic carrier.

---

## 17. No redesign during adjudication

Copy adjudication is not permission to redesign.

Do not:
- change major geometry,
- restructure workflow,
- move actions,
- rewrite MagicPath copy,
- introduce new cards,
- redesign hierarchy

unless a separate task explicitly authorizes it.

Safe spacing cleanup caused by removing unsupported copy is allowed.

---

## 18. Copy-led layout cleanup

When unsupported copy is removed:
- close unnecessary vertical gaps,
- restore canonical spacing,
- avoid leaving empty wrappers,
- remove unused subtitle containers/classes when safe,
- preserve surrounding control alignment.

Do not leave visual scars from deleted copy.

---

## 19. No live backend requirement

Copy adjudication must not require live BE access.

Do not:
- modify live BE,
- perform real consequential mutations,
- invent backend behavior,
- claim live E2E verification.

Use existing code/contracts/tests/controlled evidence to justify `CONTRACT_REQUIRED`.

If runtime meaning cannot be proven safely, use `REVIEW_REQUIRED` or document the unresolved runtime dependency.

---

## 20. Evidence requirement

Each adjudicated copy item should record enough evidence to reproduce the decision.

Recommended fields:

```text
id
workspace
component/file
state
role
copy
classification
action
MagicPath evidence
contract/runtime evidence
reason
```

For `UNSUPPORTED_COPY`, explicitly establish:

```text
No canonical counterpart.
No runtime/safety requirement.
Not dynamic data.
```

---

## 21. Review-required quality bar

`REVIEW_REQUIRED` must not become a dumping ground.

Every review item must explain:
1. evidence found,
2. evidence missing/conflicting,
3. product decision required,
4. temporary disposition.

Do not use `REVIEW_REQUIRED` merely to avoid making a decision.

---

## 22. Batch adjudication

Group repeated identical or semantically identical copy when all of these match:
- same state meaning,
- same role behavior,
- same runtime requirement.

One adjudication may cover multiple occurrences if coverage is explicit.

---

## 23. Complete-pass requirement

A copy-provenance pass is complete only when every in-scope candidate has one of:

```text
MAGICPATH_EXACT
MAGICPATH_SEMANTIC
CONTRACT_REQUIRED
DYNAMIC_DATA
UNSUPPORTED_COPY
REVIEW_REQUIRED
```

No candidate may remain merely:

```text
unmatched
unclassified
preserved-by-default
```

---

## 24. Reporting metrics

At the end of a full pass, report counts for all six classifications plus:
- removed occurrences,
- preserved occurrences,
- review items,
- files changed,
- states affected.

Raw exact-match counts alone are not sufficient.

---

## 25. Completion verdict

Use one of:

```text
COPY PROVENANCE CLOSED
```

All in-scope copy has final classification and no unresolved product review remains.

```text
COPY PROVENANCE CLOSED — REVIEW ITEMS REMAIN
```

All in-scope copy has final classification, but explicit `REVIEW_REQUIRED` items remain.

```text
COPY PROVENANCE INCOMPLETE
```

Some candidates remain unclassified.

Do not use a visual-convergence PASS to hide incomplete copy adjudication.

---

## 26. One-line rule

> **If the frontend adds words that MagicPath does not, prove why the product needs them — otherwise remove them.**
