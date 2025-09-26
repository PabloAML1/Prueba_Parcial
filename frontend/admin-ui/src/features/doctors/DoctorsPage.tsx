import { useEffect, useMemo, useState } from "react";
import Toolbar from "../../components/Toolbar";
import { DataTable, type DataTableColumn } from "../../components/Table";
import Paginator from "../../components/Paginator";
import FormDialog, {
  type FormFieldConfig,
  type FormValues,
} from "../../components/FormDialog";
import {
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
  type Doctor,
  type DoctorCreatePayload,
  type DoctorUpdatePayload,
} from "./api";
import { useHospitals } from "../hospitals/api";
import { useSpecialties } from "../specialties/api";

interface DoctorFormValues extends Record<string, unknown> {
  name: string;
  email: string;
  password: string;
  specialtyId: string;
  centerId: string;
}

const PASSWORD_PREVIEW_LENGTH = 12;

const passwordPreview = (value: string) => {
  if (!value) {
    return "-";
  }

  if (value.length <= PASSWORD_PREVIEW_LENGTH) {
    return value;
  }

  return `${value.slice(0, PASSWORD_PREVIEW_LENGTH)}…`;
};

const columns: DataTableColumn<Doctor>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "email", header: "Email", field: "email" },
  {
    id: "password",
    header: "Password",
    cell: (row) => passwordPreview(row.password),
  },
  { id: "specialty", header: "Specialty", field: "specialtyName" },
  { id: "center", header: "Center", field: "centerName" },
];

const actionButtonClasses =
  "inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100";

const emptyForm: DoctorFormValues = {
  name: "",
  email: "",
  password: "",
  specialtyId: "",
  centerId: "",
};

const toTrimmedString = (value: unknown) =>
  typeof value === "string"
    ? value.trim()
    : value === undefined || value === null
    ? ""
    : String(value);

const resolveNumericField = (
  rawValue: unknown,
  currentValue: number | null,
  message: string
) => {
  if (rawValue === undefined || rawValue === "") {
    if (currentValue && currentValue > 0) {
      return currentValue;
    }
    throw new Error(message);
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(message);
  }
  return numeric;
};

