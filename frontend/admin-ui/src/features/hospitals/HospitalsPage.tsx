import { useEffect, useMemo, useState } from "react";
import Toolbar from "../../components/Toolbar";
import { DataTable, type DataTableColumn } from "../../components/Table";
import Paginator from "../../components/Paginator";
import FormDialog, {
  type FormFieldConfig,
  type FormValues,
} from "../../components/FormDialog";
import {
  useHospitals,
  useCreateHospitals,
  useUpdateHospital,
  useDeleteHospital,
  type Hospital,
} from "./api";

const columns: DataTableColumn<Hospital>[] = [
  { id: "name", header: "Name", field: "name" },
  {
    id: "address",
    header: "Address",
    field: "address",
    className: "max-w-2xl",
  },
];

const hospitalFormFields: FormFieldConfig<Hospital>[] = [
  {
    name: "name",
    label: "Name",
    placeholder: "Enter the hospital name",
    required: true,
    autoFocus: true,
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter the address of the hospital",
    description:
      "Enter the full address, including street, city, and any relevant details",
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

const HospitalsPage = () => {
  const { data: hospitals = [], isLoading, isError, error } = useHospitals();
  const createMutation = useCreateHospitals();
  const updateMutation = useUpdateHospital();
  const deleteMutation = useDeleteHospital();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return hospitals;
    }

    return hospitals.filter((hospital) =>
      `${hospital.name} ${hospital.address}`.toLowerCase().includes(term)
    );
  }, [hospitals, search]);

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

  const handleCreateSubmit = async (values: FormValues<Hospital>) => {
    const name = toTrimmedString(values.name);
    const address = toTrimmedString(values.address);

    try {
      await createMutation.mutateAsync({ name, address });
      setSearch("");
      setPage(1);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create hospital.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleEditSubmit = async (values: FormValues<Hospital>) => {
    if (!editingHospital) {
      return;
    }

    const name = toTrimmedString(values.name) || editingHospital.name;
    const address =
      toTrimmedString(values.address) || editingHospital.address;

    try {
      await updateMutation.mutateAsync({
        id: editingHospital.id,
        payload: { name, address },
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update hospital.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleDelete = async (hospital: Hospital) => {
    const confirmed = window.confirm(`Delete ${hospital.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(hospital.id);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete hospital.";
      window.alert(message);
    }
  };

  const deleteInFlightId = deleteMutation.isPending
    ? deleteMutation.variables ?? null
    : null;
  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <section className="flex flex-col gap-4">
      <Toolbar
        title="Centros Hospitalarios"
        subtitle="Maneja los centros hospitalarios disponibles en el sistema"
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search hospitals..."
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add hospital"
        isCreateDisabled={createMutation.isPending}
      />

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load hospitals{errorMessage ? `: ${errorMessage}` : "."}
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
            ? "No hospitals match your search."
            : "No hospitals have been added yet."
        }
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={actionButtonClasses}
              onClick={(event) => {
                event.stopPropagation();
                setEditingHospital(row);
              }}
              disabled={
                updateMutation.isPending && editingHospital?.id === row.id
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
        summaryLabel="hospitals"
        pageSizeOptions={[5, 10, 20]}
        isLoading={isLoading}
      />

      <FormDialog<Hospital>
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add hospital"
        description="Provide the details for the new hospital."
        fields={hospitalFormFields}
        initialValues={{ name: "", address: "" }}
        onSubmit={handleCreateSubmit}
        submitLabel="Create"
        isSubmitting={createMutation.isPending}
      />

      <FormDialog<Hospital>
        open={Boolean(editingHospital)}
        onClose={() => setEditingHospital(null)}
        title="Edit hospital"
        description="Update the information for this hospital."
        fields={hospitalFormFields}
        initialValues={editingHospital ?? undefined}
        onSubmit={handleEditSubmit}
        submitLabel={updateMutation.isPending ? "Saving..." : "Save changes"}
        isSubmitting={updateMutation.isPending}
      />
    </section>
  );
};

export default HospitalsPage;
