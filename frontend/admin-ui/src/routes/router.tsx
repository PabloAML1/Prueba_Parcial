import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import Layout from "../layouts/Layout";
import DashboardPage from "../features/dashboard/DashboardPage";
import SpecialtiesPage from "../features/specialties/SpecialtiesPage";
import HospitalsPage from "../features/hospitals/HospitalsPage";
import EmployeesPage from "../features/employees/EmployeesPage";
import DoctorsPage from "../features/doctors/DoctorsPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "specialties", element: <SpecialtiesPage /> },
      { path: "hospitals", element: <HospitalsPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "doctors", element: <DoctorsPage /> },
      // add more: /app/{resource}
    ],
  },
  { path: "*", element: <Navigate to="/app" replace /> },
]);