const DoctorsPage = () => {
  const { data: doctors = [], isLoading, isError, error } = useDoctors();
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();
  const { data: centers = [], isLoading: centersLoading } = useHospitals();
  const { data: specialties = [], isLoading: specialtiesLoading } =
    useSpecialties();

  const centerOptions = useMemo(
    () =>
      centers.map((center) => ({
        value: center.id,
        label: center.name,
      })),
    [centers]
  );

  const specialtyOptions = useMemo(
    () =>
      specialties.map((specialty) => ({
        value: specialty.id,
        label: specialty.name,
      })),
    [specialties]
  );

  const createFields: FormFieldConfig<DoctorFormValues>[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        placeholder: "Enter doctor's name",
        required: true,
        autoFocus: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "doctor@example.com",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Provide a temporary password",
        required: true,
        description: "Share this password securely with the doctor.",
      },
      {
        name: "specialtyId",
        label: "Specialty",
        type: "select",
        placeholder: specialtyOptions.length
          ? "Select a specialty"
          : "No specialties available",
        options: specialtyOptions,
        required: true,
        disabled: specialtiesLoading || specialtyOptions.length === 0,
      },
      {
        name: "centerId",
        label: "Center",
        type: "select",
        placeholder: centerOptions.length
          ? "Select a center"
          : "No centers available",
        options: centerOptions,
        required: true,
        disabled: centersLoading || centerOptions.length === 0,
      },
    ],
    [centerOptions, centersLoading, specialtyOptions, specialtiesLoading]
  );

  const editFields: FormFieldConfig<DoctorFormValues>[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        placeholder: "Enter doctor's name",
        required: true,
        autoFocus: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "doctor@example.com",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Leave blank to keep current password",
        description: "Leave blank to keep the existing password.",
      },
      {
        name: "specialtyId",
        label: "Specialty",
        type: "select",
        placeholder: specialtyOptions.length
          ? "Select a specialty"
          : "No specialties available",
        options: specialtyOptions,
        required: true,
        disabled: specialtiesLoading || specialtyOptions.length === 0,
      },
      {
        name: "centerId",
        label: "Center",
        type: "select",
        placeholder: centerOptions.length
          ? "Select a center"
          : "No centers available",
        options: centerOptions,
        required: true,
        disabled: centersLoading || centerOptions.length === 0,
      },
    ],
    [centerOptions, centersLoading, specialtyOptions, specialtiesLoading]
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return doctors;
    }

    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.email ?? ""} ${
        doctor.specialtyName ?? ""
      } ${doctor.centerName ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [doctors, search]);

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

  const buildCreatePayload = (values: FormValues<DoctorFormValues>): DoctorCreatePayload => {
    const name = toTrimmedString(values.name);
    const email = toTrimmedString(values.email);
    const password = toTrimmedString(values.password);

    if (!name) {
      throw new Error("A name is required.");
    }
    if (!email) {
      throw new Error("An email is required.");
    }
    if (!password) {
      throw new Error("A password is required.");
    }

    return {
      name,
      email,
      password,
      specialtyId: resolveNumericField(values.specialtyId, null, "A valid specialty is required."),
      centerId: resolveNumericField(values.centerId, null, "A valid center is required."),
    };
  };

  const buildUpdatePayload = (
    current: Doctor,
    values: FormValues<DoctorFormValues>
  ): DoctorUpdatePayload => {
    const name = toTrimmedString(values.name) || current.name;
    const email = toTrimmedString(values.email) || current.email;

    if (!email) {
      throw new Error("An email is required.");
    }

    const specialtyId = resolveNumericField(
      values.specialtyId,
      current.specialtyId,
      "A valid specialty is required."
    );

    const centerId = resolveNumericField(
      values.centerId,
      current.centerId,
      "A valid center is required."
    );

    const password = toTrimmedString(values.password);

    return {
      name,
      email,
      password: password || undefined,
      specialtyId,
      centerId,
    };
  };

  const handleCreateSubmit = async (values: FormValues<DoctorFormValues>) => {
    try {
      const payload = buildCreatePayload(values);
      await createMutation.mutateAsync(payload);
      setSearch("");
      setPage(1);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create doctor.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleEditSubmit = async (values: FormValues<DoctorFormValues>) => {
    if (!editingDoctor) {
      return;
    }

    try {
      const payload = buildUpdatePayload(editingDoctor, values);
      await updateMutation.mutateAsync({
        id: editingDoctor.id,
        payload,
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update doctor.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    const confirmed = window.confirm(`Delete ${doctor.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(doctor.id);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete doctor.";
      window.alert(message);
      throw mutationError;
    }
  };

  const deleteInFlightId = deleteMutation.isPending
    ? deleteMutation.variables ?? null
    : null;
  const errorMessage = isError && error instanceof Error ? error.message : null;

  const disableFormActions =
    createMutation.isPending ||
    specialtiesLoading ||
    centersLoading ||
    specialtyOptions.length === 0 ||
    centerOptions.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <Toolbar
        title="Doctors"
        subtitle="Manage doctors, their login credentials, specialties, and assigned centers."
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search doctors by name or email..."
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add doctor"
        isCreateDisabled={disableFormActions}
      />

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load doctors{errorMessage ? `: ${errorMessage}` : "."}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={paginatedRows}
        rowKey={(row) => row.id}
        striped
        compact
        isLoading={isLoading}
        loadingRowCount={pageSize}
        emptyMessage={
          search
            ? "No doctors match your search."
            : "No doctors have been added yet."
        }
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={actionButtonClasses}
              onClick={(event) => {
                event.stopPropagation();
                setEditingDoctor(row);
              }}
              disabled={
                updateMutation.isPending && editingDoctor?.id === row.id
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
        summaryLabel="doctors"
        pageSizeOptions={[5, 10, 20]}
        isLoading={isLoading}
      />

      <FormDialog<DoctorFormValues>
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add doctor"
        description="Provide the details for the new doctor."
        fields={createFields}
        initialValues={emptyForm}
        onSubmit={handleCreateSubmit}
        submitLabel="Create"
        isSubmitting={createMutation.isPending}
      />

      <FormDialog<DoctorFormValues>
        open={Boolean(editingDoctor)}
        onClose={() => setEditingDoctor(null)}
        title="Edit doctor"
        description="Update the information for this doctor."
        fields={editFields}
        initialValues={
          editingDoctor
            ? {
                name: editingDoctor.name,
                email: editingDoctor.email,
                password: "",
                specialtyId: editingDoctor.specialtyId
                  ? String(editingDoctor.specialtyId)
                  : "",
                centerId: editingDoctor.centerId
                  ? String(editingDoctor.centerId)
                  : "",
              }
            : undefined
        }
        onSubmit={handleEditSubmit}
        submitLabel={updateMutation.isPending ? "Saving..." : "Save changes"}
        isSubmitting={updateMutation.isPending}
      />
    </section>
  );
};

export default DoctorsPage;
