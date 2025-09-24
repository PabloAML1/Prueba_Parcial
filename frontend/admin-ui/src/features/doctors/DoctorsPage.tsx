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
} from "./api";
import { useHospitals } from "../hospitals/api";
import { useSpecialties } from "../specialties/api";

interface DoctorFormValues extends Record<string, unknown> {
  name: string;
  specialtyId: string;
  centerId: string;
}

const columns: DataTableColumn<Doctor>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "specialty", header: "Specialty", field: "specialtyName" },
  { id: "center", header: "Center", field: "centerName" },
];

const actionButtonClasses =
  "inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100";

const emptyForm: DoctorFormValues = {
  name: "",
  specialtyId: "",
  centerId: "",
};

const toTrimmedString = (value: unknown) =>
  typeof value === "string"
    ? value.trim()
    : value === undefined || value === null
    ? ""
    : String(value);

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

  const formFields: FormFieldConfig<DoctorFormValues>[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        placeholder: "Enter doctor's name",
        required: true,
        autoFocus: true,
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
      `${doctor.name} ${doctor.specialtyName ?? ""} ${doctor.centerName ?? ""}`
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

  const parseId = (value: unknown, message: string) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      throw new Error(message);
    }
    return numeric;
  };

  const handleCreateSubmit = async (values: FormValues<DoctorFormValues>) => {
    const name = toTrimmedString(values.name);

    try {
      await createMutation.mutateAsync({
        name,
        specialtyId: parseId(
          values.specialtyId,
          "A valid specialty is required."
        ),
        centerId: parseId(values.centerId, "A valid center is required."),
      });
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

    const name = toTrimmedString(values.name) || editingDoctor.name;
    const resolveExistingSpecialtyId = () => {
      if (editingDoctor.specialtyId && editingDoctor.specialtyId > 0) {
        return editingDoctor.specialtyId;
      }
      throw new Error("A valid specialty is required.");
    };

    const resolveExistingCenterId = () => {
      if (editingDoctor.centerId && editingDoctor.centerId > 0) {
        return editingDoctor.centerId;
      }
      throw new Error("A valid center is required.");
    };

    const specialtyId =
      values.specialtyId === undefined || values.specialtyId === ""
        ? resolveExistingSpecialtyId()
        : parseId(values.specialtyId, "A valid specialty is required.");

    const centerId =
      values.centerId === undefined || values.centerId === ""
        ? resolveExistingCenterId()
        : parseId(values.centerId, "A valid center is required.");

    try {
      await updateMutation.mutateAsync({
        id: editingDoctor.id,
        payload: {
          name,
          specialtyId,
          centerId,
        },
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
        subtitle="Manage doctors, their specialties, and assigned centers."
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search doctors..."
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
        fields={formFields}
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
        fields={formFields}
        initialValues={
          editingDoctor
            ? {
                name: editingDoctor.name,
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
