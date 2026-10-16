# Review guide — NEW_ENGINE

Read `ENGINE_REVIEW_NEW_ENGINE_VI.md`, then `review_metadata/SNAPSHOT.json` and `GIT_STATUS_REDACTED.txt`. This is a selected working-tree overlay from `Forecast_Engine_FandB`, not a whole-repository or pure-commit archive. Repository files preserve their relative paths. Audit-created files are identified separately in the manifest.

Trace from `optimization/planning_service.py` to `optimizer.py`, `lot_milp.py`, `resimulation.py`, `critic.py`, and `inventory/simulator.py`. Trace forecast through `pipeline/inference_pipeline.py`, `data/demand_reconstruction.py`, `features/`, `registry/loader.py`; then dated BOM and scenario generation. `review_metadata/SOURCE_INDEX.json` lists symbols and exact line locations in the packaged bytes.

Treat docs, handoff claims and example responses as context, not executed proof. `HANDOFF_VALIDATION.json` is historical self-report without a HEAD-bound journal. No runtime suite or solver was executed for this audit. Read evidence limitations before comparing scores or counting tests. M6 corpus tests are synthetic explanation/authority fixtures, not production procurement benchmarks.

Verify the archive without dependencies or importing engine code:

```powershell
python -B verify_review.py <archive.zip>
python -B verify_review.py <archive.zip> --source-root <Forecast_Engine_FandB>
```

Optional future reproduction in an authorized isolated environment (NOT executed by this audit): install dependencies from `pyproject.toml` / the separately supplied pinned environment; then select meaningful cases:

```powershell
python -B -m pytest -p no:cacheprovider tests/test_regressions_v2.py::test_r34_real_scipy_candidate_passes_exact_m4_and_critic -q
python -B -m pytest -p no:cacheprovider tests/test_forecast_origin_safety.py -q
python -B -m pytest -p no:cacheprovider tests/test_json_output.py -q
python -B -m shelfcash_pipeline.typed_runner --request schemas/generalization_v2/examples/accepted_nonempty.request.json --output <fresh-output-directory>
```

Typed planning runs a bounded native solver and creates outputs; it is a reproduction instruction, not an audit result. Do not run setup/training/provider/long benchmarks just to manufacture evidence. Full asset/forecast/E2E tests need omitted demo workbooks, model weights and residual files. Request an authorized asset bundle from the owner and compare actual bytes with `review_metadata/OMITTED_ASSETS.json`. No data download URL or credential is bundled.

Host BE still needs its own `/1` and `/2` contracts, adapter, worker/capture/persistence/retention/access control, facts and approved business policy. There is no BE deployment or integration in this archive. `OMISSIONS.md` states limits.
