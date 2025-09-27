import { createContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";

export interface AuthCtx {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  backendUrl: string;
  loading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(true);

  const login = () => setIsAuthenticated(true);

  const logout = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/users/auth/logout-admin`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/users/auth/is-auth-admin`,
          { withCredentials: true }
        );

        if (data.success && data.user?.role === "ADMIN") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [backendUrl]);

  return (
    <Ctx.Provider
      value={{ isAuthenticated, login, logout, backendUrl, loading }}
    >
      {children}
    </Ctx.Provider>
  );
}

export { Ctx };