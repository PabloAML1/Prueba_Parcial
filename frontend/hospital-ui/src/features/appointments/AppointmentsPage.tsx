import { useContext, useEffect, useMemo, useState } from "react";
import Toolbar from "../../components/Toolbar";
import { DataTable, type DataTableColumn } from "../../components/Table";
import Paginator from "../../components/Paginator";
import FormDialog, {
  type FormFieldConfig,
  type FormValues,
} from "../../components/FormDialog";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  type Appointment,
} from "./api";
import { Ctx } from "../auth/AuthContext";

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
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const columns: DataTableColumn<Appointment>[] = [
  {
    id: "date",
    header: "Date",
    cell: (row) => (
      <span className="whitespace-nowrap font-medium text-slate-800">
        {formatDisplayDate(row.date)}
      </span>
    ),
  },
  {
    id: "patient",
    header: "Patient",
    field: "patientName",
    className: "font-medium text-slate-900",
  },
  {
    id: "description",
    header: "Description",
    field: "description",
    className: "max-w-2xl",
  },
  {
    id: "center",
    header: "Center",
    cell: (row) => row.centerName ?? "-",
    className: "text-slate-600",
  },
];

const appointmentFormFields: FormFieldConfig<Appointment>[] = [
  {
    name: "date",
    label: "Appointment date",
    type: "date",
    required: true,
    autoFocus: true,
  },
  {
    name: "patientName",
    label: "Patient name",
    placeholder: "Enter the patient's full name",
    required: true,
  },
  {
    name: "description",
    label: "Notes",
    type: "textarea",
    placeholder: "Reason for the visit or any relevant notes",
    description:
      "Provide enough context so your team can prepare ahead of time.",
    required: true,
  },
];

const actionButtonClasses =
  "inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100";

const toTrimmedString = (value: unknown) =>
  typeof value === "string"
    ? value.trim()
    : value === undefined || value === null
    ? ""
    : String(value);

const AppointmentsPage = () => {
  const auth = useContext(Ctx);
  const authLoading = auth?.loading ?? false;
  const doctorId = auth?.user?.doctor?.id ?? null;
  const doctorName = auth?.user?.doctor?.name ?? auth?.user?.name ?? "";
  const centerName = auth?.user?.doctor?.centerName ?? null;
  const specialtyName = auth?.user?.doctor?.specialtyName ?? null;

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useAppointments(doctorId ?? undefined);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return appointments;
    }

    return appointments.filter((appointment) => {
      const haystack = `${appointment.date} ${appointment.patientName} ${
        appointment.description
      } ${appointment.centerName ?? ""}`;
      return haystack.toLowerCase().includes(term);
    });
  }, [appointments, search]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    setPage((prev) => Math.min(prev, totalPages));
  }, [filteredRows.length, pageSize]);

  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, page, pageSize]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(1, nextPage));
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const handleCreateSubmit = async (values: FormValues<Appointment>) => {
    if (!doctorId) {
      throw new Error("Doctor information is not available yet.");
    }

    const date = toTrimmedString(values.date);
    const patientName = toTrimmedString(values.patientName);
    const description = toTrimmedString(values.description);

    try {
      await createMutation.mutateAsync({
        date,
        patientName,
        description,
        medicoId: doctorId,
      });
      setSearch("");
      setPage(1);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create the appointment.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleEditSubmit = async (values: FormValues<Appointment>) => {
    if (!doctorId || !editingAppointment) {
      return;
    }

    const date = toTrimmedString(values.date) || editingAppointment.date;
    const patientName =
      toTrimmedString(values.patientName) || editingAppointment.patientName;
    const description =
      toTrimmedString(values.description) || editingAppointment.description;

    try {
      await updateMutation.mutateAsync({
        id: editingAppointment.id,
        payload: {
          date,
          patientName,
          description,
          medicoId: doctorId,
        },
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update the appointment.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    if (!doctorId) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel the appointment with ${appointment.patientName}?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        id: appointment.id,
        medicoId: doctorId,
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete the appointment.";
      window.alert(message);
    }
  };

  const deleteInFlightId =
    deleteMutation.isPending && deleteMutation.variables
      ? deleteMutation.variables.id
      : null;
  const hasProfile = !authLoading && Boolean(doctorId);
  const isBusy = isLoading || authLoading;
  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <section className="flex flex-col gap-4">
      <Toolbar
        title="Appointments"
        subtitle={
          doctorName && specialtyName && centerName
            ? `Dr. ${doctorName} | ${specialtyName} Department | ${centerName} Hospital`
            : `Welcome! Please complete your doctor profile to manage appointments.`
        }
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by patient, date, or notes..."
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Schedule appointment"
        isCreateDisabled={createMutation.isPending || !hasProfile}
      />

      {!hasProfile ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {authLoading
            ? "Loading your profile..."
            : "We couldn't load your doctor profile. Please sign in again."}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load appointments{errorMessage ? `: ${errorMessage}` : "."}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={paginatedRows}
        rowKey={(row) => row.id}
        striped
        compact
        isLoading={isBusy}
        loadingRowCount={pageSize}
        emptyMessage={
          search
            ? "No appointments match your search."
            : "No appointments have been scheduled yet."
        }
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={actionButtonClasses}
              onClick={(event) => {
                event.stopPropagation();
                setEditingAppointment(row);
              }}
              disabled={
                updateMutation.isPending && editingAppointment?.id === row.id
              }
            >
              Edit
            </button>
            <button
              type="button"
              className={`${actionButtonClasses} text-red-600 hover:bg-red-50`}
              onClick={(event) => {
                event.stopPropagation();
                void handleDelete(row);
              }}
              disabled={deleteMutation.isPending && deleteInFlightId === row.id}
            >
              {deleteMutation.isPending && deleteInFlightId === row.id
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        )}
      />

      <Paginator
        page={page}
        pageSize={pageSize}
        totalItems={filteredRows.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        summaryLabel="appointments"
        pageSizeOptions={[5, 10, 20]}
        isLoading={isBusy}
      />

      <FormDialog<Appointment>
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule appointment"
        description="Provide the details for the new consultation."
        fields={appointmentFormFields}
        initialValues={{ date: "", patientName: "", description: "" }}
        onSubmit={handleCreateSubmit}
        submitLabel={createMutation.isPending ? "Saving..." : "Create"}
        isSubmitting={createMutation.isPending}
      />

      <FormDialog<Appointment>
        open={Boolean(editingAppointment)}
        onClose={() => setEditingAppointment(null)}
        title="Edit appointment"
        description="Update the information for this consultation."
        fields={appointmentFormFields}
        initialValues={editingAppointment ?? undefined}
        onSubmit={handleEditSubmit}
        submitLabel={updateMutation.isPending ? "Saving..." : "Save changes"}
        isSubmitting={updateMutation.isPending}
      />
    </section>
  );
};

export default AppointmentsPage;
