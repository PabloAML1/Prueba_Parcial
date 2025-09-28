import { useContext, useMemo } from "react";
import {
  CalendarClock,
  HeartPulse,
  UsersRound,
  MapPin,
  FileText,
  Stethoscope,
} from "lucide-react";
import { Ctx } from "../auth/AuthContext";
import { useAppointments, type Appointment } from "../appointments/api";
import {
  useCenterDetails,
  useSpecialtyDetails,
} from "./api";

const formatDisplayDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
};

const formatFullDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
};

const parseDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const isToday = (value: string) => {
  const parsed = parseDate(value);
  if (!parsed) {
    return false;
  }
  const today = new Date();
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  );
};

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description?: string;
  accent?: boolean;
}

const SummaryCard = ({ icon: Icon, title, value, description, accent }: SummaryCardProps) => (
  <div
    className={[
      "rounded-2xl border p-5 shadow-sm transition",
      accent
        ? "border-transparent bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-500 text-white shadow-blue-500/20"
        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md",
    ].join(" ")}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-[0.3em] ${
            accent ? "text-white/80" : "text-slate-500"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-3 text-3xl font-semibold ${
            accent ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </p>
        {description ? (
          <p className={`mt-2 text-sm ${accent ? "text-white/70" : "text-slate-600"}`}>
            {description}
          </p>
        ) : null}
      </div>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          accent ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </div>
);

const InfoCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
        {title}
      </p>
    </div>
    <div className="text-sm text-slate-700">{children}</div>
  </div>
);

const buildUpcomingList = (appointments: Appointment[]) => {
  return appointments
    .map((appointment) => ({
      appointment,
      date: parseDate(appointment.date),
    }))
    .filter((item) => item.date && item.date >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => (a.date && b.date ? a.date.getTime() - b.date.getTime() : 0))
    .map((item) => item.appointment);
};

const DashboardPage = () => {
  const auth = useContext(Ctx);
  const doctorProfile = auth?.user?.doctor ?? null;
  const doctorName = doctorProfile?.name ?? auth?.user?.name ?? "Doctor";
  const centerId = doctorProfile?.centerId ?? null;
  const specialtyId = doctorProfile?.specialtyId ?? null;
  const doctorId = doctorProfile?.id ?? null;

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
  } = useAppointments(doctorId ?? undefined);
  const { data: specialty, isLoading: specialtyLoading } =
    useSpecialtyDetails(specialtyId);
  const { data: center, isLoading: centerLoading } = useCenterDetails(centerId);

  const upcomingAppointments = useMemo(
    () => buildUpcomingList(appointments),
    [appointments]
  );

  const totalAppointments = appointments.length;
  const upcomingCount = upcomingAppointments.length;
  const todayCount = useMemo(
    () => upcomingAppointments.filter((item) => isToday(item.date)).length,
    [upcomingAppointments]
  );

  const uniquePatients = useMemo(() => {
    const set = new Set<string>();
    upcomingAppointments.forEach((appointment) => {
      if (appointment.patientName) {
        set.add(appointment.patientName.toLowerCase());
      }
    });
    return set.size;
  }, [upcomingAppointments]);

  const nextAppointment = upcomingAppointments[0] ?? null;
  const schedulePreview = upcomingAppointments.slice(0, 5);

  const loadingState = appointmentsLoading && !appointments.length;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500">
          Welcome back, {doctorName}.
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Keep saving lives today!
        </h1>
        {center?.name ? (
          <p className="text-sm text-slate-500">
            {center.name}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CalendarClock}
          title="Upcoming appointments"
          value={loadingState ? "--" : upcomingCount.toString()}
          description={
            loadingState
              ? "Checking your schedule..."
              : todayCount
              ? `${todayCount} scheduled for today`
              : "Everything is up to date."
          }
          accent
        />
        <SummaryCard
          icon={HeartPulse}
          title="Today’s patients"
          value={loadingState ? "--" : todayCount.toString()}
          description="Patients expecting to see you today"
        />
        <SummaryCard
          icon={UsersRound}
          title="Unique patients"
          value={loadingState ? "--" : uniquePatients.toString()}
          description="Patients in the upcoming schedule"
        />
        <SummaryCard
          icon={FileText}
          title="All appointments"
          value={loadingState ? "--" : totalAppointments.toString()}
          description="Total consultations recorded"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Upcoming schedule
              </h2>
              <p className="text-sm text-slate-500">
                {loadingState
                  ? "Loading your next visits..."
                  : upcomingCount
                  ? `Next ${Math.min(schedulePreview.length, upcomingCount)} of ${upcomingCount} upcoming appointments`
                  : "No upcoming appointments yet."}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loadingState ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex animate-pulse items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="flex-1 px-4">
                      <div className="h-3 w-28 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-40 rounded bg-slate-200" />
                    </div>
                    <div className="h-3 w-20 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : schedulePreview.length ? (
              schedulePreview.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {appointment.patientName || "Patient"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {appointment.description || "No additional notes"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDisplayDate(appointment.date)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {appointment.centerName || "Your center"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">
                Your upcoming schedule looks clear. New appointments will appear here as soon as they are booked.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <InfoCard icon={CalendarClock} title="Next appointment">
            {loadingState ? (
              <p>Checking your next visit...</p>
            ) : nextAppointment ? (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">
                  {nextAppointment.patientName || "Patient"}
                </p>
                <p className="text-slate-600">
                  {formatFullDate(nextAppointment.date)}
                </p>
                {nextAppointment.description ? (
                  <p className="text-slate-600">
                    {nextAppointment.description}
                  </p>
                ) : null}
              </div>
            ) : (
              <p>No appointments on the horizon. Enjoy the calm!</p>
            )}
          </InfoCard>

          <InfoCard icon={Stethoscope} title="Specialty focus">
            {specialtyLoading ? (
              <p>Loading your specialty...</p>
            ) : specialty ? (
              <div className="space-y-2 text-sm">
                <p className="text-base font-semibold text-slate-900">
                  {specialty.name}
                </p>
                <p className="text-slate-600">{specialty.description || "No description available."}</p>
              </div>
            ) : (
              <p>We were not able to load your specialty details.</p>
            )}
          </InfoCard>

          <InfoCard icon={MapPin} title="Hospital">
            {centerLoading ? (
              <p>Loading your medical center...</p>
            ) : center ? (
              <div className="space-y-2 text-sm">
                <p className="text-base font-semibold text-slate-900">
                  {center.name}
                </p>
                <p className="text-slate-600">
                  {center.address || "No address on file."}
                </p>
              </div>
            ) : (
              <p>We were not able to load your hospital information.</p>
            )}
          </InfoCard>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
