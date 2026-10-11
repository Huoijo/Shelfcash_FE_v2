export type LoginCredentials = {
  email: string
  password: string
  remember_me: boolean
}

export type AuthContext = {
  user: { user_id: string; email: string; display_name: string }
  session: { expires_at: string; absolute_expires_at: string; csrf_token: string }
  default_store_id: string | null
  accessible_store_count: number
  authorization_version: string
}

export type AuthDataSource = {
  login(credentials: LoginCredentials): Promise<AuthContext>
  readSession(signal?: AbortSignal): Promise<AuthContext>
  logout(): Promise<void>
}
