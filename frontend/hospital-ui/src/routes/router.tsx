import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import Layout from "../layout/Layout";
import DashboardPage from "../features/dashboard/DashboardPage";
import AppointmentsPage from "../features/appointments/AppointmentsPage";


export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "appointments", element: <AppointmentsPage /> },

      // add more: /app/{resource}
    ],
  },
  { path: "*", element: <Navigate to="/app" replace /> },
]);
