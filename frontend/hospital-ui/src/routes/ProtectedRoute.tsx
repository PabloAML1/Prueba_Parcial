import { type ReactNode, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Ctx } from "../features/auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const context = useContext(Ctx);
  const loc = useLocation();

  if (!context) return null;
  if (context.loading) return null;
  if (!context.isAuthenticated)
    return <Navigate to="/login" replace state={{ from: loc }} />;

  return <>{children}</>;
}
