import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { apiRequest } from "../../lib/apiClient";

export interface AuthCtx {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  backendUrl: string;
  loading: boolean;
  user: AuthUser | null;
  refreshUser: () => Promise<void>;
}

export interface DoctorProfile {
  id: number;
  name: string;
  specialtyId: number | null;
  centerId: number | null;
  specialtyName: string | null;
  centerName: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MEDICO";
  isAccountVerified: boolean;
  doctor: DoctorProfile | null;
}

interface UserDataDto {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MEDICO";
  is_account_verified: 0 | 1 | boolean;
  medicoData?: null | {
    id: number;
    nombre: string;
    especialidad_id: number | null;
    id_centro: number | null;
    especialidad: string | null;
    centro: string | null;
  };
}

const mapUserDto = (dto: UserDataDto): AuthUser => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  isAccountVerified: Boolean(dto.is_account_verified),
  doctor: dto.medicoData
    ? {
        id: dto.medicoData.id,
        name: dto.medicoData.nombre,
        specialtyId: dto.medicoData.especialidad_id ?? null,
        centerId: dto.medicoData.id_centro ?? null,
        specialtyName: dto.medicoData.especialidad ?? null,
        centerName: dto.medicoData.centro ?? null,
      }
    : null,
});

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiRequest<{
        success: boolean;
        userData?: UserDataDto;
      }>("/users/user/data");

      if (response.success && response.userData) {
        setUser(mapUserDto(response.userData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
      setUser(null);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    void refreshUser();
  };

  const logout = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/users/auth/logout-doctor`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/users/auth/is-auth-doctor`,
          { withCredentials: true }
        );

        if (data.success) {
          if (data.user?.role === "MEDICO") {
            setIsAuthenticated(true);
            await refreshUser();
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [backendUrl, refreshUser]);

  return (
    <Ctx.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        backendUrl,
        loading,
        user,
        refreshUser,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export { Ctx };
