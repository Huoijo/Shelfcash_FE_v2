import { createContext, useContext } from 'react'
import type { AuthContext, LoginCredentials } from './auth.types'

export type AuthState =
  | { status: 'bootstrapping' }
  | { status: 'authenticated'; context: AuthContext }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string }
  | { status: 'mock_preview' }
export type AuthValue = {
  state: AuthState
  login: (credentials: LoginCredentials) => Promise<void>
  refresh: () => Promise<void>
  logout: () => Promise<void>
}
export const AuthContextValue = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContextValue)
  if (!value) throw new Error('AuthProvider is required.')
  return value
}
