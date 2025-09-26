import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ClipboardList,
  Building2,
  Stethoscope,
  Users2,
  UserCog,
} from "lucide-react";
import {
  useDashboardMetrics,
  type DashboardCenterMetrics,
  type DashboardGlobalMetrics,
} from "./api";

const BLUE_PRIMARY = "#1a659e"; // Main dashboard blue
const BLUE_ACCENT = "#00509d"; // Accent blue for hover/gradients

type CenterSelection = "global" | number;
type MetricVariant = "primary" | "default";

interface MetricCardProps {
  title: string;
  value: number;
  description?: string;
  icon: LucideIcon;
  spanClass?: string;
  variant?: MetricVariant;
}

const numberFormatter = new Intl.NumberFormat("en-US");
const formatNumber = (value: number) => numberFormatter.format(value ?? 0);

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  spanClass,
  variant = "default",
}: MetricCardProps) {
  const isPrimary = variant === "primary";
  const cardClasses = [
    "rounded-2xl border p-6 shadow-sm transition",
    isPrimary
      ? `border-transparent bg-gradient-to-br from-[${BLUE_PRIMARY}] via-[${BLUE_ACCENT}] to-[${BLUE_PRIMARY}] text-white shadow-[${BLUE_ACCENT}]/40`
      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md",
    spanClass,
  ]
    .filter(Boolean)
    .join(" ");

  const iconWrapperClasses = isPrimary
    ? "flex h-11 w-11 items-center justify-center rounded-full bg-white/20"
    : `flex h-11 w-11 items-center justify-center rounded-full bg-[${BLUE_PRIMARY}] bg-opacity-10 text-[${BLUE_PRIMARY}]`;

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.3em] ${
              isPrimary ? "text-white/70" : `text-[${BLUE_PRIMARY}]`
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-3 text-3xl font-bold ${
              isPrimary ? "text-white" : `text-[${BLUE_ACCENT}]`
            }`}
          >
            {formatNumber(value)}
          </p>
          {description && (
            <p
              className={`mt-2 text-sm ${
                isPrimary ? "text-white/70" : "text-slate-600"
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <span className={iconWrapperClasses}>
          <Icon className={`h-5 w-5 ${isPrimary ? "text-white" : ""}`} />
        </span>
      </div>
    </div>
  );
}

