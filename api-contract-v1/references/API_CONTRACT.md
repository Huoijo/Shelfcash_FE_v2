# API contract

## CURRENT FACT — implemented API

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/health` | No body or query parameters required | HTTP 200, `application/json`, HealthResponse |

```json
{"status": "ok", "service": "shelfcash-backend"}
```

`HealthResponse` is the Pydantic public schema: required `status` is literal `ok`;
required `service` is a string from configured app name (default `shelfcash-backend`);
additional properties are forbidden. Health is liveness only, with no database,
storage, LLM or business readiness check. No authentication is implemented.

FastAPI also serves schema metadata at `GET /openapi.json` (framework HEAD supported).
This is not a business operation in the generated OpenAPI paths. `/docs`, `/redoc`
and OAuth documentation redirects are disabled. No other routes are registered.

## ACCEPTED DECISION — public boundary policy

Use typed Pydantic request/response schemas. Do not freeze stable contracts using
arbitrary `dict[str, Any]`. Accept contract changes explicitly, test schema/behavior,
inspect OpenAPI diffs and then update this document. Do not silently change semantics.

## PROPOSED FUTURE SURFACE

The planning product contract and delegated design are documented in
[PROCUREMENT_API_CONTRACT_VI.md](../PROCUREMENT_API_CONTRACT_VI.md) (2026-10-09).
C01/C02 and C03 polling/result are design-only; C07 read responsibility is folded
into C03 v1. No corresponding route or public OpenAPI schema is implemented. The
three user-approved policies (temporal assumptions, money permissions, indefinite
retention) do not authorize runtime changes in this documentation turn.
Other future slices may define store
operational truth, forecast runs, decisions, hypothetical comparisons, mapping and
authorized explanations only after acceptance criteria and permissions are frozen.
These capabilities are not present in the current API.
