import { useEffect, useMemo, useState } from "react";
import Toolbar from "../../components/Toolbar";
import { DataTable, type DataTableColumn } from "../../components/Table";
import Paginator from "../../components/Paginator";
import FormDialog, {
  type FormFieldConfig,
  type FormValues,
} from "../../components/FormDialog";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  type Employee,
} from "./api";
import { useHospitals } from "../hospitals/api";

interface EmployeeFormValues extends Record<string, unknown> {
  name: string;
  role: string;
  salary: string;
  centerId: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const columns: DataTableColumn<Employee>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "role", header: "Role", field: "role" },
  {
    id: "salary",
    header: "Salary",
    align: "right",
    cell: (row) => currencyFormatter.format(row.salary ?? 0),
  },
  { id: "center", header: "Center", field: "centerName", className: "max-w-xs" },
];

const actionButtonClasses =
  "inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100";

const emptyForm: EmployeeFormValues = {
  name: "",
  role: "",
  salary: "",
  centerId: "",
};

const toTrimmedString = (value: unknown) =>
  typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value);

const EmployeesPage = () => {
  const { data: employees = [], isLoading, isError, error } = useEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const { data: centers = [], isLoading: centersLoading } = useHospitals();

  const centerOptions = useMemo(
    () =>
      centers.map((center) => ({
        value: center.id,
        label: center.name,
      })),
    [centers],
  );

  const formFields: FormFieldConfig<EmployeeFormValues>[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        placeholder: "Enter employee name",
        required: true,
        autoFocus: true,
      },
      {
        name: "role",
        label: "Role",
        placeholder: "Enter job title",
        required: true,
      },
      {
        name: "salary",
        label: "Salary",
        type: "number",
        placeholder: "Enter salary amount",
        required: true,
        inputProps: { min: "0", step: "0.01" },
      },
      {
        name: "centerId",
        label: "Center",
        type: "select",
        placeholder: centerOptions.length ? "Select a center" : "No centers available",
        options: centerOptions,
        required: true,
        disabled: centersLoading || centerOptions.length === 0,
      },
    ],
    [centerOptions, centersLoading],
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return employees;
    }

    return employees.filter((employee) =>
      `${employee.name} ${employee.role} ${employee.centerName ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [employees, search]);

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

  const parseSalary = (value: unknown) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      throw new Error("Salary must be a valid number.");
    }
    return numeric;
  };

  const parseCenterId = (value: unknown) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      throw new Error("A valid center is required.");
    }
    return numeric;
  };

  const handleCreateSubmit = async (values: FormValues<EmployeeFormValues>) => {
    const name = toTrimmedString(values.name);
    const role = toTrimmedString(values.role);

    try {
      await createMutation.mutateAsync({
        name,
        role,
        salary: parseSalary(values.salary),
        centerId: parseCenterId(values.centerId),
      });
      setSearch("");
      setPage(1);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "Failed to create employee.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleEditSubmit = async (values: FormValues<EmployeeFormValues>) => {
    if (!editingEmployee) {
      return;
    }

    const name = toTrimmedString(values.name) || editingEmployee.name;
    const role = toTrimmedString(values.role) || editingEmployee.role;
    const salary =
      values.salary === undefined || values.salary === ""
        ? editingEmployee.salary
        : parseSalary(values.salary);

    const resolveExistingCenterId = () => {
      if (editingEmployee.centerId && editingEmployee.centerId > 0) {
        return editingEmployee.centerId;
      }
      throw new Error("A valid center is required.");
    };

    const centerId =
      values.centerId === undefined || values.centerId === ""
        ? resolveExistingCenterId()
        : parseCenterId(values.centerId);

    try {
      await updateMutation.mutateAsync({
        id: editingEmployee.id,
        payload: {
          name,
          role,
          salary,
          centerId,
        },
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "Failed to update employee.";
      window.alert(message);
      throw mutationError;
    }
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(`Delete ${employee.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(employee.id);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "Failed to delete employee.";
      window.alert(message);
    }
  };

  const deleteInFlightId = deleteMutation.isPending ? deleteMutation.variables ?? null : null;
  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <section className="flex flex-col gap-4">
      <Toolbar
        title="Employees"
        subtitle="Manage employees and their assigned centers."
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search employees..."
        onCreate={() => setIsCreateOpen(true)}
        createLabel="Add employee"
        isCreateDisabled={createMutation.isPending || centersLoading || centerOptions.length === 0}
      />

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load employees{errorMessage ? `: ${errorMessage}` : "."}
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
            ? "No employees match your search."
            : "No employees have been added yet."
        }
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={actionButtonClasses}
              onClick={(event) => {
                event.stopPropagation();
                setEditingEmployee(row);
              }}
              disabled={updateMutation.isPending && editingEmployee?.id === row.id}
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
              {deleteMutation.isPending && deleteInFlightId === row.id ? "Deleting..." : "Delete"}
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
        summaryLabel="employees"
        pageSizeOptions={[5, 10, 20]}
        isLoading={isLoading}
      />

      <FormDialog<EmployeeFormValues>
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add employee"
        description="Provide the information for the new employee."
        fields={formFields}
        initialValues={emptyForm}
        onSubmit={handleCreateSubmit}
        submitLabel="Create"
        isSubmitting={createMutation.isPending}
      />

      <FormDialog<EmployeeFormValues>
        open={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title="Edit employee"
        description="Update the information for this employee."
        fields={formFields}
        initialValues={
          editingEmployee
            ? {
                name: editingEmployee.name,
                role: editingEmployee.role,
                salary: String(editingEmployee.salary ?? ""),
                centerId: editingEmployee.centerId ? String(editingEmployee.centerId) : "",
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

export default EmployeesPage;
