import test from 'node:test'
import assert from 'node:assert/strict'
import { authenticatedReturnPath } from '../src/features/auth/auth.navigation'

test('Login return preserves canonical planning locator and fragment', () => {
  const target = '/forecast/planning?plan_id=d0900000-0000-4000-8000-000000000001#ingredients'
  assert.equal(authenticatedReturnPath(target), target)
})

test('Login return retains forecast aliases and existing protected destinations', () => {
  for (const target of ['/forecast', '/forecast/planning/results?plan_id=run', '/inventory', '/menu?q=tea', '/imports/history#recent'])
    assert.equal(authenticatedReturnPath(target), target)
})

test('Login return rejects foreign origins, prefix lookalikes and non-string values', () => {
  for (const target of ['//evil.example/forecast', 'https://evil.example/forecast', '/forecastevil', '/imports-evil', '/login', '', undefined, null, 7, {}])
    assert.equal(authenticatedReturnPath(target), '/imports')
})
