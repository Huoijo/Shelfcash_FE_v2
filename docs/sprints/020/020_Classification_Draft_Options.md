# 020 — Immediate mapping options from classification draft

Date: 2026-10-16. User-requested behavior: selecting a sheet classification must immediately change the available column-mapping choices, before saving classification.

## Implementation

The existing Owner/Staff structure resolver now owns a classification draft shared by its classification and column editors. Selection immediately projects `schemas[].fields` from the already validated M03 response into the column selectors. There is no extra network round trip, invented schema query parameter, automatic M04 write or LLM call.

Changing type removes targets outside that type from the displayed selection. Empty/IGNORE/missing schema produces no candidate fields. Missing/stale/cross-sheet catalogue never falls back to the previous schema's choices. Server labels, requiredness, support and availability are preserved; `source_only` remains supported and unavailable/unsupported choices remain disabled.

The draft, reason and IGNORE acknowledgement survive navigation between issues within the same drawer. Closing/cancelling, switching import/sheet/revision or changing resolver group resets the draft scope. Neither M01 truth, mapping progress, Profile approval nor Preview pins are optimistically modified.

Column options shown for an unsaved classification are **draft catalogue choices**, not per-column server authorization. The existing form validation prevents confirming a column until classification is explicitly saved. A shared inline status explains that prerequisite. Saving classification retains M04's reason/key/CAS requirements; the existing workflow then reloads M01/M02/M03 and obtains authoritative per-column options with `mapping_id`. No staged column target is silently persisted or replayed.

## Design authority

Read current MagicPath project `458079658328604672` on this pass:

- OWNER component `460747146686242816`, current revision `461726308171411456`.
- STAFF component `460747115572916224`, current revision `461725038614315008`.

Inspected both current source contexts, including the structure/mapping resolver, scoped issue navigation and explicit-save behavior. Reused those existing controls and shared inline-status pattern. The classification-dependent options behavior is explicitly requested by the user; no new screen, drawer geometry, navigation branch or product workflow is designed. No remote design edits or new browser/rendered-design acceptance are claimed.

## Verification

- `npm run test:import`: **143 passed**, including 8 new classification-draft cases. Tests cover immediate projection without dispatch, actual selector SSR, retained controlled classification values, scope isolation, stale/missing catalogue, IGNORE/blank, saved per-column availability and unsupported choices.
- `npm run build`, `npm run check:import-wire`, `npm run lint`, `git diff --check`: passed. Lint retains the two warnings in unchanged Onboarding/RecipeSchedule files; build retains the large-chunk warning.
- Browser interaction/E2E/live BE: **NOT_RUN**. No new screenshots. Controlled tests are not live UI acceptance.

Source: [draft projection](../../../src/features/import-data/importClassificationDraft.ts), [resolver](../../../src/features/import-data/components/ImportResolveDrawers.tsx), [classification editor](../../../src/features/import-data/components/ImportResolutionEditor.tsx), [tests](../../../tests/import-mapping-ui.test.mjs). [Verification receipt](../../testing/PASS_020_CLASSIFICATION_DRAFT_VERIFICATION.json). Current status remains in [register V1](../../status/FOUND_MISSING_UI_V1.md), FM-009; broader descriptor ergonomics remains partial.
