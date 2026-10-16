You are the lead integration QA engineer for ShelfCash.

You have access to both the frontend and backend repositories and to their local running instances.

Your objective is NOT to make the application merely “work”.

Your objective is to systematically discover as many FE↔BE integration defects as reasonably possible, with reproducible evidence.

Treat this as a production-readiness integration audit.

Do not start modifying code immediately.

==================================================
PRIMARY GOAL
==================================================

Perform an exhaustive FE–BE integration audit covering:

- routes
- screens
- components
- user roles
- permissions
- Store scope
- UI states
- lifecycle states
- API contracts
- queries
- mutations
- navigation
- persistence
- error handling
- loading states
- empty states
- retries
- refresh behavior
- browser history
- concurrency/race conditions
- stale state
- network failures
- backend validation
- authorization failures

The audit must be evidence-driven.

Do not declare a flow correct merely because the UI renders or a request returns HTTP 200.

Verify the entire state transition.

==================================================
PHASE 0 — SAFETY / BASELINE
==================================================

Before testing:

1. Inspect repository status.
2. Do not commit, push, reset, rebase, delete data, or rewrite existing work.
3. Record the current FE and BE revisions.
4. Identify how FE and BE are started locally.
5. Identify frontend URL and backend/API URL.
6. Identify test accounts / roles / seed data already available.
7. Do not silently alter production-facing behavior to make tests pass.
8. Do not edit code during the discovery passes unless application startup itself is impossible.

Report any environmental blocker separately from product defects.

==================================================
PHASE 1 — BUILD A SYSTEM MAP
==================================================

Inspect BOTH repositories before interacting with the UI.

Build an inventory of:

FRONTEND
- application routes
- nested routes
- authenticated routes
- public routes
- navigation destinations
- API client modules
- query hooks
- mutation hooks
- DTO/types/interfaces
- permission gates
- role checks
- Store-scoped logic
- loading UI
- empty UI
- error UI
- dialogs
- drawers
- forms
- pagination
- filtering
- sorting
- URL/search parameters
- local/session storage usage
- cache/state management

BACKEND
- routes/endpoints
- HTTP methods
- request schemas
- response schemas
- enum values
- nullable fields
- validation rules
- authorization rules
- Store ownership/scoping
- pagination
- filtering
- sorting
- lifecycle transitions
- relevant database constraints
- documented error statuses

Then map:

Frontend consumer
→ backend endpoint
→ request contract
→ response contract
→ authorization requirement
→ expected UI state

Identify immediately:

- frontend calls with no matching backend endpoint
- backend endpoints unused by frontend
- method mismatches
- path mismatches
- field-name mismatches
- enum mismatches
- optional/nullability mismatches
- wrong IDs
- wrong Store scope
- wrong query parameter names
- pagination mismatches
- incorrect assumptions about success/error responses

Create:

`integration-audit/COVERAGE_MATRIX.md`

Do NOT begin fixes yet.

==================================================
PHASE 2 — CONSTRUCT THE STATE MATRIX
==================================================

Do not test only pages.

Test STATES.

Derive the meaningful Cartesian product of:

ROUTE
× USER ROLE
× PERMISSION
× STORE CONTEXT
× DATA STATE
× LIFECYCLE STATE
× ACTION

Reduce impossible combinations, but explicitly document why they are impossible.

At minimum consider:

USER
- unauthenticated
- authenticated
- valid session
- expired/invalid session

AUTHORIZATION
- Owner
- Staff
- allowed
- forbidden

STORE
- no Store
- one Store
- multiple Stores
- selected Store
- stale/invalid Store ID
- Store user cannot access

DATA
- loading
- populated
- empty
- partial
- stale
- invalid/missing referenced entity

MUTATIONS
- idle
- submitting
- success
- validation failure
- permission failure
- conflict
- backend failure
- network failure

For lifecycle-based features, enumerate every backend-supported lifecycle state rather than assuming only the visually obvious states exist.

Add every discovered case to COVERAGE_MATRIX.md.

Every case must have one of:

NOT_RUN
PASS
FAIL
BLOCKED
NOT_APPLICABLE

Never leave a case implicit.

==================================================
PHASE 3 — STATIC CONTRACT AUDIT
==================================================

Audit FE ↔ BE contracts without relying on UI behavior.

For every integration boundary compare:

- endpoint path
- HTTP method
- path parameters
- query parameters
- request body
- response body
- enum casing
- date/time format
- nullable fields
- omitted fields
- array/object shape
- HTTP status codes
- error payload
- authorization assumptions
- Store-scoping assumptions

Pay special attention to:

- frontend fallback values hiding malformed responses
- `any` / loose typing masking API mismatch
- silently ignored response fields
- optimistic updates
- cache invalidation
- stale query keys
- mutation success handlers
- backend defaults that differ from frontend defaults

Record defects before modifying anything.

==================================================
PHASE 4 — LIVE BROWSER SWEEP
==================================================

Now use the live frontend connected to the live local backend.

For EVERY runnable case in COVERAGE_MATRIX.md:

1. Navigate to the initial state.
2. Capture the initial UI state.
3. Perform the user action.
4. Inspect browser console.
5. Inspect network request.
6. Verify:
   - request URL
   - HTTP method
   - request payload
   - request headers where relevant
   - response status
   - response payload
7. Verify resulting UI state.
8. Verify navigation.
9. Verify backend-side state when feasible.
10. Refresh the page.
11. Verify that persisted state remains correct.
12. Revisit the destination from a deep link where applicable.
13. Mark the matrix result.
14. Capture screenshot/evidence for failures.

A successful HTTP request is NOT sufficient evidence of a passing test.

