export interface AuthCtx {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}