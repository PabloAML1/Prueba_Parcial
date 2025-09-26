export interface AuthCtx {
  isAuthenticated: boolean
  token: string | null
  backendUrl: string
  login: (token: string) => void
  logout: () => void
}
