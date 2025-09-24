import { useEffect, useMemo, useState } from "react";
import Toolbar from "../../components/Toolbar";
import { DataTable, type DataTableColumn } from "../../components/Table";
import Paginator from "../../components/Paginator";
import FormDialog, {
  type FormFieldConfig,
  type FormValues,
} from "../../components/FormDialog";
import {
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  type Specialty,
} from "./api";

const columns: DataTableColumn<Specialty>[] = [
  { id: "name", header: "Name", field: "name" },
  {
    id: "description",
    header: "Description",
    field: "description",
    className: "max-w-2xl",
  },
];

const specialtyFormFields: FormFieldConfig<Specialty>[] = [
  {
    name: "name",
    label: "Name",
    placeholder: "Enter the specialty name",
    required: true,
    autoFocus: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe this specialty",
    description:
      "Explain what conditions this specialty treats or any relevant notes.",
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

const SpecialtiesPage = () => {
  const {
    data: specialties = [],
    isLoading,
    isError,
    error,
  } = useSpecialties();
  const createMutation = useCreateSpecialty();
  const updateMutation = useUpdateSpecialty();
  const deleteMutation = useDeleteSpecialty();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return specialties;
    }

    return specialties.filter((specialty) =>
      `${specialty.name} ${specialty.description}`.toLowerCase().includes(term)
    );
  }, [specialties, search]);

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

  const handleCreateSubmit = async (values: FormValues<Specialty>) => {
    const name = toTrimmedString(values.name);
    const description = toTrimmedString(values.description);

    try {
      await createMutation.mutateAsync({ name, description });
      setSearch("");
      setPage(1);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create specialty.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleEditSubmit = async (values: FormValues<Specialty>) => {
    if (!editingSpecialty) {
      return;
    }

    const name = toTrimmedString(values.name) || editingSpecialty.name;
    const description =
      toTrimmedString(values.description) || editingSpecialty.description;

    try {
      await updateMutation.mutateAsync({
        id: editingSpecialty.id,
        payload: { name, description },
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update specialty.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleDelete = async (specialty: Specialty) => {
    const confirmed = window.confirm(`Delete ${specialty.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(specialty.id);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete specialty.";
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
        title="Medical Specialties"
        subtitle="Example CRUD screen using shared table, toolbar, paginator, and form components backed by the API."
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search specialties..."
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add specialty"
        isCreateDisabled={createMutation.isPending}
      />

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load specialties{errorMessage ? `: ${errorMessage}` : "."}
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
            ? "No specialties match your search."
            : "No specialties have been added yet."
        }
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={actionButtonClasses}
              onClick={(event) => {
                event.stopPropagation();
                setEditingSpecialty(row);
              }}
              disabled={
                updateMutation.isPending && editingSpecialty?.id === row.id
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
        summaryLabel="specialties"
        pageSizeOptions={[5, 10, 20]}
        isLoading={isLoading}
      />

      <FormDialog<Specialty>
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add specialty"
        description="Provide the details for the new specialty."
        fields={specialtyFormFields}
        initialValues={{ name: "", description: "" }}
        onSubmit={handleCreateSubmit}
        submitLabel="Create"
        isSubmitting={createMutation.isPending}
      />

      <FormDialog<Specialty>
        open={Boolean(editingSpecialty)}
        onClose={() => setEditingSpecialty(null)}
        title="Edit specialty"
        description="Update the information for this specialty."
        fields={specialtyFormFields}
        initialValues={editingSpecialty ?? undefined}
        onSubmit={handleEditSubmit}
        submitLabel={updateMutation.isPending ? "Saving..." : "Save changes"}
        isSubmitting={updateMutation.isPending}
      />
    </section>
  );
};

export default SpecialtiesPage;