The UI, server state, cache state and persisted state must agree.

==================================================
PHASE 5 — ADVERSARIAL / NEGATIVE TESTING
==================================================

For applicable endpoints and flows test behavior under:

HTTP / API
- 400
- 401
- 403
- 404
- 409
- 422
- 429 if applicable
- 500
- malformed response if realistically simulatable

NETWORK
- slow request
- timeout
- connection loss
- request interrupted
- retry

USER INTERACTION
- rapid double click
- repeated submit
- submit while previous request is pending
- close dialog during request
- navigate away during request
- browser back
- browser forward
- refresh during flow
- open same entity in multiple tabs

STATE
- stale entity
- entity deleted by another actor
- permission changed while page is open
- Store membership changed while page is open
- stale selected Store
- expired authentication
- stale cached response

INPUT
- empty
- whitespace-only
- min/max lengths
- boundary numbers
- invalid enum
- invalid date
- Unicode / Vietnamese input
- duplicated values
- invalid IDs

Look especially for:

- duplicate mutations
- phantom success toast
- UI reporting success despite failed mutation
- button permanently disabled
- spinner permanently running
- stale cached rows
- stale counters
- data appearing under wrong Store
- unauthorized controls visible
- unauthorized API calls
- swallowed backend errors
- raw backend errors exposed to users
- blank screens
- uncaught promises
- React exceptions
- console errors
- request loops
- redirect loops

==================================================
PHASE 6 — NAVIGATION AUDIT
==================================================

For every meaningful destination test:

- sidebar navigation
- buttons
- table rows
- dialogs/drawers
- success redirects
- browser back/forward
- direct URL entry
- reload on direct URL
- invalid entity URL
- unauthorized URL
- bookmarked URL

Check that UI state is reconstructed correctly from the server after refresh.

Do not rely solely on in-memory frontend state.

==================================================
PHASE 7 — AUTHORIZATION AUDIT
==================================================

Do NOT treat hidden buttons as authorization.

For every privileged mutation:

1. Verify UI visibility rules.
2. Verify frontend guard.
3. Attempt direct API request as unauthorized role where safe.
4. Verify backend enforcement.
5. Verify correct error handling in frontend.
6. Verify no sensitive data leaks in response.
7. Verify Store scoping cannot be bypassed by replacing Store/entity IDs.

Any operation that is prevented only by frontend UI is a high-severity defect.

==================================================
PHASE 8 — DATA CONSISTENCY AUDIT
==================================================

After every meaningful mutation compare:

USER ACTION
→ outgoing request
→ backend response
→ persisted backend state
→ frontend cache/state
→ rendered UI
→ state after refresh

Look for inconsistencies caused by:

- optimistic updates
- missing invalidation
- incorrect query keys
- stale Store scope
- reordered results
- pagination
- filters
- derived counts
- date/time timezone handling

==================================================
BUG RECORD FORMAT
==================================================

Create:

`integration-audit/BUGS.md`

Each defect must have:

ID:
Severity:
Area:
Route:
Role:
Store context:
Precondition:

Steps to reproduce:

Expected:

Actual:

Frontend evidence:

Network evidence:

Backend evidence:

Console evidence:

Screenshot/evidence path:

Suspected integration boundary:

Likely root cause:

Confidence:
HIGH / MEDIUM / LOW

Do not combine unrelated defects.

==================================================
SEVERITY
==================================================

P0
Security breach, destructive corruption, application unusable.

P1
Critical user flow impossible, authorization bypass, wrong Store data, persistent data corruption.

P2
Feature materially broken, incorrect state transition, failed recovery/error handling.

P3
Minor functional defect, confusing state, recoverable inconsistency.

P4
Cosmetic/polish issue with no meaningful functional impact.

Prioritize correctness and data integrity over visual polish.

==================================================
IMPORTANT BEHAVIOR
==================================================

Do not stop after finding the first defects.

Do not start polishing UI while integration defects remain unexplored.

Do not assume an endpoint is correct because another similar endpoint works.

Do not assume a component is correct because another state of the same component works.

Do not skip cases merely because the implementation appears obviously correct from source inspection.

Do not silently fix defects during discovery.

Continue until the current coverage matrix has been executed as far as the environment allows.

==================================================
DISCOVERY COMPLETION CRITERIA
==================================================

The discovery phase is complete only when:

1. All known frontend routes are inventoried.
2. All frontend API consumers are mapped.
3. All relevant backend endpoints are mapped.
4. All meaningful roles are covered.
5. All meaningful Store contexts are covered.
6. All lifecycle states discovered in code/API are represented.
7. All meaningful mutations have success and failure coverage.
8. Authorization is verified both client-side and server-side.
9. Refresh/deep-link behavior is checked.
10. Every matrix row is PASS, FAIL, BLOCKED or NOT_APPLICABLE.

Then perform one additional exploratory sweep looking specifically for states missing from the matrix.

If new state categories are discovered, extend the matrix and test them.

==================================================
FINAL DISCOVERY REPORT
==================================================

Produce:

`integration-audit/REPORT.md`

Include:

A. Environment

B. FE↔BE architecture discovered

C. Coverage summary
- total cases
- passed
- failed
- blocked
- not applicable

D. Defect summary
- P0
- P1
- P2
- P3
- P4

E. API contract defects

F. Authorization defects

G. State-management/cache defects

H. Navigation/persistence defects

I. Error/recovery defects

J. Untested or blocked areas

K. Recommended fix order

L. Confidence level

Do not claim “fully tested” or “bug free”.

State precisely what was and was not exercised.

STOP after producing the discovery report.

Do NOT implement fixes until explicitly instructed.
