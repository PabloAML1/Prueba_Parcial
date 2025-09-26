import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/apiClient";

export interface DashboardGlobalMetrics {
  totalCenters: number;
  totalSpecialties: number;
  totalDoctors: number;
  totalEmployees: number;
  totalAppointments: number;
  upcomingAppointments: number;
}

export interface DashboardCenterMetrics {
  id: number;
  name: string;
  address: string;
  doctors: number;
  employees: number;
  specialties: number;
  totalAppointments: number;
  upcomingAppointments: number;
}

export interface DashboardMetricsResponse {
  global: DashboardGlobalMetrics;
  centers: DashboardCenterMetrics[];
}

const dashboardKeys = {
  all: ["dashboard", "metrics"] as const,
};

async function fetchDashboardMetrics(): Promise<DashboardMetricsResponse> {
  return apiRequest<DashboardMetricsResponse>("/dashboard/metrics");
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboardMetrics,
    staleTime: 60_000,
  });
}

export { dashboardKeys };