function SkeletonGrid({
  count,
  spanClass,
}: {
  count: number;
  spanClass: string;
}) {
  return (
    <div className="grid auto-rows-[minmax(140px,auto)] gap-5 md:grid-cols-12">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${spanClass}`}
        >
          <div className="flex animate-pulse flex-col gap-3">
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="h-8 w-16 rounded-full bg-slate-200" />
            <div className="h-3 w-32 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

const buildGlobalCards = (
  metrics: DashboardGlobalMetrics
): MetricCardProps[] => [
  {
    title: "Active Appointments",
    value: metrics.upcomingAppointments,
    description: "Consultations scheduled from today onwards.",
    icon: CalendarClock,
    spanClass: "md:col-span-6 xl:col-span-5 md:row-span-2",
    variant: "primary",
  },
  {
    title: "Total Appointments",
    value: metrics.totalAppointments,
    description: "Historical consultations across all centers.",
    icon: ClipboardList,
    spanClass: "md:col-span-6 xl:col-span-4",
  },
  {
    title: "Doctors",
    value: metrics.totalDoctors,
    description: "Registered medical specialists.",
    icon: Stethoscope,
    spanClass: "md:col-span-4 xl:col-span-3",
  },
  {
    title: "Employees",
    value: metrics.totalEmployees,
    description: "Support and administrative staff.",
    icon: Users2,
    spanClass: "md:col-span-4 xl:col-span-3",
  },
  {
    title: "Specialties",
    value: metrics.totalSpecialties,
    description: "Active medical specialties offered.",
    icon: UserCog,
    spanClass: "md:col-span-4 xl:col-span-3",
  },
  {
    title: "Medical Centers",
    value: metrics.totalCenters,
    description: "Branches currently in operation.",
    icon: Building2,
    spanClass: "md:col-span-6 xl:col-span-3",
  },
];

const buildCenterCards = (
  metrics: DashboardCenterMetrics
): MetricCardProps[] => [
  {
    title: "Active Appointments",
    value: metrics.upcomingAppointments,
    description: "Upcoming consultations for this center.",
    icon: CalendarClock,
    spanClass: "md:col-span-6 xl:col-span-5 md:row-span-2",
    variant: "primary",
  },
  {
    title: "Total Appointments",
    value: metrics.totalAppointments,
    description: "Consultations recorded in this center.",
    icon: ClipboardList,
    spanClass: "md:col-span-6 xl:col-span-4",
  },
  {
    title: "Doctors",
    value: metrics.doctors,
    description: "Assigned specialists.",
    icon: Stethoscope,
    spanClass: "md:col-span-4 xl:col-span-3",
  },
  {
    title: "Employees",
    value: metrics.employees,
    description: "Operational staff at this center.",
    icon: Users2,
    spanClass: "md:col-span-4 xl:col-span-3",
  },
  {
    title: "Specialties",
    value: metrics.specialties,
    description: "Unique specialties available here.",
    icon: UserCog,
    spanClass: "md:col-span-4 xl:col-span-3",
  },
];

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useDashboardMetrics();
  const [selectedCenterId, setSelectedCenterId] =
    useState<CenterSelection>("global");

  useEffect(() => {
    if (!data?.centers?.length) {
      setSelectedCenterId("global");
      return;
    }
    if (selectedCenterId !== "global") {
      const exists = data.centers.some(
        (center) => center.id === selectedCenterId
      );
      if (!exists) setSelectedCenterId("global");
    }
  }, [data, selectedCenterId]);

  const selectedCenter = useMemo(() => {
    if (!data || selectedCenterId === "global") return null;
    return (
      data.centers.find((center) => center.id === selectedCenterId) ?? null
    );
  }, [data, selectedCenterId]);

  const cards = useMemo(() => {
    if (!data) return [];
    return selectedCenterId === "global"
      ? buildGlobalCards(data.global)
      : buildCenterCards(data.centers.find((c) => c.id === selectedCenterId)!);
  }, [data, selectedCenterId]);

  const handleCenterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCenterId(
      !value || value === "global" ? "global" : Number(value)
    );
  };

  return (
    <section className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className={`text-3xl font-bold text-[${BLUE_PRIMARY}]`}>
          Executive Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Stay on top of the network performance with consolidated indicators
          and per-center insights.
        </p>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            className={`text-sm font-semibold uppercase tracking-[0.3em] text-[${BLUE_ACCENT}]`}
          >
            Performance Snapshot
          </h2>
          <p className="text-sm text-slate-600">
            {selectedCenterId === "global"
              ? "Viewing global metrics across every medical center in the network."
              : "Branch-level insights tailored for the selected medical center."}
          </p>
        </div>
        <div className="w-full md:max-w-sm">
          <label htmlFor="center" className="sr-only">
            Select medical center
          </label>
          <select
            id="center"
            className={`w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[${BLUE_PRIMARY}] focus:ring-2 focus:ring-[${BLUE_ACCENT}]`}
            value={
              selectedCenterId === "global"
                ? "global"
                : String(selectedCenterId)
            }
            onChange={handleCenterChange}
            disabled={!data}
          >
            <option value="global">All centers (Global)</option>
            {data?.centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCenter && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className={`text-base font-semibold text-[${BLUE_PRIMARY}]`}>
            {selectedCenter.name}
          </h3>
          <p className="text-sm text-slate-600">{selectedCenter.address}</p>
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid
          count={cards.length || 6}
          spanClass="md:col-span-6 xl:col-span-4"
        />
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load metrics
          {error instanceof Error ? `: ${error.message}` : "."}
        </div>
      ) : (
        <div className="grid auto-rows-[minmax(140px,auto)] gap-5 md:grid-cols-12">
          {cards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
