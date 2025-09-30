import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { DashboardGlobalMetrics, DashboardCenterMetrics } from "./api";

interface AdminReportsProps {
  selectedCenterId: "global" | number;
  data: {
    global: DashboardGlobalMetrics;
    centers: DashboardCenterMetrics[];
  } | null;
}

const COLORS = [
  "#1a659e",
  "#2a9d8f",
  "#f4a261",
  "#e76f51",
  "#9b5de5",
  "#f15bb5",
  "#00509d",
];

const AdminReports = ({ selectedCenterId, data }: AdminReportsProps) => {
  const selectedCenter = useMemo(() => {
    if (!data || selectedCenterId === "global") return null;
    return data.centers.find((c) => c.id === selectedCenterId) ?? null;
  }, [data, selectedCenterId]);

  const barData = useMemo(() => {
    if (!data) return [];
    return selectedCenterId === "global"
      ? data.centers.map((c) => ({
          name: c.name,
          Appointments: c.totalAppointments,
          Doctors: c.doctors,
          Employees: c.employees,
        }))
      : [
          {
            name: selectedCenter?.name ?? "Center",
            Appointments: selectedCenter?.totalAppointments ?? 0,
            Doctors: selectedCenter?.doctors ?? 0,
            Employees: selectedCenter?.employees ?? 0,
          },
        ];
  }, [data, selectedCenterId, selectedCenter]);

  const specialtyAppointmentsData = useMemo(() => {
    if (!data) return [];
    const centers =
      selectedCenterId === "global" ? data.centers : [selectedCenter!];
    const result: Record<string, number> = {};
    centers.forEach((center) => {
      Object.entries(center.specialtiesDistribution).forEach(
        ([name, count]) => {
          result[name] = (result[name] ?? 0) + count;
        }
      );
    });
    return Object.entries(result).map(([name, value]) => ({
      name,
      Appointments: value,
    }));
  }, [data, selectedCenter, selectedCenterId]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const metrics =
      selectedCenterId === "global"
        ? data.global.specialtiesDistribution ?? {}
        : selectedCenter?.specialtiesDistribution ?? {};
    return Object.entries(metrics).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data, selectedCenter, selectedCenterId]);

  const avgAppointmentsPerDoctorData = useMemo(() => {
    if (!data) return [];
    const centers =
      selectedCenterId === "global" ? data.centers : [selectedCenter!];
    return centers.map((center) => ({
      name: center.name,
      avgAppointments: center.doctors
        ? center.totalAppointments / center.doctors
        : 0,
    }));
  }, [data, selectedCenter, selectedCenterId]);

  if (!data)
    return <p className="text-sm text-slate-600">No data available for reports.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Gráfico 1 */}
      <div className="rounded-2xl border p-4 shadow-sm bg-white">
        <h2 className="text-base font-semibold mb-3">General Comparison</h2>
        {barData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg font-semibold text-slate-500">No data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Appointments" fill="#1a659e" />
              <Bar dataKey="Doctors" fill="#2a9d8f" />
              <Bar dataKey="Employees" fill="#f4a261" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gráfico 2 */}
      <div className="rounded-2xl border p-4 shadow-sm bg-white">
        <h2 className="text-base font-semibold mb-3">
          Specialties with Most Appointments
        </h2>
        {specialtyAppointmentsData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg font-semibold text-slate-500">No data</span>
          </div>

        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={specialtyAppointmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Appointments" fill="#7a95e8ff" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gráfico 3 */}
      <div className="rounded-2xl border p-4 shadow-sm bg-white">
        <h2 className="text-base font-semibold mb-3">
          Specialties with Doctors
        </h2>
        {pieData.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-lg font-semibold text-slate-500">No data</span>
        </div>

        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={70}
                label={({ name, value }) => `${name} (${value})`}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

{/* Gráfico 4 */}
<div className="rounded-2xl border p-4 shadow-sm bg-white">
  <h2 className="text-base font-semibold mb-3">
    Average Appointments per Doctor
  </h2>
  <ResponsiveContainer width="100%" height={250}>
    {avgAppointmentsPerDoctorData.length === 0 ? (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-lg font-semibold text-slate-500">No data</span>
      </div>
    ) : (
      (() => {
        const maxAvg = Math.max(
          ...avgAppointmentsPerDoctorData.map((d) => d.avgAppointments)
        );
        return (
          <RadarChart data={avgAppointmentsPerDoctorData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" fontSize={12} />
            <PolarRadiusAxis />
            <Radar
              name="Avg Appointments"
              dataKey="avgAppointments"
              stroke="#9b5de5"
              fill="#9b5de533"
              fillOpacity={0.6}
              label={(props: {
                cx: number;
                cy: number;
                x: number;
                y: number;
                value: number;
              }) => {
                const { x, y, value } = props;
                const percent = (value / maxAvg) * 100;
                return (
                  <text
                    x={x}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#333"
                  >
                    {`${percent.toFixed(1)}%`}
                  </text>
                );
              }}
            />
            <Legend />
          </RadarChart>
        );
      })()
    )}
  </ResponsiveContainer>
</div>

    </div>
  );
};

export default AdminReports;
